import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/core/auth';

export interface ApiKey {
  id: string;
  name: string;
  description: string | null;
  key_prefix: string;
  permissions: Record<string, { read: boolean; write: boolean; delete: boolean }>;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  is_active: boolean;
  last_used_at: string | null;
  usage_count: number;
  expires_at: string | null;
  created_at: string;
}

export interface CreateApiKeyInput {
  name: string;
  description?: string;
  permissions?: Record<string, { read: boolean; write: boolean; delete: boolean }>;
  rate_limit_per_minute?: number;
  rate_limit_per_day?: number;
  expires_at?: string | null;
}

// Generate API key on client side
function generateApiKey(): { fullKey: string; prefix: string } {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  const randomPart = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  const fullKey = `ks_live_${randomPart}`;
  const prefix = fullKey.substring(0, 15);
  return { fullKey, prefix };
}

// Simple hash function for demo (in production, use bcrypt on server)
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function useApiKeys() {
  const { currentOrg } = useOrganization();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async () => {
    if (!currentOrg) {
      setApiKeys([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('api_keys')
        .select('id, name, description, key_prefix, permissions, rate_limit_per_minute, rate_limit_per_day, is_active, last_used_at, usage_count, expires_at, created_at')
        .eq('organization_id', currentOrg.organization_id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching API keys:', fetchError);
        setError('Erro ao carregar API keys');
        return;
      }

      setApiKeys((data || []) as ApiKey[]);
    } catch (err) {
      console.error('Exception fetching API keys:', err);
      setError('Erro ao carregar API keys');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const createApiKey = async (input: CreateApiKeyInput): Promise<{ key: string } | null> => {
    if (!currentOrg) {
      throw new Error('Organização não encontrada');
    }

    const { fullKey, prefix } = generateApiKey();
    const keyHash = await hashKey(fullKey);

    const defaultPermissions = {
      contacts: { read: true, write: true, delete: false },
      companies: { read: true, write: true, delete: false },
      deals: { read: true, write: true, delete: false },
      activities: { read: true, write: true, delete: false },
      tags: { read: true, write: false, delete: false },
      tasks: { read: true, write: true, delete: false },
      pipelines: { read: true, write: false, delete: false },
    };

    const { error: insertError } = await supabase.from('api_keys').insert({
      organization_id: currentOrg.organization_id,
      name: input.name,
      description: input.description || null,
      key_prefix: prefix,
      key_hash: keyHash,
      permissions: input.permissions || defaultPermissions,
      rate_limit_per_minute: input.rate_limit_per_minute || 60,
      rate_limit_per_day: input.rate_limit_per_day || 10000,
      expires_at: input.expires_at || null,
    });

    if (insertError) {
      console.error('Error creating API key:', insertError);
      throw new Error('Erro ao criar API key');
    }

    await fetchApiKeys();
    return { key: fullKey };
  };

  const updateApiKey = async (id: string, updates: Partial<CreateApiKeyInput & { is_active: boolean }>) => {
    const { error: updateError } = await supabase
      .from('api_keys')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      throw new Error('Erro ao atualizar API key');
    }

    await fetchApiKeys();
  };

  const deleteApiKey = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error('Erro ao excluir API key');
    }

    await fetchApiKeys();
  };

  return {
    apiKeys,
    isLoading,
    error,
    refetch: fetchApiKeys,
    createApiKey,
    updateApiKey,
    deleteApiKey,
  };
}
