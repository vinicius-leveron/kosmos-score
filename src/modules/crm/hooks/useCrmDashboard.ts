import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ContactSource, Activity } from '../types';
import { KOSMOS_ORG_ID } from '@/core/auth';

export interface DashboardMetrics {
  totalContacts: number;
  averageScore: number;
  newContactsLast7Days: number;
  newContactsChange: number;
}

export interface StageCount {
  id: string;
  name: string;
  displayName: string;
  color: string;
  count: number;
}

export interface SourceCount {
  source: ContactSource;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface HotLead {
  id: string;
  contactId: string;
  email: string;
  fullName: string | null;
  score: number;
  stageName: string | null;
  stageColor: string | null;
}

export interface RecentActivity extends Activity {
  contactEmail?: string;
  contactName?: string | null;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  stageDistribution: StageCount[];
  sourceDistribution: SourceCount[];
  hotLeads: HotLead[];
  recentActivities: RecentActivity[];
}

const SOURCE_LABELS: Record<ContactSource, string> = {
  kosmos_score: 'KOSMOS Score',
  landing_page: 'Landing Page',
  manual: 'Manual',
  import: 'Importação',
  referral: 'Indicação',
  form_submission: 'Formulário',
};

const SOURCE_COLORS: Record<ContactSource, string> = {
  kosmos_score: '#FF4500',
  landing_page: '#3B82F6',
  manual: '#22C55E',
  import: '#A855F7',
  referral: '#F59E0B',
  form_submission: '#EC4899',
};

export function useCrmDashboard(organizationId: string = KOSMOS_ORG_ID) {
  return useQuery({
    queryKey: ['crm-dashboard', organizationId],
    queryFn: async (): Promise<DashboardData> => {
      // Fetch all data in parallel
      const [
        metricsResult,
        stageDistResult,
        sourceDistResult,
        hotLeadsResult,
        activitiesResult,
      ] = await Promise.all([
        fetchMetrics(organizationId),
        fetchStageDistribution(organizationId),
        fetchSourceDistribution(organizationId),
        fetchHotLeads(organizationId),
        fetchRecentActivities(organizationId),
      ]);

      return {
        metrics: metricsResult,
        stageDistribution: stageDistResult,
        sourceDistribution: sourceDistResult,
        hotLeads: hotLeadsResult,
        recentActivities: activitiesResult,
      };
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

async function fetchMetrics(organizationId: string): Promise<DashboardMetrics> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Get total contacts and average score
  const { data: contactsData, error: contactsError } = await supabase
    .from('contact_orgs')
    .select('id, score, created_at')
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  if (contactsError) throw contactsError;

  const totalContacts = contactsData?.length || 0;
  const scores = (contactsData || [])
    .map((c) => c.score)
    .filter((s): s is number => s !== null);
  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  // Count new contacts in last 7 days
  const newContactsLast7Days = (contactsData || []).filter(
    (c) => new Date(c.created_at) >= sevenDaysAgo
  ).length;

  // Count new contacts in previous 7 days (for comparison)
  const newContactsPrevious7Days = (contactsData || []).filter(
    (c) => new Date(c.created_at) >= fourteenDaysAgo && new Date(c.created_at) < sevenDaysAgo
  ).length;

  // Calculate percentage change
  const newContactsChange = newContactsPrevious7Days > 0
    ? Math.round(((newContactsLast7Days - newContactsPrevious7Days) / newContactsPrevious7Days) * 100)
    : newContactsLast7Days > 0 ? 100 : 0;

  return {
    totalContacts,
    averageScore,
    newContactsLast7Days,
    newContactsChange,
  };
}

async function fetchStageDistribution(organizationId: string): Promise<StageCount[]> {
  // Get stages
  const { data: stages, error: stagesError } = await supabase
    .from('journey_stages')
    .select('id, name, display_name, color, position')
    .eq('organization_id', organizationId)
    .order('position', { ascending: true });

  if (stagesError) throw stagesError;

  // Get counts per stage
  const { data: counts, error: countsError } = await supabase
    .from('contact_orgs')
    .select('journey_stage_id')
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  if (countsError) throw countsError;

  // Build count map
  const countMap = new Map<string, number>();
  (counts || []).forEach((c) => {
    if (c.journey_stage_id) {
      countMap.set(c.journey_stage_id, (countMap.get(c.journey_stage_id) || 0) + 1);
    }
  });

  return (stages || []).map((stage) => ({
    id: stage.id,
    name: stage.name,
    displayName: stage.display_name,
    color: stage.color,
    count: countMap.get(stage.id) || 0,
  }));
}

async function fetchSourceDistribution(organizationId: string): Promise<SourceCount[]> {
  const { data, error } = await supabase
    .from('contact_orgs')
    .select('contacts!inner(source)')
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  if (error) throw error;

  // Count by source
  const sourceMap = new Map<ContactSource, number>();
  let total = 0;

  (data || []).forEach((row: any) => {
    const source = row.contacts?.source as ContactSource;
    if (source) {
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
      total++;
    }
  });

  // Convert to array with percentages
  const sources: SourceCount[] = [];
  sourceMap.forEach((count, source) => {
    sources.push({
      source,
      label: SOURCE_LABELS[source] || source,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: SOURCE_COLORS[source] || '#6B7280',
    });
  });

  // Sort by count descending
  return sources.sort((a, b) => b.count - a.count);
}

async function fetchHotLeads(organizationId: string, limit = 10): Promise<HotLead[]> {
  const { data, error } = await supabase
    .from('contact_orgs')
    .select(`
      id,
      contact_id,
      score,
      contacts!inner (
        email,
        full_name
      ),
      journey_stages (
        display_name,
        color
      )
    `)
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .gte('score', 70)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    contactId: row.contact_id,
    email: row.contacts.email,
    fullName: row.contacts.full_name,
    score: row.score,
    stageName: row.journey_stages?.display_name || null,
    stageColor: row.journey_stages?.color || null,
  }));
}

async function fetchRecentActivities(
  organizationId: string,
  limit = 10
): Promise<RecentActivity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      id,
      type,
      title,
      description,
      metadata,
      reference_type,
      reference_id,
      actor_id,
      created_at,
      contact_org_id,
      contact_orgs!inner (
        organization_id,
        contacts!inner (
          email,
          full_name
        )
      )
    `)
    .eq('contact_orgs.organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    metadata: row.metadata || {},
    reference_type: row.reference_type,
    reference_id: row.reference_id,
    actor_id: row.actor_id,
    created_at: row.created_at,
    contact_org_id: row.contact_org_id,
    contactEmail: row.contact_orgs?.contacts?.email,
    contactName: row.contact_orgs?.contacts?.full_name,
  }));
}
