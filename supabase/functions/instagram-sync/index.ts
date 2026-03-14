import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const META_API_VERSION = 'v22.0';
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SyncRequest {
  account_id: string;
}

async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url);
    if (res.ok || res.status !== 429) return res;
    // Rate limited - wait with exponential backoff
    await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
  }
  return fetch(url);
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

    // Verify user JWT
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { account_id }: SyncRequest = await req.json();

    if (!account_id) {
      return new Response(JSON.stringify({ error: 'Missing account_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get account with decrypted token
    const { data: account, error: accountError } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('id', account_id)
      .single();

    if (accountError || !account) {
      return new Response(JSON.stringify({ error: 'Account not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get decrypted token from vault
    const { data: secretData, error: secretError } = await supabase
      .rpc('read_secret', { secret_id: account.access_token_secret_id });

    if (secretError || !secretData) {
      return new Response(JSON.stringify({ error: 'Failed to retrieve access token' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = secretData;

    // Update sync status
    await supabase
      .from('instagram_accounts')
      .update({ sync_status: 'syncing', sync_error: null, updated_at: new Date().toISOString() })
      .eq('id', account_id);

    try {
      // Step 1: Fetch all media
      let mediaUrl = `${META_GRAPH_URL}/${account.ig_user_id}/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp&limit=50&access_token=${accessToken}`;
      const allMedia: Record<string, unknown>[] = [];

      while (mediaUrl) {
        const mediaRes = await fetchWithRetry(mediaUrl);
        const mediaData = await mediaRes.json();

        if (mediaData.error) {
          throw new Error(`Media fetch error: ${mediaData.error.message}`);
        }

        if (mediaData.data) {
          allMedia.push(...mediaData.data);
        }

        mediaUrl = mediaData.paging?.next || null;

        // Limit to 200 most recent for performance
        if (allMedia.length >= 200) break;
      }

      // Step 2: For each media, get insights and upsert
      for (const media of allMedia) {
        const mediaId = media.id as string;
        const mediaType = media.media_type as string;

        // Get video duration for reels/videos
        let durationSeconds: number | null = null;
        if (mediaType === 'REELS' || mediaType === 'VIDEO') {
          const videoRes = await fetchWithRetry(
            `${META_GRAPH_URL}/${mediaId}?fields=video_duration&access_token=${accessToken}`,
          );
          const videoData = await videoRes.json();
          durationSeconds = videoData.video_duration || null;
        }

        // Upsert media
        const { data: dbMedia, error: mediaError } = await supabase
          .from('instagram_media')
          .upsert(
            {
              organization_id: account.organization_id,
              account_id: account.id,
              ig_media_id: mediaId,
              media_type: mediaType,
              media_url: (media.media_url as string) || null,
              thumbnail_url: (media.thumbnail_url as string) || null,
              permalink: (media.permalink as string) || null,
              caption: (media.caption as string) || null,
              timestamp: media.timestamp as string,
              duration_seconds: durationSeconds,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'account_id,ig_media_id' },
          )
          .select('id')
          .single();

        if (mediaError || !dbMedia) {
          console.error(`Failed to upsert media ${mediaId}:`, mediaError);
          continue;
        }

        // Get organic insights
        const insightsMetrics = mediaType === 'REELS'
          ? 'views,reach,likes,comments,shares,saved,reposts,ig_reels_avg_watch_time,ig_reels_video_view_total_time,clips_replays_count'
          : 'views,reach,likes,comments,shares,saved';

        const insightsRes = await fetchWithRetry(
          `${META_GRAPH_URL}/${mediaId}/insights?metric=${insightsMetrics}&access_token=${accessToken}`,
        );
        const insightsData = await insightsRes.json();

        if (insightsData.data) {
          const metricsMap: Record<string, number> = {};
          for (const metric of insightsData.data) {
            metricsMap[metric.name] = metric.values?.[0]?.value ?? 0;
          }

          await supabase
            .from('instagram_media_insights')
            .upsert(
              {
                organization_id: account.organization_id,
                media_id: dbMedia.id,
                views: metricsMap.views || 0,
                reach: metricsMap.reach || 0,
                likes: metricsMap.likes || 0,
                comments: metricsMap.comments || 0,
                shares: metricsMap.shares || 0,
                saves: metricsMap.saved || 0,
                reposts: metricsMap.reposts || 0,
                avg_watch_time_ms: metricsMap.ig_reels_avg_watch_time || null,
                total_watch_time_ms: metricsMap.ig_reels_video_view_total_time || null,
                skip_rate: metricsMap.clips_replays_count || null,
                fetched_at: new Date().toISOString(),
              },
              { onConflict: 'media_id' },
            );
        }
      }

      // Step 3: Fetch account-level insights (last 30 days)
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - 30);
      const since = Math.floor(sinceDate.getTime() / 1000);
      const until = Math.floor(Date.now() / 1000);

      const accountInsightsRes = await fetchWithRetry(
        `${META_GRAPH_URL}/${account.ig_user_id}/insights?metric=views,reach,follower_count&period=day&since=${since}&until=${until}&access_token=${accessToken}`,
      );
      const accountInsightsData = await accountInsightsRes.json();

      if (accountInsightsData.data) {
        const viewsData = accountInsightsData.data.find((m: { name: string }) => m.name === 'views');
        const reachData = accountInsightsData.data.find((m: { name: string }) => m.name === 'reach');
        const followerData = accountInsightsData.data.find((m: { name: string }) => m.name === 'follower_count');

        if (viewsData?.values) {
          for (let i = 0; i < viewsData.values.length; i++) {
            const date = viewsData.values[i].end_time?.split('T')[0];
            if (!date) continue;

            await supabase
              .from('instagram_account_insights')
              .upsert(
                {
                  organization_id: account.organization_id,
                  account_id: account.id,
                  date,
                  views: viewsData.values[i]?.value || 0,
                  reach: reachData?.values?.[i]?.value || 0,
                  follower_count: followerData?.values?.[i]?.value || 0,
                  fetched_at: new Date().toISOString(),
                },
                { onConflict: 'account_id,date' },
              );
          }
        }
      }

      // Update sync status to completed
      await supabase
        .from('instagram_accounts')
        .update({
          sync_status: 'completed',
          last_sync_at: new Date().toISOString(),
          sync_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', account_id);

      return new Response(JSON.stringify({
        success: true,
        media_count: allMedia.length,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (syncError) {
      // Update sync status to error
      await supabase
        .from('instagram_accounts')
        .update({
          sync_status: 'error',
          sync_error: (syncError as Error).message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', account_id);

      throw syncError;
    }
  } catch (error) {
    console.error('instagram-sync error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
