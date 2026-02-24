import { Users, GitMerge, MessageSquare, Timer } from 'lucide-react';
import { Card, CardContent } from '@/design-system/primitives/card';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { FunnelChart } from '../charts/FunnelChart';
import { useFunnelMetrics, aggregateByStatus } from '../../../hooks/outbound';
import type { OutboundFilters, CadenceStatus } from '../../../types/outbound';

interface D1FunnelDashboardProps {
  filters: OutboundFilters;
}

export function D1FunnelDashboard({ filters }: D1FunnelDashboardProps) {
  const { stages, totals, isLoading, error } = useFunnelMetrics(filters);

  // Aggregate stages by status for the chart
  const aggregated = aggregateByStatus(stages);
  const chartData = Object.entries(aggregated).map(([status, data]) => ({
    status: status as CadenceStatus,
    count: data.count,
    avgDays: data.avgDays,
  }));

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Erro ao carregar métricas do funil: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Total Leads"
          value={totals?.total_leads}
          icon={Users}
          isLoading={isLoading}
        />
        <KPICard
          title="Em Sequência"
          value={totals?.in_sequence}
          icon={GitMerge}
          color="text-purple-400"
          isLoading={isLoading}
        />
        <KPICard
          title="Responderam"
          value={totals?.replied}
          icon={MessageSquare}
          color="text-green-400"
          subtitle={totals?.reply_rate ? `${totals.reply_rate}% taxa` : undefined}
          isLoading={isLoading}
        />
        <KPICard
          title="Velocity Média"
          value={totals?.avg_days_to_reply ? `${totals.avg_days_to_reply.toFixed(1)}d` : '-'}
          icon={Timer}
          color="text-blue-400"
          subtitle="dias até resposta"
          isLoading={isLoading}
        />
      </div>

      {/* Funnel Chart */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <FunnelChart data={chartData} />
      )}

      {/* Breakdown by Classification */}
      <div className="grid grid-cols-3 gap-4">
        <ClassificationCard
          classification="A"
          stages={stages}
          isLoading={isLoading}
        />
        <ClassificationCard
          classification="B"
          stages={stages}
          isLoading={isLoading}
        />
        <ClassificationCard
          classification="C"
          stages={stages}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

// KPI Card Component
interface KPICardProps {
  title: string;
  value: number | string | null | undefined;
  icon: React.ElementType;
  color?: string;
  subtitle?: string;
  isLoading?: boolean;
}

function KPICard({ title, value, icon: Icon, color = 'text-kosmos-orange', subtitle, isLoading }: KPICardProps) {
  return (
    <Card className="bg-kosmos-black-light border-border">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`h-5 w-5 ${color}`} />
          <span className="text-sm text-kosmos-gray">{title}</span>
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className={`text-3xl font-display font-bold ${color}`}>
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value || '0'}
            </div>
            {subtitle && <div className="text-xs text-kosmos-gray mt-1">{subtitle}</div>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Classification Breakdown Card
interface ClassificationCardProps {
  classification: 'A' | 'B' | 'C';
  stages: { classificacao: string | null; cadence_status: string; count: number }[];
  isLoading?: boolean;
}

function ClassificationCard({ classification, stages, isLoading }: ClassificationCardProps) {
  const colors = { A: 'text-green-400', B: 'text-yellow-400', C: 'text-gray-400' };
  const bgColors = { A: 'bg-green-400/10', B: 'bg-yellow-400/10', C: 'bg-gray-400/10' };

  const classStages = stages.filter((s) => s.classificacao === classification);
  const total = classStages.reduce((sum, s) => sum + s.count, 0);
  const inSequence = classStages.find((s) => s.cadence_status === 'in_sequence')?.count || 0;
  const replied = classStages.find((s) => s.cadence_status === 'replied')?.count || 0;
  const replyRate = inSequence + replied > 0 ? ((replied / (inSequence + replied)) * 100).toFixed(1) : '0';

  return (
    <Card className={`bg-kosmos-black-light border-border ${bgColors[classification]}`}>
      <CardContent className="pt-6">
        <div className={`text-lg font-display font-bold ${colors[classification]} mb-4`}>
          Classe {classification}
        </div>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-kosmos-gray">Total</span>
              <span className="text-kosmos-white font-medium">{total.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-kosmos-gray">Em Sequência</span>
              <span className="text-kosmos-white font-medium">{inSequence.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-kosmos-gray">Responderam</span>
              <span className="text-green-400 font-medium">{replied.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-kosmos-gray">Taxa de Resposta</span>
              <span className={`font-medium ${colors[classification]}`}>{replyRate}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
