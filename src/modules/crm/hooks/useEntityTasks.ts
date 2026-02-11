import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/core/auth';
import type { Task } from './useTasks';

export type EntityType = 'contact' | 'deal' | 'company';

interface CreateTaskData {
  title: string;
  description?: string;
  type: Task['type'];
  priority: Task['priority'];
  due_at: string;
  assigned_to?: string;
}

// Hook unificado para buscar tarefas de qualquer entidade
export function useEntityTasks(
  entityType: EntityType,
  entityId: string | undefined,
  options?: {
    includeCompleted?: boolean;
    limit?: number;
  }
) {
  const { organizationId } = useOrganization();
  
  return useQuery({
    queryKey: ['tasks', entityType, entityId, options],
    queryFn: async () => {
      if (!entityId || !organizationId) return [];
      
      // Build the query based on entity type
      let query = supabase
        .from('crm_tasks')
        .select(`
          *,
          assigned_user:assigned_to(id, full_name, email)
        `)
        .eq('organization_id', organizationId)
        .eq('entity_type', entityType);
      
      // Add entity-specific filter
      switch (entityType) {
        case 'contact':
          query = query.eq('contact_org_id', entityId);
          break;
        case 'deal':
          query = query.eq('deal_id', entityId);
          break;
        case 'company':
          query = query.eq('company_id', entityId);
          break;
      }
      
      // Filter by status
      if (!options?.includeCompleted) {
        query = query.in('status', ['pending', 'overdue']);
      }
      
      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      // Order by due date and priority
      query = query
        .order('status', { ascending: true })
        .order('due_at', { ascending: true })
        .order('priority', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Mark overdue tasks
      return (data || []).map(task => ({
        ...task,
        status: task.status === 'pending' && new Date(task.due_at) < new Date() 
          ? 'overdue' 
          : task.status,
      }));
    },
    enabled: !!entityId && !!organizationId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook para criar tarefa em qualquer entidade
export function useCreateEntityTask(entityType: EntityType) {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();
  
  return useMutation({
    mutationFn: async ({
      entityId,
      data,
    }: {
      entityId: string;
      data: CreateTaskData;
    }) => {
      if (!organizationId) throw new Error('No organization');
      
      // Prepare the insert data
      const insertData: any = {
        organization_id: organizationId,
        entity_type: entityType,
        ...data,
        status: 'pending',
      };
      
      // Set the appropriate entity ID
      switch (entityType) {
        case 'contact':
          insertData.contact_org_id = entityId;
          break;
        case 'deal':
          insertData.deal_id = entityId;
          break;
        case 'company':
          insertData.company_id = entityId;
          break;
      }
      
      const { data: task, error } = await supabase
        .from('crm_tasks')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return task;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries for this entity
      queryClient.invalidateQueries({
        queryKey: ['tasks', entityType, variables.entityId],
      });
      
      // Also invalidate dashboard metrics
      queryClient.invalidateQueries({
        queryKey: ['dashboard-metrics'],
      });
    },
  });
}

// Hook para completar tarefa
export function useCompleteEntityTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      taskId,
      outcome,
    }: {
      taskId: string;
      outcome?: string;
    }) => {
      const { data, error } = await supabase
        .from('crm_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          outcome,
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (task) => {
      // Invalidate all task queries for this entity
      queryClient.invalidateQueries({
        queryKey: ['tasks', task.entity_type],
      });
      
      // Invalidate dashboard metrics
      queryClient.invalidateQueries({
        queryKey: ['dashboard-metrics'],
      });
    },
  });
}

// Hook para atualizar tarefa
export function useUpdateEntityTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: Partial<CreateTaskData>;
    }) => {
      const { data, error } = await supabase
        .from('crm_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', task.entity_type],
      });
    },
  });
}

// Hook para deletar tarefa
export function useDeleteEntityTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      // First get the task to know its entity type
      const { data: task } = await supabase
        .from('crm_tasks')
        .select('entity_type, contact_org_id, deal_id, company_id')
        .eq('id', taskId)
        .single();
      
      const { error } = await supabase
        .from('crm_tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      return task;
    },
    onSuccess: (task) => {
      if (task) {
        queryClient.invalidateQueries({
          queryKey: ['tasks', task.entity_type],
        });
      }
    },
  });
}

// Hook para tarefas urgentes/próximas (dashboard)
export function useUpcomingTasks(limit: number = 5) {
  const { organizationId } = useOrganization();
  
  return useQuery({
    queryKey: ['upcoming-tasks', organizationId, limit],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('crm_tasks')
        .select(`
          *,
          assigned_user:assigned_to(id, full_name, email),
          deal:deals(id, title, amount),
          contact:contact_orgs(
            id,
            contact:contacts(full_name, email)
          ),
          company:companies(id, name)
        `)
        .eq('organization_id', organizationId)
        .in('status', ['pending', 'overdue'])
        .order('due_at', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      
      return (data || []).map(task => ({
        ...task,
        status: task.status === 'pending' && new Date(task.due_at) < new Date() 
          ? 'overdue' 
          : task.status,
        entity_display: task.entity_type === 'deal' 
          ? task.deal?.title 
          : task.entity_type === 'contact'
          ? task.contact?.contact?.full_name || task.contact?.contact?.email
          : task.company?.name,
      }));
    },
    enabled: !!organizationId,
    staleTime: 30 * 1000,
  });
}