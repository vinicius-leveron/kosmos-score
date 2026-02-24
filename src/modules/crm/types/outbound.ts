// Types para o módulo de Outbound Dashboards

// ============================================
// FILTROS
// ============================================

export type Tenant = 'kosmos' | 'oliveira-dev' | 'all';
export type Classificacao = 'A' | 'B' | 'C';
export type CadenceStatus =
  | 'new'
  | 'scoring'       // Aguardando score ICP
  | 'enriching'     // Aguardando enriquecimento
  | 'ready'
  | 'queued'        // Na fila para próximo batch
  | 'in_sequence'
  | 'paused'
  | 'replied'
  | 'converted'     // Fechou negócio
  | 'nurture'
  | 'archived'      // Arquivado (inativo)
  | 'unsubscribed'
  | 'bounced';

export type Channel = 'email' | 'instagram_dm' | 'whatsapp';

// Canal de entrada do lead
export type ChannelIn =
  | 'scraper'
  | 'comment'
  | 'story'
  | 'form'
  | 'dm'
  | 'whatsapp'
  | 'ad'
  | 'referral'
  | 'manychat'
  | 'import';

// Direção da interação
export type ActivityDirection = 'outgoing' | 'incoming' | 'system';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface OutboundFilters {
  tenant: Tenant;
  dateRange: DateRange;
  classificacao: Classificacao[];
  sources: string[];
  cadenceStatus: CadenceStatus[];
}

// ============================================
// D1: FUNIL GERAL
// ============================================

export interface FunnelStageMetric {
  cadence_status: CadenceStatus;
  count: number;
  avg_days_in_stage: number | null;
  classificacao: Classificacao | null;
}

export interface FunnelMetrics {
  stages: FunnelStageMetric[];
  totalLeads: number;
  conversionRates: {
    newToReady: number;
    readyToInSequence: number;
    inSequenceToReplied: number;
  };
  velocity: {
    avgDaysToReady: number;
    avgDaysToFirstContact: number;
    avgDaysToReply: number;
  };
}

// ============================================
// D2: SOURCE ATTRIBUTION
// ============================================

export interface SourceMetric {
  source: string;
  totalLeads: number;
  avgIcpScore: number | null;
  classACount: number;
  classBCount: number;
  classCCount: number;
  repliedCount: number;
  replyRate: number;
}

export interface SourceMetrics {
  sources: SourceMetric[];
  topSource: string;
  bestConvertingSource: string;
}

// ============================================
// D3: CHANNEL ANALYTICS
// ============================================

export interface ChannelDayMetric {
  channel: Channel;
  activity_date: string;
  sent: number;
  delivered: number;
  engaged: number;
  classificacao: Classificacao | null;
}

export interface ChannelMetrics {
  daily: ChannelDayMetric[];
  totals: {
    email: { sent: number; delivered: number; engaged: number; rate: number };
    instagram_dm: { sent: number; delivered: number; engaged: number; rate: number };
    whatsapp: { sent: number; delivered: number; engaged: number; rate: number };
  };
  bestChannel: Channel;
}

// ============================================
// D4: ICP SCORING HEALTH
// ============================================

export interface ScoreBucketMetric {
  scoreBucket: string;
  classificacao: Classificacao;
  total: number;
  replied: number;
  replyRate: number;
}

export interface ScoringMetrics {
  distribution: ScoreBucketMetric[];
  classificationBreakdown: {
    A: number;
    B: number;
    C: number;
  };
  validationMetrics: {
    avgScoreReplied: number;
    avgScoreNotReplied: number;
    falsePositiveRate: number; // Class A that never replied
    falseNegativeRate: number; // Class C that converted
  };
}

// ============================================
// D5: ENGAGEMENT HEATMAP
// ============================================

export interface EngagementHeatmapCell {
  dayOfWeek: number; // 0-6 (Sun-Sat)
  hourOfDay: number; // 0-23
  messagesSent: number;
  messagesReplied: number;
  replyRate: number;
}

export interface EngagementMetrics {
  heatmap: EngagementHeatmapCell[];
  bestTimeSlot: { day: number; hour: number; rate: number };
  worstTimeSlot: { day: number; hour: number; rate: number };
}

// ============================================
// D6: AXIOM OPERATIONS
// ============================================

export interface AxiomDayMetric {
  activity_date: string;
  follows: number;
  unfollows: number;
  likes: number;
  dmsSent: number;
  dmsReplied: number;
  storiesViewed: number;
  comments: number;
  accountsWarming: number;
}

export interface AxiomMetrics {
  daily: AxiomDayMetric[];
  totals: {
    totalFollows: number;
    totalLikes: number;
    totalDMs: number;
    totalReplies: number;
    dmReplyRate: number;
  };
  warmupProgress: {
    accountsInWarmup: number;
    avgWarmupDays: number;
  };
}

// ============================================
// D7: MANYCHAT INBOUND
// ============================================

export interface ManyChatAutomationMetric {
  automation: string;
  triggers: number;
  qualified: number;
  converted: number;
  conversionRate: number;
}

export interface ManyChatMetrics {
  automations: ManyChatAutomationMetric[];
  topKeywords: { keyword: string; count: number }[];
  totalInbound: number;
  handoffRate: number;
}

// ============================================
// D8: EMAIL HEALTH
// ============================================

export interface EmailDayMetric {
  activity_date: string;
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  bounceRate: number;
  openRate: number;
}

export interface EmailMetrics {
  daily: EmailDayMetric[];
  healthStatus: 'healthy' | 'warning' | 'critical';
  totals: {
    totalSent: number;
    totalOpened: number;
    totalBounced: number;
    avgBounceRate: number;
    avgOpenRate: number;
  };
  warmupProgress?: {
    currentDailyLimit: number;
    targetDailyLimit: number;
    daysRemaining: number;
  };
}

// ============================================
// D9: NURTURE & RE-ENTRY
// ============================================

export interface NurtureStatusMetric {
  cadence_status: CadenceStatus;
  classificacao: Classificacao | null;
  count: number;
  avgDaysDormant: number;
}

export interface NurtureMetrics {
  pool: NurtureStatusMetric[];
  totalInNurture: number;
  reactivationRate: number;
  reactivationsByTrigger: { trigger: string; count: number }[];
  avgTimeToReactivation: number;
}

// ============================================
// D10: REVENUE & ROI
// ============================================

export interface RevenueSourceMetric {
  source: string;
  dealsCount: number;
  pipelineValue: number;
  revenue: number;
  avgDealSize: number;
  winRate: number;
}

export interface RevenueMetrics {
  bySource: RevenueSourceMetric[];
  totals: {
    totalPipeline: number;
    totalRevenue: number;
    avgDealSize: number;
    winRate: number;
  };
  cac?: {
    bySource: { source: string; cac: number }[];
    overall: number;
  };
}

// ============================================
// CORES DO SISTEMA
// ============================================

export const OUTBOUND_COLORS = {
  // Cadence Status
  new: '#64748B',
  scoring: '#94A3B8',
  enriching: '#A78BFA',
  ready: '#3B82F6',
  queued: '#60A5FA',
  in_sequence: '#8B5CF6',
  paused: '#6B7280',
  replied: '#22C55E',
  converted: '#10B981',
  nurture: '#F59E0B',
  archived: '#475569',
  unsubscribed: '#9CA3AF',
  bounced: '#DC2626',

  // Classification
  classA: '#22C55E',
  classB: '#F59E0B',
  classC: '#64748B',

  // Channels
  email: '#3B82F6',
  instagram_dm: '#E1306C',
  whatsapp: '#25D366',

  // Health Status
  healthy: '#22C55E',
  warning: '#F59E0B',
  critical: '#DC2626',
} as const;

// Labels para display
export const CADENCE_STATUS_LABELS: Record<CadenceStatus, string> = {
  new: 'Novo',
  scoring: 'Scoring',
  enriching: 'Enriquecendo',
  ready: 'Pronto',
  queued: 'Na Fila',
  in_sequence: 'Em Sequência',
  paused: 'Pausado',
  replied: 'Respondeu',
  converted: 'Convertido',
  nurture: 'Nurture',
  archived: 'Arquivado',
  unsubscribed: 'Descadastrado',
  bounced: 'Bounced',
};

export const CHANNEL_IN_LABELS: Record<ChannelIn, string> = {
  scraper: 'Scraper',
  comment: 'Comentário',
  story: 'Story',
  form: 'Formulário',
  dm: 'DM',
  whatsapp: 'WhatsApp',
  ad: 'Anúncio',
  referral: 'Indicação',
  manychat: 'ManyChat',
  import: 'Importação',
};

export const ACTIVITY_DIRECTION_LABELS: Record<ActivityDirection, string> = {
  outgoing: 'Enviado',
  incoming: 'Recebido',
  system: 'Sistema',
};

export const CHANNEL_LABELS: Record<Channel, string> = {
  email: 'Email',
  instagram_dm: 'DM Instagram',
  whatsapp: 'WhatsApp',
};

export const CLASSIFICACAO_LABELS: Record<Classificacao, string> = {
  A: 'Classe A',
  B: 'Classe B',
  C: 'Classe C',
};
