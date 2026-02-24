import { useState, useMemo } from 'react';
import {
  BarChart3,
  GitBranch,
  DollarSign,
  CheckSquare,
  Users,
  Target,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/tabs';
import { Badge } from '@/design-system/primitives/badge';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import { cn } from '@/design-system/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useDashboardMetrics, useAIOSFunnelMetrics } from '../hooks/useDashboardMetricsSimple';
import {
  CrmKPICard,
  RevenueTimelineChart,
  PipelineFunnelChart,
  TopDealsTable,
  RecentActivitiesList,
  TasksSummaryCard,
  formatCurrency,
} from '../components/dashboard';

// Tab configuration
const DASHBOARD_TABS = [
  { id: 'overview', label: 'Visao Geral', icon: BarChart3 },
  { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
  { id: 'revenue', label: 'Receita', icon: DollarSign },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { id: 'team', label: 'Equipe', icon: Users },
] as const;

type TabId = (typeof DASHBOARD_TABS)[number]['id'];

// Mock data for charts (will be replaced with real data from hooks)
const MOCK_REVENUE_DATA = [
  { month: 'Set', revenue: 85000, deals: 8 },
  { month: 'Out', revenue: 92000, deals: 10 },
  { month: 'Nov', revenue: 115000, deals: 12 },
  { month: 'Dez', revenue: 127890, deals: 14 },
  { month: 'Jan', revenue: 135000, deals: 11 },
  { month: 'Fev', revenue: 142500, deals: 13 },
];

const MOCK_PIPELINE_STAGES = [
  { name: 'prospection', displayName: 'Prospeccao', count: 127, value: 381000, color: '#64748B' },
  { name: 'qualification', displayName: 'Qualificacao', count: 53, value: 265000, color: '#3B82F6' },
  { name: 'proposal', displayName: 'Proposta', count: 34, value: 204000, color: '#8B5CF6' },
  { name: 'negotiation', displayName: 'Negociacao', count: 18, value: 162000, color: '#F59E0B' },
  { name: 'closing', displayName: 'Fechamento', count: 8, value: 127890, color: '#22C55E' },
];

const MOCK_TOP_DEALS = [
  { id: '1', title: 'Projeto Enterprise', company: 'Tech Solutions', amount: 45000, stage: 'Proposta', stageColor: '#8B5CF6', probability: 75, daysInStage: 5 },
  { id: '2', title: 'Consultoria Estrategica', company: 'ABC Corp', amount: 38500, stage: 'Negociacao', stageColor: '#F59E0B', probability: 85, daysInStage: 3 },
  { id: '3', title: 'Implementacao CRM', company: 'StartupXYZ', amount: 32100, stage: 'Qualificacao', stageColor: '#3B82F6', probability: 45, daysInStage: 7 },
  { id: '4', title: 'Licencas SaaS', company: 'Global Inc', amount: 28900, stage: 'Proposta', stageColor: '#8B5CF6', probability: 60, daysInStage: 4 },
  { id: '5', title: 'Suporte Anual', company: 'Local Store', amount: 24500, stage: 'Fechamento', stageColor: '#22C55E', probability: 95, daysInStage: 2 },
];

const MOCK_ACTIVITIES = [
  { id: '1', type: 'call' as const, title: 'Ligacao com Joao Silva', contactName: 'Tech Solutions', contactEmail: '', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: '2', type: 'email_sent' as const, title: 'Proposta enviada', contactName: 'Maria Santos', contactEmail: '', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', type: 'meeting' as const, title: 'Reuniao agendada', contactName: 'Pedro Costa', contactEmail: '', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', type: 'note' as const, title: 'Follow-up registrado', contactName: 'Ana Oliveira', contactEmail: '', created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: '5', type: 'stage_changed' as const, title: 'Deal movido para Fechamento', contactName: 'Tech Solutions', contactEmail: '', created_at: new Date(Date.now() - 28800000).toISOString() },
];

const MOCK_TEAM = [
  { name: 'Carlos Mendes', deals: 12, revenue: 45890, winRate: 32 },
  { name: 'Julia Ferreira', deals: 9, revenue: 38500, winRate: 28 },
  { name: 'Roberto Lima', deals: 8, revenue: 32100, winRate: 25 },
  { name: 'Patricia Souza', deals: 7, revenue: 28900, winRate: 22 },
  { name: 'Lucas Alves', deals: 6, revenue: 24500, winRate: 20 },
];

export function CrmDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Fetch real data
  const { data: dashboardMetrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: funnelData } = useAIOSFunnelMetrics();

  // Calculate totals
  const totalRevenue = MOCK_REVENUE_DATA.reduce((sum, d) => sum + d.revenue, 0);
  const totalDeals = MOCK_PIPELINE_STAGES.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-display font-bold text-kosmos-white">
            CRM Dashboard
          </h1>
          <p className="text-kosmos-gray text-sm mt-1">
            Metricas e performance do CRM
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px] bg-kosmos-black-light border-border text-kosmos-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-kosmos-orange border-kosmos-orange">
            CRM v2.0
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabId)}
        className="flex-1 flex flex-col px-6 pt-4"
      >
        <TabsList className="w-full justify-start gap-1 bg-kosmos-black-light p-1 rounded-lg overflow-x-auto">
          {DASHBOARD_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap',
                  'data-[state=active]:bg-kosmos-orange data-[state=active]:text-white',
                  'data-[state=inactive]:text-kosmos-gray hover:data-[state=inactive]:text-kosmos-white'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Contents */}
        <div className="flex-1 py-6 overflow-y-auto">
          {/* Overview Tab */}
          <TabsContent value="overview" className="m-0 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              <CrmKPICard
                title="Receita do Mes"
                value={dashboardMetrics ? formatCurrency(dashboardMetrics.revenue_month) : null}
                icon={DollarSign}
                color="text-green-400"
                subtitle="deals fechados"
                isLoading={metricsLoading}
              />
              <CrmKPICard
                title="Pipeline Aberto"
                value={dashboardMetrics ? formatCurrency(dashboardMetrics.pipeline_value) : null}
                icon={Target}
                color="text-blue-400"
                subtitle={`${dashboardMetrics?.deals_open || 0} deals`}
                isLoading={metricsLoading}
              />
              <CrmKPICard
                title="Win Rate"
                value={dashboardMetrics ? `${dashboardMetrics.win_rate_month.toFixed(1)}%` : null}
                icon={TrendingUp}
                color="text-kosmos-orange"
                subtitle="taxa de conversao"
                isLoading={metricsLoading}
              />
              <CrmKPICard
                title="Contatos do Mes"
                value={dashboardMetrics?.contacts_month}
                icon={Users}
                color="text-purple-400"
                subtitle="novos leads"
                isLoading={metricsLoading}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
              {metricsLoading ? (
                <>
                  <Skeleton className="h-80 w-full" />
                  <Skeleton className="h-80 w-full" />
                </>
              ) : (
                <>
                  <RevenueTimelineChart data={MOCK_REVENUE_DATA} totalRevenue={totalRevenue} />
                  <PipelineFunnelChart stages={MOCK_PIPELINE_STAGES} totalDeals={totalDeals} />
                </>
              )}
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-6">
              {metricsLoading ? (
                <>
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                </>
              ) : (
                <>
                  <TopDealsTable deals={MOCK_TOP_DEALS} />
                  <RecentActivitiesList activities={MOCK_ACTIVITIES} limit={5} />
                </>
              )}
            </div>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="m-0 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              <CrmKPICard
                title="Total em Pipeline"
                value={formatCurrency(MOCK_PIPELINE_STAGES.reduce((s, d) => s + d.value, 0))}
                icon={Target}
                color="text-blue-400"
                isLoading={metricsLoading}
              />
              <CrmKPICard
                title="Deals Abertos"
                value={totalDeals}
                icon={Activity}
                color="text-purple-400"
                isLoading={metricsLoading}
              />
              <CrmKPICard
                title="Em Negociacao"
                value={MOCK_PIPELINE_STAGES.find(s => s.name === 'negotiation')?.count || 0}
                icon={GitBranch}
                color="text-yellow-400"
                isLoading={metricsLoading}
              />
              <CrmKPICard
                title="Prontos p/ Fechar"
                value={MOCK_PIPELINE_STAGES.find(s => s.name === 'closing')?.count || 0}
                icon={CheckSquare}
                color="text-green-400"
                isLoading={metricsLoading}
              />
            </div>

            {/* Pipeline Funnel */}
            <PipelineFunnelChart stages={MOCK_PIPELINE_STAGES} totalDeals={totalDeals} />

            {/* Top Deals */}
            <TopDealsTable deals={MOCK_TOP_DEALS} />
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="m-0 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              <CrmKPICard
                title="Receita Total"
                value={formatCurrency(totalRevenue)}
                icon={DollarSign}
                color="text-green-400"
                subtitle="ultimos 6 meses"
                isLoading={metricsLoading}
              />
              <CrmKPICard
                title="Receita Media/Mes"
                value={formatCurrency(totalRevenue / 6)}
                icon={TrendingUp}
                color="text-blue-400"
                isLoading={metricsLoading}
              />
              <CrmKPICard
                title="Deals Fechados"
                value={MOCK_REVENUE_DATA.reduce((s, d) => s + d.deals, 0)}
                icon={Target}
                color="text-purple-400"
                subtitle="no periodo"
                isLoading={metricsLoading}
              />
              <CrmKPICard
                title="Ticket Medio"
                value={formatCurrency(totalRevenue / MOCK_REVENUE_DATA.reduce((s, d) => s + d.deals, 0))}
                icon={Activity}
                color="text-kosmos-orange"
                isLoading={metricsLoading}
              />
            </div>

            {/* Revenue Chart */}
            <RevenueTimelineChart data={MOCK_REVENUE_DATA} totalRevenue={totalRevenue} />

            {/* Top Deals */}
            <TopDealsTable deals={MOCK_TOP_DEALS} />
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="m-0 space-y-6">
            {/* Tasks Summary */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1">
                <TasksSummaryCard
                  pending={dashboardMetrics?.tasks_pending || 0}
                  overdue={dashboardMetrics?.tasks_overdue || 0}
                  completedToday={dashboardMetrics?.tasks_completed_today || 0}
                  isLoading={metricsLoading}
                />
              </div>
              <div className="col-span-2">
                <RecentActivitiesList activities={MOCK_ACTIVITIES} limit={8} />
              </div>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="m-0 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              <CrmKPICard
                title="Total Vendedores"
                value={MOCK_TEAM.length}
                icon={Users}
                color="text-purple-400"
                isLoading={metricsLoading}
              />
              <CrmKPICard
                title="Deals Fechados"
                value={MOCK_TEAM.reduce((s, t) => s + t.deals, 0)}
                icon={Target}
                color="text-green-400"
                subtitle="pela equipe"
                isLoading={metricsLoading}
              />
              <CrmKPICard
                title="Receita Total"
                value={formatCurrency(MOCK_TEAM.reduce((s, t) => s + t.revenue, 0))}
                icon={DollarSign}
                color="text-blue-400"
                isLoading={metricsLoading}
              />
              <CrmKPICard
                title="Win Rate Medio"
                value={`${(MOCK_TEAM.reduce((s, t) => s + t.winRate, 0) / MOCK_TEAM.length).toFixed(1)}%`}
                icon={TrendingUp}
                color="text-kosmos-orange"
                isLoading={metricsLoading}
              />
            </div>

            {/* Team Table */}
            <div className="card-structural p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 bg-purple-500 rounded-r" />
                <Users className="h-5 w-5 text-purple-400" />
                <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
                  Top Vendedores
                </h3>
              </div>

              <div className="space-y-4">
                {MOCK_TEAM.map((member, index) => (
                  <div
                    key={member.name}
                    className="flex items-center justify-between p-4 rounded-lg bg-kosmos-black/50 hover:bg-kosmos-black transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-gray-400/20 text-gray-400' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-kosmos-black-light text-kosmos-gray'
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-kosmos-white font-medium">{member.name}</p>
                        <p className="text-xs text-kosmos-gray">{member.deals} deals fechados</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-green-400 font-medium">{formatCurrency(member.revenue)}</p>
                        <p className="text-xs text-kosmos-gray">receita</p>
                      </div>
                      <div className="text-right">
                        <p className="text-kosmos-orange font-medium">{member.winRate}%</p>
                        <p className="text-xs text-kosmos-gray">win rate</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
