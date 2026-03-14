import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/primitives/select';
import { useInstagramAccounts } from '../hooks/useInstagramAccounts';
import { useReelsWithInsights } from '../hooks/useMediaInsights';
import { useAccountInsights } from '../hooks/useAccountInsights';
import { ConnectInstagramFlow } from '../components/ConnectInstagramFlow';
import { AccountSelector } from '../components/AccountSelector';
import { OverviewTab } from '../components/dashboard/OverviewTab';
import { ReelsList } from '../components/reels/ReelsList';
import { RetentionScatterPlot } from '../components/retention/RetentionScatterPlot';
import { RetentionRanking } from '../components/retention/RetentionRanking';
import { HookQuadrantChart } from '../components/hook-quadrant/HookQuadrantChart';
import { ViewsEvolutionChart } from '../components/temporal/ViewsEvolutionChart';
import { FollowerGrowthChart } from '../components/temporal/FollowerGrowthChart';
import { ContentBreakdownChart } from '../components/temporal/ContentBreakdownChart';
import { ViralityAnalysis } from '../components/virality/ViralityAnalysis';
import { ViewsDistribution } from '../components/virality/ViewsDistribution';
import { BenchmarkByDay } from '../components/benchmarking/BenchmarkByDay';
import { BenchmarkByDuration } from '../components/benchmarking/BenchmarkByDuration';
import { BoostedComparison } from '../components/benchmarking/BoostedComparison';
import { OrganicVsPaidChart } from '../components/roi/OrganicVsPaidChart';
import { PaidFunnelChart } from '../components/roi/PaidFunnelChart';
import { ROISummaryCard } from '../components/roi/ROISummaryCard';
import { DATE_RANGE_OPTIONS } from '../lib/constants';
import type { DateRange, DashboardTab } from '../types';

export function InstagramAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const { data: accounts, isLoading: accountsLoading } = useInstagramAccounts();
  const { data: reels, isLoading: reelsLoading } = useReelsWithInsights(selectedAccountId, dateRange);
  const { data: accountInsights, isLoading: insightsLoading } = useAccountInsights(selectedAccountId, dateRange);

  const hasAccounts = accounts && accounts.length > 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Instagram Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Metricas organicas e pagas unificadas
          </p>
        </div>
        {hasAccounts && (
          <div className="flex gap-2">
            <AccountSelector
              accounts={accounts}
              selectedId={selectedAccountId}
              onSelect={setSelectedAccountId}
            />
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger className="w-[180px]" aria-label="Periodo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <ConnectInstagramFlow />

      {hasAccounts && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DashboardTab)}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reels">Reels</TabsTrigger>
            <TabsTrigger value="retention">Retencao</TabsTrigger>
            <TabsTrigger value="evolution">Evolucao</TabsTrigger>
            <TabsTrigger value="virality">Viralidade</TabsTrigger>
            <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
            <TabsTrigger value="roi">ROI Pago</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab reels={reels || []} isLoading={reelsLoading} />
          </TabsContent>

          <TabsContent value="reels" className="mt-6">
            <ReelsList reels={reels || []} isLoading={reelsLoading} />
          </TabsContent>

          <TabsContent value="retention" className="mt-6 space-y-6">
            <RetentionScatterPlot reels={reels || []} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HookQuadrantChart reels={reels || []} />
              <RetentionRanking reels={reels || []} />
            </div>
          </TabsContent>

          <TabsContent value="evolution" className="mt-6 space-y-6">
            <ViewsEvolutionChart insights={accountInsights || []} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FollowerGrowthChart insights={accountInsights || []} />
              <ContentBreakdownChart insights={accountInsights || []} />
            </div>
          </TabsContent>

          <TabsContent value="virality" className="mt-6 space-y-6">
            <ViralityAnalysis reels={reels || []} />
            <ViewsDistribution reels={reels || []} />
          </TabsContent>

          <TabsContent value="benchmarking" className="mt-6 space-y-6">
            <BenchmarkByDay reels={reels || []} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BenchmarkByDuration reels={reels || []} />
              <BoostedComparison reels={reels || []} />
            </div>
          </TabsContent>

          <TabsContent value="roi" className="mt-6 space-y-6">
            <ROISummaryCard reels={reels || []} />
            <OrganicVsPaidChart reels={reels || []} />
            <PaidFunnelChart reels={reels || []} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
