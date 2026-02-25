/**
 * API Key Authentication for CRM API
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { AuthResult, ApiKeyRecord } from './types.ts';

// SHA-256 hash function (matches the UI implementation)
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get Supabase admin client (service role)
export function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

/**
 * Validate API key from Authorization header
 * Format: Bearer ks_live_xxxxx or Bearer ks_test_xxxxx
 */
export async function authenticateRequest(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');

  // Check header format
  if (!authHeader) {
    return { success: false, error: 'Missing Authorization header', status: 401 };
  }

  if (!authHeader.startsWith('Bearer ks_')) {
    return { success: false, error: 'Invalid API key format. Expected: Bearer ks_live_xxx or Bearer ks_test_xxx', status: 401 };
  }

  const apiKey = authHeader.replace('Bearer ', '');
  const keyPrefix = apiKey.substring(0, 15);

  const supabase = getSupabaseAdmin();

  try {
    // Fetch key record by prefix
    const { data: keyRecord, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, organization_id, key_hash, permissions, allowed_ips, rate_limit_per_minute, rate_limit_per_day, is_active, expires_at')
      .eq('key_prefix', keyPrefix)
      .single();

    if (fetchError || !keyRecord) {
      return { success: false, error: 'Invalid API key', status: 401 };
    }

    const record = keyRecord as ApiKeyRecord;

    // Check if key is active
    if (!record.is_active) {
      return { success: false, error: 'API key is inactive', status: 401 };
    }

    // Check if key is expired
    if (record.expires_at && new Date(record.expires_at) < new Date()) {
      return { success: false, error: 'API key has expired', status: 401 };
    }

    // Verify hash (using SHA-256 to match UI implementation)
    const computedHash = await hashKey(apiKey);
    if (computedHash !== record.key_hash) {
      return { success: false, error: 'Invalid API key', status: 401 };
    }

    // Check IP whitelist
    if (record.allowed_ips && record.allowed_ips.length > 0) {
      const clientIP = req.headers.get('cf-connecting-ip') ||
                       req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                       req.headers.get('x-real-ip');

      if (clientIP && !record.allowed_ips.includes(clientIP)) {
        return { success: false, error: 'IP address not allowed', status: 403 };
      }
    }

    // Check rate limit using database function
    const { data: rateLimitOk, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        p_api_key_id: record.id,
        p_limit_per_minute: record.rate_limit_per_minute,
        p_limit_per_day: record.rate_limit_per_day,
      });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      // Continue anyway if rate limit check fails
    } else if (!rateLimitOk) {
      return { success: false, error: 'Rate limit exceeded', status: 429 };
    }

    // Update last_used_at and usage_count
    await supabase
      .from('api_keys')
      .update({
        last_used_at: new Date().toISOString(),
        last_used_ip: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
        usage_count: (await supabase.from('api_keys').select('usage_count').eq('id', record.id).single()).data?.usage_count + 1 || 1,
      })
      .eq('id', record.id);

    return {
      success: true,
      organizationId: record.organization_id,
      permissions: record.permissions,
      apiKeyId: record.id,
    };
  } catch (err) {
    console.error('Auth error:', err);
    return { success: false, error: 'Authentication failed', status: 500 };
  }
}

/**
 * Check if the API key has permission for a specific action
 */
export function hasPermission(
  permissions: AuthResult['permissions'],
  entity: keyof NonNullable<AuthResult['permissions']>,
  action: 'read' | 'write' | 'delete'
): boolean {
  if (!permissions) return false;
  const entityPerms = permissions[entity];
  if (!entityPerms) return false;
  return entityPerms[action] === true;
}
