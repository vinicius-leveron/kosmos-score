import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const META_API_VERSION = 'v22.0';
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface OAuthRequest {
  code: string;
  redirect_uri: string;
  organization_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Verify the user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { code, redirect_uri, organization_id }: OAuthRequest = await req.json();

    if (!code || !redirect_uri || !organization_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields: code, redirect_uri, organization_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const appId = Deno.env.get('META_APP_ID');
    const appSecret = Deno.env.get('META_APP_SECRET');

    if (!appId || !appSecret) {
      return new Response(JSON.stringify({ error: 'Meta app credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Exchange code for short-lived token
    const tokenUrl = `${META_GRAPH_URL}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirect_uri)}&client_secret=${appSecret}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return new Response(JSON.stringify({ error: `Meta OAuth error: ${tokenData.error.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const shortLivedToken = tokenData.access_token;

    // Step 2: Exchange for long-lived token
    const longLivedUrl = `${META_GRAPH_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();

    if (longLivedData.error) {
      return new Response(JSON.stringify({ error: `Token exchange error: ${longLivedData.error.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in || 5184000; // ~60 days
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Step 3: Get Facebook User ID
    const meRes = await fetch(`${META_GRAPH_URL}/me?access_token=${accessToken}`);
    const meData = await meRes.json();
    const facebookUserId = meData.id;

    // Step 4: Get Facebook Pages
    const pagesRes = await fetch(`${META_GRAPH_URL}/me/accounts?access_token=${accessToken}`);
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return new Response(JSON.stringify({ error: 'No Facebook Pages found. Instagram Business account must be linked to a Page.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 5: For each page, find Instagram Business Account
    const connectedAccounts = [];

    for (const page of pagesData.data) {
      const igRes = await fetch(
        `${META_GRAPH_URL}/${page.id}?fields=instagram_business_account&access_token=${accessToken}`,
      );
      const igData = await igRes.json();

      if (igData.instagram_business_account) {
        const igAccountId = igData.instagram_business_account.id;

        // Get IG account details
        const igDetailsRes = await fetch(
          `${META_GRAPH_URL}/${igAccountId}?fields=username,name,profile_picture_url&access_token=${accessToken}`,
        );
        const igDetails = await igDetailsRes.json();

        // Store token in Supabase Vault
        const { data: secretData, error: secretError } = await supabase.rpc('create_secret', {
          secret: accessToken,
          name: `ig_token_${igAccountId}_${organization_id}`,
        });

        if (secretError) {
          console.error('Vault error:', secretError);
          return new Response(JSON.stringify({ error: 'Failed to store token securely' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Upsert instagram account
        const { data: account, error: upsertError } = await supabase
          .from('instagram_accounts')
          .upsert(
            {
              organization_id,
              ig_user_id: igAccountId,
              ig_username: igDetails.username || 'unknown',
              ig_name: igDetails.name || null,
              ig_profile_picture_url: igDetails.profile_picture_url || null,
              facebook_page_id: page.id,
              facebook_user_id: facebookUserId,
              access_token_secret_id: secretData,
              token_expires_at: tokenExpiresAt,
              scopes: tokenData.scope ? tokenData.scope.split(',') : [],
              is_active: true,
              sync_status: 'pending',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'organization_id,ig_user_id' },
          )
          .select('id, ig_user_id, ig_username, ig_name, ig_profile_picture_url, is_active, sync_status')
          .single();

        if (upsertError) {
          console.error('Upsert error:', upsertError);
          continue;
        }

        connectedAccounts.push(account);
      }
    }

    if (connectedAccounts.length === 0) {
      return new Response(JSON.stringify({ error: 'No Instagram Business accounts found linked to your Facebook Pages.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ accounts: connectedAccounts }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('instagram-auth error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
