import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const META_API_VERSION = 'v22.0';
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const appId = Deno.env.get('META_APP_ID');
    const appSecret = Deno.env.get('META_APP_SECRET');

    if (!appId || !appSecret) {
      return new Response(JSON.stringify({ error: 'Meta app credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find accounts expiring within 7 days
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + 7);

    const { data: accounts, error: fetchError } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('is_active', true)
      .lt('token_expires_at', expiryThreshold.toISOString());

    if (fetchError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch accounts' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    for (const account of accounts || []) {
      try {
        // Get current token from vault
        const { data: currentToken, error: secretError } = await supabase
          .rpc('read_secret', { secret_id: account.access_token_secret_id });

        if (secretError || !currentToken) {
          results.push({ account_id: account.id, status: 'error', error: 'Failed to read token' });
          continue;
        }

        // Exchange for new long-lived token
        const refreshUrl = `${META_GRAPH_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${currentToken}`;
        const refreshRes = await fetch(refreshUrl);
        const refreshData = await refreshRes.json();

        if (refreshData.error) {
          results.push({ account_id: account.id, status: 'error', error: refreshData.error.message });

          // If token is invalid, mark account as inactive
          if (refreshData.error.code === 190) {
            await supabase
              .from('instagram_accounts')
              .update({ is_active: false, sync_error: 'Token expired and could not be refreshed', updated_at: new Date().toISOString() })
              .eq('id', account.id);
          }
          continue;
        }

        const newToken = refreshData.access_token;
        const expiresIn = refreshData.expires_in || 5184000;
        const newExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

        // Store new token in vault (create new secret)
        const { data: newSecretId, error: vaultError } = await supabase
          .rpc('create_secret', {
            secret: newToken,
            name: `ig_token_${account.ig_user_id}_${account.organization_id}`,
          });

        if (vaultError) {
          results.push({ account_id: account.id, status: 'error', error: 'Failed to store new token' });
          continue;
        }

        // Update account with new secret reference
        await supabase
          .from('instagram_accounts')
          .update({
            access_token_secret_id: newSecretId,
            token_expires_at: newExpiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', account.id);

        // Delete old secret from vault
        if (account.access_token_secret_id) {
          await supabase.rpc('delete_secret', { secret_id: account.access_token_secret_id });
        }

        results.push({ account_id: account.id, status: 'refreshed', expires_at: newExpiresAt });
      } catch (error) {
        results.push({ account_id: account.id, status: 'error', error: (error as Error).message });
      }
    }

    return new Response(JSON.stringify({
      refreshed: results.filter(r => r.status === 'refreshed').length,
      errors: results.filter(r => r.status === 'error').length,
      results,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('instagram-token-refresh error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
