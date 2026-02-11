import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth';

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'follow_up' | 'proposal' | 'demo' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  due_at: string;
  reminder_at?: string;
  completed_at?: string;
  contact_org_id?: string;
  deal_id?: string;
  company_id?: string;
  assigned_to?: string;
  created_by: string;
  outcome?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  type: Task['type'];
  priority?: Task['priority'];
  due_at: string;
  reminder_at?: string;
  contact_org_id?: string;
  deal_id?: string;
  company_id?: string;
  assigned_to?: string;
}

// Hook para listar tarefas por contato
export function useTasksByContact(contactOrgId?: string) {
  const { organization } = useAuth();

  return useQuery({
    queryKey: ['tasks', 'contact', contactOrgId],
    queryFn: async () => {
      if (!contactOrgId || !organization?.id) return [];

      const { data, error } = await supabase
        .from('crm_tasks')
        .select(`
          *,
          assigned_user:assigned_to(
            id,
            full_name,
            email
          ),
          created_user:created_by(
            id,
            full_name
          )
        `)
        .eq('contact_org_id', contactOrgId)
        .eq('organization_id', organization.id)
        .order('due_at', { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!contactOrgId && !!organization,
  });
}

// Hook para tarefas vencidas
export function useOverdueTasks() {
  const { organization, user } = useAuth();

  return useQuery({
    queryKey: ['tasks', 'overdue', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('crm_tasks')
        .select(`
          *,
          contact:contact_org_id(
            id,
            contacts(full_name, email)
          ),
          deal:deal_id(
            id,
            title
          )
        `)
        .eq('organization_id', organization.id)
        .eq('status', 'pending')
        .lt('due_at', now)
        .order('due_at', { ascending: true });

      if (error) throw error;
      
      // Atualizar status para overdue
      const taskIds = data.map(t => t.id);
      if (taskIds.length > 0) {
        await supabase
          .from('crm_tasks')
          .update({ status: 'overdue' })
          .in('id', taskIds);
      }

      return data as Task[];
    },
    enabled: !!organization,
    refetchInterval: 60000, // Refetch a cada minuto
  });
}

// Hook para próximas tarefas
export function useUpcomingTasks(days: number = 7) {
  const { organization, user } = useAuth();

  return useQuery({
    queryKey: ['tasks', 'upcoming', organization?.id, days],
    queryFn: async () => {
      if (!organization?.id) return [];

      const now = new Date();
      const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('crm_tasks')
        .select(`
          *,
          contact:contact_org_id(
            id,
            contacts(full_name, email)
          ),
          deal:deal_id(
            id,
            title
          ),
          assigned_user:assigned_to(
            id,
            full_name
          )
        `)
        .eq('organization_id', organization.id)
        .eq('status', 'pending')
        .gte('due_at', now.toISOString())
        .lte('due_at', future.toISOString())
        .order('due_at', { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!organization,
  });
}

// Hook para tarefas de hoje
export function useTodayTasks() {
  const { organization, user } = useAuth();

  return useQuery({
    queryKey: ['tasks', 'today', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('crm_tasks')
        .select(`
          *,
          contact:contact_org_id(
            id,
            contacts(full_name, email, phone)
          ),
          deal:deal_id(
            id,
            title,
            value
          )
        `)
        .eq('organization_id', organization.id)
        .in('status', ['pending', 'in_progress'])
        .gte('due_at', today.toISOString())
        .lt('due_at', tomorrow.toISOString())
        .order('priority', { ascending: false })
        .order('due_at', { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!organization,
    refetchInterval: 60000, // Refetch a cada minuto
  });
}

// Mutation para criar tarefa
export function useCreateTask() {
  const queryClient = useQueryClient();
  const { organization, user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!organization?.id || !user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('crm_tasks')
        .insert({
          ...input,
          organization_id: organization.id,
          created_by: user.id,
          assigned_to: input.assigned_to || user.id,
          priority: input.priority || 'medium',
        })
        .select()
        .single();

      if (error) throw error;

      // Se tem contact_org_id, atualizar next_action
      if (input.contact_org_id) {
        await supabase
          .from('contact_orgs')
          .update({
            next_action_at: input.due_at,
            next_action_type: input.type,
          })
          .eq('id', input.contact_org_id);
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (data.contact_org_id) {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
      }
    },
  });
}

// Mutation para completar tarefa
export function useCompleteTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      taskId, 
      outcome 
    }: { 
      taskId: string; 
      outcome?: string;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('crm_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: user.id,
          outcome,
        })
        .eq('id', taskId)
        .select(`
          *,
          contact_org_id
        `)
        .single();

      if (error) throw error;

      // Limpar next_action se era a última tarefa
      if (data.contact_org_id) {
        const { data: remainingTasks } = await supabase
          .from('crm_tasks')
          .select('id')
          .eq('contact_org_id', data.contact_org_id)
          .eq('status', 'pending')
          .limit(1);

        if (!remainingTasks || remainingTasks.length === 0) {
          await supabase
            .from('contact_orgs')
            .update({
              next_action_at: null,
              next_action_type: null,
            })
            .eq('id', data.contact_org_id);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

// Mutation para cancelar tarefa
export function useCancelTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase
        .from('crm_tasks')
        .update({
          status: 'cancelled',
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Mutation para atualizar tarefa
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      taskId, 
      updates 
    }: { 
      taskId: string; 
      updates: Partial<CreateTaskInput>;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}