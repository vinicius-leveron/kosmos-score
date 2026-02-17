import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/core/auth';

export interface Webhook {
  id: string;
  name: string;
  description: string | null;
  endpoint_path: string;
  source: string;
  field_mapping: Record<string, string>;
  default_values: Record<string, unknown>;
  target_entity: string;
  target_pipeline_id: string | null;
  target_stage_id: string | null;
  default_tags: string[] | null;
  is_active: boolean;
  last_received_at: string | null;
  total_received: number;
  total_processed: number;
  total_errors: number;
  created_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  received_at: string;
  request_payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'processed' | 'failed' | 'ignored';
  error_message: string | null;
  created_entity_type: string | null;
  created_entity_id: string | null;
}

export interface CreateWebhookInput {
  name: string;
  description?: string;
  source: string;
  field_mapping: Record<string, string>;
  default_values?: Record<string, unknown>;
  target_entity?: string;
  target_pipeline_id?: string | null;
  target_stage_id?: string | null;
  default_tags?: string[];
}

// Generate webhook endpoint path
function generateEndpointPath(): string {
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  return 'wh_' + Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Generate secret token
function generateSecretToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function useWebhooks() {
  const { currentOrg } = useOrganization();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWebhooks = useCallback(async () => {
    if (!currentOrg) {
      setWebhooks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('webhooks')
        .select('*')
        .eq('organization_id', currentOrg.organization_id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching webhooks:', fetchError);
        setError('Erro ao carregar webhooks');
        return;
      }

      setWebhooks((data || []) as Webhook[]);
    } catch (err) {
      console.error('Exception fetching webhooks:', err);
      setError('Erro ao carregar webhooks');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const createWebhook = async (input: CreateWebhookInput): Promise<{ url: string }> => {
    if (!currentOrg) {
      throw new Error('Organização não encontrada');
    }

    const endpointPath = generateEndpointPath();
    const secretToken = generateSecretToken();

    const { error: insertError } = await supabase.from('webhooks').insert({
      organization_id: currentOrg.organization_id,
      name: input.name,
      description: input.description || null,
      endpoint_path: endpointPath,
      secret_token: secretToken,
      source: input.source,
      field_mapping: input.field_mapping,
      default_values: input.default_values || {},
      target_entity: input.target_entity || 'contact',
      target_pipeline_id: input.target_pipeline_id || null,
      target_stage_id: input.target_stage_id || null,
      default_tags: input.default_tags || null,
    });

    if (insertError) {
      console.error('Error creating webhook:', insertError);
      throw new Error('Erro ao criar webhook');
    }

    await fetchWebhooks();

    // Return the full webhook URL using the app domain
    const baseUrl = window.location.origin;
    return { url: `${baseUrl}/webhooks/${endpointPath}` };
  };

  const updateWebhook = async (id: string, updates: Partial<CreateWebhookInput & { is_active: boolean }>) => {
    const { error: updateError } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      throw new Error('Erro ao atualizar webhook');
    }

    await fetchWebhooks();
  };

  const deleteWebhook = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error('Erro ao excluir webhook');
    }

    await fetchWebhooks();
  };

  const getWebhookUrl = (webhook: Webhook): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/webhooks/${webhook.endpoint_path}`;
  };

  return {
    webhooks,
    isLoading,
    error,
    refetch: fetchWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    getWebhookUrl,
  };
}

export function useWebhookLogs(webhookId: string | null) {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!webhookId) {
      setLogs([]);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('id, webhook_id, received_at, request_payload, status, error_message, created_entity_type, created_entity_id')
        .eq('webhook_id', webhookId)
        .order('received_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching webhook logs:', error);
        return;
      }

      setLogs((data || []) as WebhookLog[]);
    } finally {
      setIsLoading(false);
    }
  }, [webhookId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, isLoading, refetch: fetchLogs };
}
