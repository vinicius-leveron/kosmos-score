/**
 * Competitor Analysis Pipeline - Edge Function
 *
 * Orchestrates the 5-stage competitor analysis pipeline:
 * 1. Discovery: Find channels from Instagram handle
 * 2. Scraping: Extract raw data from each channel
 * 3. Analysis: Categorize content and calculate metrics
 * 4. Enrichment: Generate LLM insights
 * 5. Report: Persist results to database
 *
 * POST /competitor-pipeline
 * Body: { competitor_id: string, run_id: string }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  Deno.env.get('SITE_URL') ?? 'http://localhost:8080',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PipelineRequest {
  competitor_id: string;
  run_id: string;
}

interface ChannelDiscovery {
  platform: string;
  url: string;
  handle: string | null;
}

interface DiscoveryResult {
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  category: string | null;
  channels_discovered: ChannelDiscovery[];
}

interface ChannelAnalysis {
  platform: string;
  url: string;
  handle: string | null;
  followers: number | null;
  total_posts: number | null;
  engagement_rate: number | null;
  avg_likes: number | null;
  avg_comments: number | null;
  avg_views: number | null;
  avg_shares: number | null;
  growth_rate_monthly: number | null;
  primary_content_type: string | null;
  primary_format: string | null;
  posting_frequency: string | null;
  posts_per_week: number | null;
  raw_data: Record<string, unknown>;
}

interface ProductDiscovery {
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  product_type: string | null;
  url: string | null;
  is_recurring: boolean;
}

interface Insights {
  posicionamento: string;
  pontos_fortes: string[];
  pontos_fracos: string[];
  oportunidades: string[];
  ameacas: string[];
  recomendacoes: string[];
  resumo_executivo: string;
}

// Initialize Supabase client with service role for admin access
function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
}

async function updateRunStatus(
  supabase: ReturnType<typeof createClient>,
  runId: string,
  status: string,
  agent: string,
  progress: number,
  stageResult?: { field: string; data: unknown },
) {
  const update: Record<string, unknown> = {
    status,
    current_agent: agent,
    progress,
  };

  if (status === 'discovering') {
    update.started_at = new Date().toISOString();
  }

  if (stageResult) {
    update[stageResult.field] = stageResult.data;
  }

  if (status === 'completed' || status === 'failed') {
    update.completed_at = new Date().toISOString();
  }

  await supabase
    .from('competitor_analysis_runs')
    .update(update)
    .eq('id', runId);
}

// ============================================================================
// Stage 1: Discovery
// TODO: Replace with real Apify/Google Search API calls when keys are available
// ============================================================================
async function runDiscovery(instagramHandle: string): Promise<DiscoveryResult> {
  // Mock discovery - returns placeholder data
  // When APIFY_API_KEY is configured, this will call the Instagram Profile Scraper
  const apifyKey = Deno.env.get('APIFY_API_KEY');

  if (apifyKey) {
    // TODO: Implement real Apify Instagram scraper call
    // const response = await fetch(`https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs`, { ... });
  }

  return {
    display_name: `@${instagramHandle}`,
    bio: 'Perfil descoberto via pipeline (dados reais pendentes - configure APIFY_API_KEY)',
    avatar_url: null,
    website_url: null,
    category: null,
    channels_discovered: [
      {
        platform: 'instagram',
        url: `https://instagram.com/${instagramHandle}`,
        handle: instagramHandle,
      },
    ],
  };
}

// ============================================================================
// Stage 2: Scraping
// TODO: Replace with real API calls
// ============================================================================
async function runScraping(
  channels: ChannelDiscovery[],
): Promise<{ channels_data: ChannelAnalysis[]; products_found: ProductDiscovery[] }> {
  const channelsData: ChannelAnalysis[] = channels.map((ch) => ({
    platform: ch.platform,
    url: ch.url,
    handle: ch.handle,
    followers: null,
    total_posts: null,
    engagement_rate: null,
    avg_likes: null,
    avg_comments: null,
    avg_views: null,
    avg_shares: null,
    growth_rate_monthly: null,
    primary_content_type: null,
    primary_format: null,
    posting_frequency: null,
    posts_per_week: null,
    raw_data: {},
  }));

  return {
    channels_data: channelsData,
    products_found: [],
  };
}

// ============================================================================
// Stage 3: Analysis
// ============================================================================
function runAnalysis(channelsData: ChannelAnalysis[]): ChannelAnalysis[] {
  // Pure computation stage - calculates derived metrics
  // Currently passes through since we have mock data
  return channelsData;
}

// ============================================================================
// Stage 4: Enrichment (LLM)
// TODO: Replace with real Anthropic API call when key is available
// ============================================================================
async function runEnrichment(
  _discovery: DiscoveryResult,
  _channels: ChannelAnalysis[],
  _products: ProductDiscovery[],
): Promise<Insights> {
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (anthropicKey) {
    // TODO: Implement real Claude API call for qualitative analysis
  }

  return {
    posicionamento: 'Analise pendente - configure ANTHROPIC_API_KEY para insights automaticos via LLM.',
    pontos_fortes: [],
    pontos_fracos: [],
    oportunidades: [],
    ameacas: [],
    recomendacoes: ['Configure as API keys (APIFY_API_KEY, ANTHROPIC_API_KEY) para ativar a analise completa.'],
    resumo_executivo: 'Pipeline de analise executado com dados placeholder. Configure as API keys necessarias para obter analise completa.',
  };
}

// ============================================================================
// Stage 5: Report - Persist to database
// ============================================================================
async function runReport(
  supabase: ReturnType<typeof createClient>,
  competitorId: string,
  discovery: DiscoveryResult,
  channelsData: ChannelAnalysis[],
  products: ProductDiscovery[],
  insights: Insights,
) {
  // Update competitor profile
  const { error: profileError } = await supabase
    .from('competitor_profiles')
    .update({
      display_name: discovery.display_name,
      bio: discovery.bio,
      avatar_url: discovery.avatar_url,
      website_url: discovery.website_url,
      category: discovery.category,
      total_channels: channelsData.length,
      total_products: products.length,
    })
    .eq('id', competitorId);

  if (profileError) throw new Error(`Failed to update profile: ${profileError.message}`);

  // Delete old channels and insert new ones
  const { error: deleteChannelsError } = await supabase
    .from('competitor_channels')
    .delete()
    .eq('competitor_id', competitorId);

  if (deleteChannelsError) throw new Error(`Failed to delete channels: ${deleteChannelsError.message}`);

  if (channelsData.length > 0) {
    const { error: insertChannelsError } = await supabase
      .from('competitor_channels')
      .insert(
        channelsData.map((ch) => ({
          competitor_id: competitorId,
          platform: ch.platform,
          url: ch.url,
          handle: ch.handle,
          followers: ch.followers,
          total_posts: ch.total_posts,
          engagement_rate: ch.engagement_rate,
          avg_likes: ch.avg_likes,
          avg_comments: ch.avg_comments,
          avg_views: ch.avg_views,
          avg_shares: ch.avg_shares,
          growth_rate_monthly: ch.growth_rate_monthly,
          primary_content_type: ch.primary_content_type,
          primary_format: ch.primary_format,
          posting_frequency: ch.posting_frequency,
          posts_per_week: ch.posts_per_week,
          raw_data: ch.raw_data,
          last_scraped_at: new Date().toISOString(),
        })),
      );

    if (insertChannelsError) throw new Error(`Failed to insert channels: ${insertChannelsError.message}`);
  }

  // Delete old products and insert new ones
  const { error: deleteProductsError } = await supabase
    .from('competitor_products')
    .delete()
    .eq('competitor_id', competitorId);

  if (deleteProductsError) throw new Error(`Failed to delete products: ${deleteProductsError.message}`);

  if (products.length > 0) {
    const { error: insertProductsError } = await supabase
      .from('competitor_products')
      .insert(
        products.map((p) => ({
          competitor_id: competitorId,
          name: p.name,
          description: p.description,
          price: p.price,
          currency: p.currency,
          product_type: p.product_type,
          url: p.url,
          is_recurring: p.is_recurring,
        })),
      );

    if (insertProductsError) throw new Error(`Failed to insert products: ${insertProductsError.message}`);
  }

  return { insights };
}

// ============================================================================
// Main Handler
// ============================================================================
Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authentication: verify the caller's JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { competitor_id, run_id } = body;

    if (!competitor_id || !run_id
        || typeof competitor_id !== 'string'
        || typeof run_id !== 'string'
        || !UUID_REGEX.test(competitor_id)
        || !UUID_REGEX.test(run_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid competitor_id or run_id (must be valid UUIDs)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch the competitor profile
    const { data: competitor, error: fetchError } = await supabase
      .from('competitor_profiles')
      .select('instagram_handle')
      .eq('id', competitor_id)
      .single();

    if (fetchError || !competitor) {
      return new Response(
        JSON.stringify({ error: 'Competitor not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Stage 1: Discovery
    await updateRunStatus(supabase, run_id, 'discovering', '@discovery', 5);
    const discoveryResult = await runDiscovery(competitor.instagram_handle);
    await updateRunStatus(supabase, run_id, 'discovering', '@discovery', 20, {
      field: 'discovery_result',
      data: discoveryResult,
    });

    // Stage 2: Scraping
    await updateRunStatus(supabase, run_id, 'scraping', '@scraper', 25);
    const scrapingResult = await runScraping(discoveryResult.channels_discovered);
    await updateRunStatus(supabase, run_id, 'scraping', '@scraper', 50, {
      field: 'scraping_result',
      data: scrapingResult,
    });

    // Stage 3: Analysis
    await updateRunStatus(supabase, run_id, 'analyzing', '@analyst', 55);
    const analyzedChannels = runAnalysis(scrapingResult.channels_data);
    await updateRunStatus(supabase, run_id, 'analyzing', '@analyst', 70, {
      field: 'analysis_result',
      data: { channels_analysis: analyzedChannels },
    });

    // Stage 4: Enrichment
    await updateRunStatus(supabase, run_id, 'enriching', '@enrichment', 75);
    const insights = await runEnrichment(discoveryResult, analyzedChannels, scrapingResult.products_found);
    await updateRunStatus(supabase, run_id, 'enriching', '@enrichment', 90, {
      field: 'enrichment_result',
      data: insights,
    });

    // Stage 5: Report
    await runReport(
      supabase,
      competitor_id,
      discoveryResult,
      analyzedChannels,
      scrapingResult.products_found,
      insights,
    );

    // Mark as completed
    await updateRunStatus(supabase, run_id, 'completed', '@report', 100);

    // Store final insights
    await supabase
      .from('competitor_analysis_runs')
      .update({ insights })
      .eq('id', run_id);

    return new Response(
      JSON.stringify({ success: true, competitor_id, run_id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';

    // Try to mark the run as failed
    try {
      const body = await req.clone().json();
      if (body.run_id) {
        const supabase = getSupabaseAdmin();
        await supabase
          .from('competitor_analysis_runs')
          .update({
            status: 'failed',
            error_message: errorMessage,
            completed_at: new Date().toISOString(),
          })
          .eq('id', body.run_id);
      }
    } catch {
      // Ignore error when trying to update failed status
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
