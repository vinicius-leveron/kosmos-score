import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Users, RefreshCw, Clock, TrendingUp, Inbox, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/primitives/table';
import { useNurtureMetrics, REACTIVATION_TRIGGER_LABELS, type ReactivationTrigger } from '../../../hooks/outbound/useNurtureMetrics';
import { OUTBOUND_COLORS, type OutboundFilters, type Classificacao } from '../../../types/outbound';

interface D9NurtureDashboardProps {
  filters: OutboundFilters;
}

// Colors for classifications
const CLASSIFICATION_COLORS: Record<Classificacao, string> = {
  A: OUTBOUND_COLORS.classA,
  B: OUTBOUND_COLORS.classB,
  C: OUTBOUND_COLORS.classC,
};

// Colors for reactivation triggers
const TRIGGER_COLORS: Record<ReactivationTrigger, string> = {
  event: '#8B5CF6', // Purple
  sequence_complete: '#3B82F6', // Blue
  manual: '#22C55E', // Green
  time_based: '#F59E0B', // Amber
};

export function D9NurtureDashboard({ filters }: D9NurtureDashboardProps) {
  const { pool, totals, reactivationsByTrigger, poolByClassification, isLoading, error } =
    useNurtureMetrics(filters);

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Erro ao carregar métricas de nurture: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Prepare donut chart data
  const donutData = poolByClassification.map((item) => ({
    name: `Classe ${item.classificacao}`,
    value: item.count,
    color: CLASSIFICATION_COLORS[item.classificacao],
    percentage: item.percentage,
    avgDays: item.avgDaysDormant,
  }));

  // Prepare bar chart data for reactivations
  const barData = reactivationsByTrigger.map((item) => ({
    trigger: item.label,
    count: item.count,
    color: TRIGGER_COLORS[item.trigger],
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Total em Nurture"
          value={totals.totalInNurture}
          icon={Inbox}
          color="text-amber-400"
        />
        <KPICard
          title="Taxa de Reativação"
          value={`${totals.reactivationRate.toFixed(1)}%`}
          icon={RefreshCw}
          color="text-green-400"
          subtitle="leads reativados"
        />
        <KPICard
          title="Dias Dormentes (média)"
          value={`${totals.avgDaysDormant.toFixed(0)}d`}
          icon={Clock}
          color="text-blue-400"
          subtitle="tempo em nurture"
        />
        <KPICard
          title="Tempo até Reativação"
          value={`${totals.avgTimeToReactivation.toFixed(0)}d`}
          icon={TrendingUp}
          color="text-purple-400"
          subtitle="média para reativar"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Donut Chart - Pool by Classification */}
        <Card className="bg-kosmos-black-light border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-amber-500 rounded-r" />
              <Users className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-sm font-semibold text-kosmos-white tracking-wider uppercase">
                Pool por Classificação
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 8%)',
                      border: '1px solid hsl(0, 0%, 15%)',
                      borderRadius: '8px',
                      color: 'white',
                      fontFamily: 'Space Grotesk',
                    }}
                    formatter={(value: number, _name, props) => {
                      const { percentage, avgDays } = props.payload;
                      return [
                        <div key="content" className="space-y-1">
                          <div className="font-bold">{value.toLocaleString('pt-BR')} leads</div>
                          <div className="text-kosmos-gray">{percentage.toFixed(1)}% do pool</div>
                          <div className="text-kosmos-gray text-xs">
                            Média: {avgDays.toFixed(0)} dias dormentes
                          </div>
                        </div>,
                        '',
                      ];
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-kosmos-gray text-sm">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-60px' }}>
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-kosmos-white">
                  {totals.totalInNurture.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-kosmos-gray">total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - Reactivations by Trigger */}
        <Card className="bg-kosmos-black-light border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-green-500 rounded-r" />
              <RefreshCw className="h-5 w-5 text-green-500" />
              <CardTitle className="text-sm font-semibold text-kosmos-white tracking-wider uppercase">
                Reativações por Gatilho
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(0, 0%, 20%)"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 11 }}
                    axisLine={{ stroke: 'hsl(0, 0%, 20%)' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="trigger"
                    tick={{ fill: 'hsl(0, 0%, 80%)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 8%)',
                      border: '1px solid hsl(0, 0%, 15%)',
                      borderRadius: '8px',
                      color: 'white',
                      fontFamily: 'Space Grotesk',
                    }}
                    formatter={(value: number) => [
                      `${value.toLocaleString('pt-BR')} reativações`,
                      '',
                    ]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={28}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Table */}
      <Card className="bg-kosmos-black-light border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
            <CardTitle className="text-sm font-semibold text-kosmos-white tracking-wider uppercase">
              Detalhamento por Classificação
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-kosmos-gray">Classificação</TableHead>
                <TableHead className="text-kosmos-gray text-right">Em Nurture</TableHead>
                <TableHead className="text-kosmos-gray text-right">Pausados</TableHead>
                <TableHead className="text-kosmos-gray text-right">% do Pool</TableHead>
                <TableHead className="text-kosmos-gray text-right">Dias Dormentes (média)</TableHead>
                <TableHead className="text-kosmos-gray text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {poolByClassification.map((item) => {
                const pausedCount = pool
                  .filter((p) => p.cadence_status === 'paused' && p.classificacao === item.classificacao)
                  .reduce((sum, p) => sum + p.count, 0);

                const status = getStatusForClassification(item.avgDaysDormant, item.classificacao);

                return (
                  <TableRow key={item.classificacao} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CLASSIFICATION_COLORS[item.classificacao] }}
                        />
                        <span className="font-medium text-kosmos-white">
                          Classe {item.classificacao}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-kosmos-white font-medium">
                      {item.count.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right text-kosmos-gray">
                      {pausedCount.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right text-kosmos-white">
                      {item.percentage.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right text-kosmos-gray">
                      {item.avgDaysDormant.toFixed(0)} dias
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-amber-400" />
                <span className="text-kosmos-gray">Total em Nurture:</span>
                <span className="font-medium text-kosmos-white">
                  {totals.totalInNurture.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Pause className="h-4 w-4 text-gray-400" />
                <span className="text-kosmos-gray">Total Pausados:</span>
                <span className="font-medium text-kosmos-white">
                  {totals.totalPaused.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-green-400" />
                <span className="text-kosmos-gray">Taxa de Reativação:</span>
                <span className="font-medium text-green-400">
                  {totals.reactivationRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <NurtureTips
        totalInNurture={totals.totalInNurture}
        avgDaysDormant={totals.avgDaysDormant}
        reactivationRate={totals.reactivationRate}
      />
    </div>
  );
}

// KPI Card Component
interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color?: string;
  subtitle?: string;
}

function KPICard({ title, value, icon: Icon, color = 'text-kosmos-orange', subtitle }: KPICardProps) {
  return (
    <Card className="bg-kosmos-black-light border-border">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`h-5 w-5 ${color}`} />
          <span className="text-sm text-kosmos-gray">{title}</span>
        </div>
        <div className={`text-3xl font-display font-bold ${color}`}>
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </div>
        {subtitle && <div className="text-xs text-kosmos-gray mt-1">{subtitle}</div>}
      </CardContent>
    </Card>
  );
}

// Status Badge Component
interface StatusBadgeProps {
  status: 'healthy' | 'warning' | 'critical';
}

function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    healthy: 'bg-green-900/30 text-green-400 border-green-800/30',
    warning: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/30',
    critical: 'bg-red-900/30 text-red-400 border-red-800/30',
  };

  const labels = {
    healthy: 'Reativar',
    warning: 'Monitorar',
    critical: 'Arquivar?',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// Helper to determine status based on dormancy and classification
function getStatusForClassification(avgDays: number, classificacao: Classificacao): 'healthy' | 'warning' | 'critical' {
  // Class A: More aggressive reactivation
  if (classificacao === 'A') {
    if (avgDays < 30) return 'healthy';
    if (avgDays < 60) return 'warning';
    return 'critical';
  }

  // Class B: Moderate
  if (classificacao === 'B') {
    if (avgDays < 45) return 'healthy';
    if (avgDays < 90) return 'warning';
    return 'critical';
  }

  // Class C: Conservative - consider archiving sooner
  if (avgDays < 30) return 'healthy';
  if (avgDays < 60) return 'warning';
  return 'critical';
}

// Nurture Tips Component
interface NurtureTipsProps {
  totalInNurture: number;
  avgDaysDormant: number;
  reactivationRate: number;
}

function NurtureTips({ totalInNurture, avgDaysDormant, reactivationRate }: NurtureTipsProps) {
  // Determine overall health
  const isPoolLarge = totalInNurture > 500;
  const isDormancyHigh = avgDaysDormant > 60;
  const isReactivationLow = reactivationRate < 10;

  if (!isPoolLarge && !isDormancyHigh && !isReactivationLow) {
    return (
      <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4">
        <h4 className="font-display font-semibold text-green-400 mb-2">
          Pool de Nurture Saudável
        </h4>
        <p className="text-sm text-kosmos-gray">
          Seu pool de nurture está dentro dos padrões esperados. Continue monitorando e
          executando campanhas de reativação periódicas.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg p-4">
      <h4 className="font-display font-semibold text-amber-400 mb-2">
        Oportunidades de Melhoria
      </h4>
      <div className="text-sm text-kosmos-gray space-y-2">
        <ul className="list-disc list-inside space-y-1">
          {isPoolLarge && (
            <li>
              Pool grande ({totalInNurture} leads). Considere segmentar e criar campanhas
              específicas por classificação.
            </li>
          )}
          {isDormancyHigh && (
            <li>
              Tempo médio dormentes alto ({avgDaysDormant.toFixed(0)} dias). Leads Classe C
              com mais de 90 dias podem ser arquivados.
            </li>
          )}
          {isReactivationLow && (
            <li>
              Taxa de reativação baixa ({reactivationRate.toFixed(1)}%). Teste gatilhos
              baseados em eventos (webinars, novos conteúdos).
            </li>
          )}
          <li>
            Leads Classe A em nurture devem ter prioridade máxima para reativação manual.
          </li>
        </ul>
      </div>
    </div>
  );
}
