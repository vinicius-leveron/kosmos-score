/**
 * KOSMOS Stakeholder Analysis - TypeScript Types
 * Interfaces for stakeholder management system
 */

// ============================================================================
// ENUMS (matching database)
// ============================================================================

export type StakeholderType = 'investor' | 'partner' | 'co_founder' | 'advisor';

export type StakeholderStatus = 'active' | 'inactive' | 'exited';

export type RelationshipType = 'co_investor' | 'referral' | 'mentor' | 'partner';

export type InteractionType = 'meeting' | 'mentoring' | 'referral' | 'decision' | 'investment';

// ============================================================================
// SCORE BREAKDOWN (detailed structure from database calculation)
// ============================================================================

export interface ScoreComponentBreakdown {
  count?: number;
  score: number;
  weight: number;
  weighted_score: number;
  period_days?: number | null;
  avg_impact?: number;
  amount?: number;
  org_max?: number;
}

export interface ScoreDecayBreakdown {
  days_since_interaction: number;
  factor: number;
}

export interface ScoreBreakdown {
  meetings?: ScoreComponentBreakdown;
  mentoring?: ScoreComponentBreakdown;
  referrals?: ScoreComponentBreakdown;
  decisions?: ScoreComponentBreakdown;
  investments?: ScoreComponentBreakdown;
  decay?: ScoreDecayBreakdown;
  calculated_at?: string;
}

// ============================================================================
// SCORE HISTORY & TREND
// ============================================================================

export interface ScoreHistoryPoint {
  recorded_at: string;
  score: number;
  trend: 'up' | 'down' | 'neutral';
}

export type ScoreTrend = 'up' | 'down' | 'neutral';

// ============================================================================
// STAKEHOLDER
// ============================================================================

export interface Stakeholder {
  id: string;
  organization_id: string;
  contact_id: string | null;

  // Profile
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  expertise: string[];
  sector: string | null;
  linkedin_url: string | null;

  // Historical
  joined_at: string | null;
  stakeholder_type: StakeholderType;
  participation_pct: number | null;
  investment_amount: number | null;

  // Scoring
  contribution_score: number;
  score_breakdown: ScoreBreakdown;

  // Metadata
  status: StakeholderStatus;
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// STAKEHOLDER RELATIONSHIP
// ============================================================================

export interface StakeholderRelationship {
  id: string;
  organization_id: string;
  stakeholder_a_id: string;
  stakeholder_b_id: string;
  relationship_type: RelationshipType;
  description: string | null;
  created_at: string;
}

// ============================================================================
// STAKEHOLDER INTERACTION
// ============================================================================

export interface StakeholderInteraction {
  id: string;
  organization_id: string;
  stakeholder_id: string;
  interaction_type: InteractionType;
  title: string;
  description: string | null;
  impact_score: number | null;
  occurred_at: string;
  created_by: string | null;
  created_at: string;
}

// ============================================================================
// STAKEHOLDER WITH RELATIONS
// ============================================================================

export interface StakeholderWithRelations extends Stakeholder {
  relationships: StakeholderRelationship[];
  interactions: StakeholderInteraction[];
  relationships_count?: number;
  interactions_count?: number;
  last_interaction_at?: string | null;
}

// ============================================================================
// RELATIONSHIP WITH RELATED STAKEHOLDER INFO
// ============================================================================

export interface RelatedStakeholder {
  relationship_id: string;
  related_stakeholder_id: string;
  related_stakeholder_name: string;
  related_stakeholder_type: StakeholderType;
  relationship_type: RelationshipType;
  description: string | null;
}

// ============================================================================
// INTERACTION WITH CREATOR INFO
// ============================================================================

export interface InteractionWithCreator extends StakeholderInteraction {
  created_by_name: string | null;
}

// ============================================================================
// ORGANIZATION STAKEHOLDER STATS
// ============================================================================

export interface StakeholderStats {
  total_stakeholders: number;
  active_stakeholders: number;
  investors_count: number;
  partners_count: number;
  advisors_count: number;
  cofounders_count: number;
  total_investment: number;
  total_participation: number;
  avg_score: number;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

export interface CreateStakeholderInput {
  organization_id: string;
  full_name: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  expertise?: string[];
  sector?: string;
  linkedin_url?: string;
  joined_at?: string;
  stakeholder_type: StakeholderType;
  participation_pct?: number;
  investment_amount?: number;
  contact_id?: string;
}

export interface UpdateStakeholderInput {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  expertise?: string[];
  sector?: string;
  linkedin_url?: string;
  joined_at?: string;
  stakeholder_type?: StakeholderType;
  participation_pct?: number;
  investment_amount?: number;
  status?: StakeholderStatus;
  contribution_score?: number;
  score_breakdown?: ScoreBreakdown;
  custom_fields?: Record<string, unknown>;
}

export interface CreateRelationshipInput {
  organization_id: string;
  stakeholder_a_id: string;
  stakeholder_b_id: string;
  relationship_type: RelationshipType;
  description?: string;
}

export interface CreateInteractionInput {
  organization_id: string;
  stakeholder_id: string;
  interaction_type: InteractionType;
  title: string;
  description?: string;
  impact_score?: number;
  occurred_at: string;
}

// ============================================================================
// UI HELPER TYPES
// ============================================================================

export const STAKEHOLDER_TYPE_LABELS: Record<StakeholderType, string> = {
  investor: 'Investidor',
  partner: 'Parceiro',
  co_founder: 'Co-fundador',
  advisor: 'Advisor',
};

export const STAKEHOLDER_STATUS_LABELS: Record<StakeholderStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  exited: 'Saiu',
};

export const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  co_investor: 'Co-investidor',
  referral: 'Indicação',
  mentor: 'Mentor/Mentee',
  partner: 'Parceiro de negócio',
};

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  meeting: 'Reunião',
  mentoring: 'Mentoria',
  referral: 'Indicação',
  decision: 'Decisão estratégica',
  investment: 'Investimento',
};

export const STAKEHOLDER_TYPE_COLORS: Record<StakeholderType, string> = {
  investor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  partner: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  co_founder: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  advisor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export const STAKEHOLDER_STATUS_COLORS: Record<StakeholderStatus, string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  exited: 'bg-red-500/20 text-red-400 border-red-500/30',
};
