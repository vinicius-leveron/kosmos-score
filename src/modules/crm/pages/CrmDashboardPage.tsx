import { useState } from 'react';
import {
  BarChart3,
  GitBranch,
  DollarSign,
  CheckSquare,
  Users,
  Target,
  TrendingUp,
  Activity,
  Radio,
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
import {
  useDashboardMetrics,
  useAIOSFunnelMetrics,
  useRevenueTimeline,
  usePipelineStats,
  useTopDeals,
  useTeamPerformance,
  useRecentActivities,
} from '../hooks/useDashboardMetricsSimple';
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
  { id: 'outbound', label: 'Outbound', icon: Radio },
] as const;

type TabId = (typeof DASHBOARD_TABS)[number]['id'];

export function CrmDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Fetch real data from hooks
  const { data: dashboardMetrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: funnelData } = useAIOSFunnelMetrics();
  const { data: revenueData = [], isLoading: revenueLoading } = useRevenueTimeline();
  const { data: pipelineStages = [], isLoading: pipelineLoading } = usePipelineStats();
  const { data: topDeals = [], isLoading: dealsLoading } = useTopDeals();
  const { data: teamData = [], isLoading: teamLoading } = useTeamPerformance();
  const { data: activities = [], isLoading: activitiesLoading } = useRecentActivities();

  // Calculate totals from real data
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalDeals = pipelineStages.reduce((sum, s) => sum + s.count, 0);
  const isLoading = metricsLoading || revenueLoading || pipelineLoading || dealsLoading || teamLoading;

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
              {isLoading ? (
                <>
                  <Skeleton className="h-80 w-full" />
                  <Skeleton className="h-80 w-full" />
                </>
              ) : (
                <>
                  <RevenueTimelineChart data={revenueData} totalRevenue={totalRevenue} />
                  <PipelineFunnelChart stages={pipelineStages} totalDeals={totalDeals} />
                </>
              )}
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-6">
              {isLoading ? (
                <>
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                </>
              ) : (
                <>
                  <TopDealsTable deals={topDeals} />
                  <RecentActivitiesList activities={activities} limit={5} />
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
                value={formatCurrency(pipelineStages.reduce((s, d) => s + d.value, 0))}
                icon={Target}
                color="text-blue-400"
                isLoading={pipelineLoading}
              />
              <CrmKPICard
                title="Deals Abertos"
                value={totalDeals}
                icon={Activity}
                color="text-purple-400"
                isLoading={pipelineLoading}
              />
              <CrmKPICard
                title="Em Negociacao"
                value={pipelineStages.find(s => s.name === 'negotiation')?.count || 0}
                icon={GitBranch}
                color="text-yellow-400"
                isLoading={pipelineLoading}
              />
              <CrmKPICard
                title="Prontos p/ Fechar"
                value={pipelineStages.find(s => s.name === 'closing')?.count || 0}
                icon={CheckSquare}
                color="text-green-400"
                isLoading={pipelineLoading}
              />
            </div>

            {/* Pipeline Funnel */}
            <PipelineFunnelChart stages={pipelineStages} totalDeals={totalDeals} />

            {/* Top Deals */}
            <TopDealsTable deals={topDeals} />
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
                isLoading={revenueLoading}
              />
              <CrmKPICard
                title="Receita Media/Mes"
                value={formatCurrency(revenueData.length > 0 ? totalRevenue / revenueData.length : 0)}
                icon={TrendingUp}
                color="text-blue-400"
                isLoading={revenueLoading}
              />
              <CrmKPICard
                title="Deals Fechados"
                value={revenueData.reduce((s, d) => s + d.deals, 0)}
                icon={Target}
                color="text-purple-400"
                subtitle="no periodo"
                isLoading={revenueLoading}
              />
              <CrmKPICard
                title="Ticket Medio"
                value={formatCurrency(
                  revenueData.reduce((s, d) => s + d.deals, 0) > 0
                    ? totalRevenue / revenueData.reduce((s, d) => s + d.deals, 0)
                    : 0
                )}
                icon={Activity}
                color="text-kosmos-orange"
                isLoading={revenueLoading}
              />
            </div>

            {/* Revenue Chart */}
            <RevenueTimelineChart data={revenueData} totalRevenue={totalRevenue} />

            {/* Top Deals */}
            <TopDealsTable deals={topDeals} />
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
                <RecentActivitiesList activities={activities} limit={8} />
              </div>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="m-0 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              <CrmKPICard
                title="Total Vendedores"
                value={teamData.length}
                icon={Users}
                color="text-purple-400"
                isLoading={teamLoading}
              />
              <CrmKPICard
                title="Deals Fechados"
                value={teamData.reduce((s, t) => s + t.deals, 0)}
                icon={Target}
                color="text-green-400"
                subtitle="pela equipe"
                isLoading={teamLoading}
              />
              <CrmKPICard
                title="Receita Total"
                value={formatCurrency(teamData.reduce((s, t) => s + t.revenue, 0))}
                icon={DollarSign}
                color="text-blue-400"
                isLoading={teamLoading}
              />
              <CrmKPICard
                title="Win Rate Medio"
                value={teamData.length > 0 ? `${(teamData.reduce((s, t) => s + t.winRate, 0) / teamData.length).toFixed(1)}%` : '0%'}
                icon={TrendingUp}
                color="text-kosmos-orange"
                isLoading={teamLoading}
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

              {teamLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : teamData.length === 0 ? (
                <div className="text-center py-8 text-kosmos-gray">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum vendedor com deals fechados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamData.map((member, index) => (
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
              )}
            </div>
          </TabsContent>

          {/* Outbound Tab */}
          <TabsContent value="outbound" className="m-0">
            <div className="p-8 text-center text-muted-foreground">
              <p>Outbound dashboard em breve</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
