import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/design-system/primitives/card';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { cn } from '@/design-system/lib/utils';
import {
  useScoringMetrics,
  calculateBucketPercentages,
  getBucketColor,
  getScoringInsights,
  SCORE_BUCKETS,
} from '../../../hooks/outbound/useScoringMetrics';
import { OUTBOUND_COLORS, type OutboundFilters, type Classificacao } from '../../../types/outbound';

interface D4ScoringDashboardProps {
  filters: OutboundFilters;
}

export function D4ScoringDashboard({ filters }: D4ScoringDashboardProps) {
  const { metrics, isLoading, error } = useScoringMetrics(filters);

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Erro ao carregar metricas de scoring: {error.message}
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
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-8 text-center text-kosmos-gray">
        Nenhum dado de scoring disponivel
      </div>
    );
  }

  const { distribution, classificationBreakdown, validationMetrics } = metrics;
  const distributionWithPercentages = calculateBucketPercentages(distribution);
  const insights = getScoringInsights(metrics);

  // Prepare histogram data - aggregate by bucket for chart
  const histogramData = SCORE_BUCKETS.map((bucket) => {
    const bucketItems = distributionWithPercentages.filter((d) => d.scoreBucket === bucket);
    const total = bucketItems.reduce((sum, item) => sum + item.total, 0);
    const replied = bucketItems.reduce((sum, item) => sum + item.replied, 0);
    const replyRate = total > 0 ? (replied / total) * 100 : 0;
    const classificacao = bucketItems[0]?.classificacao || 'C';
    return {
      bucket,
      total,
      replied,
      replyRate,
      classificacao,
      color: getBucketColor(classificacao as Classificacao),
    };
  });

  // Prepare pie chart data
  const pieData = [
    { name: 'Classe A', value: classificationBreakdown.A, color: OUTBOUND_COLORS.classA },
    { name: 'Classe B', value: classificationBreakdown.B, color: OUTBOUND_COLORS.classB },
    { name: 'Classe C', value: classificationBreakdown.C, color: OUTBOUND_COLORS.classC },
  ].filter((item) => item.value > 0);

  const totalLeads = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Score Medio Respondidos"
          value={validationMetrics.avgScoreReplied.toFixed(1)}
          icon={TrendingUp}
          color="text-green-400"
          subtitle="pontos"
        />
        <KPICard
          title="Score Medio Nao Respondidos"
          value={validationMetrics.avgScoreNotReplied.toFixed(1)}
          icon={TrendingDown}
          color="text-kosmos-gray"
          subtitle="pontos"
        />
        <KPICard
          title="Falsos Positivos"
          value={`${validationMetrics.falsePositiveRate.toFixed(1)}%`}
          icon={AlertTriangle}
          color={validationMetrics.falsePositiveRate > 15 ? 'text-red-400' : 'text-yellow-400'}
          subtitle="Classe A sem resposta"
        />
        <KPICard
          title="Falsos Negativos"
          value={`${validationMetrics.falseNegativeRate.toFixed(1)}%`}
          icon={CheckCircle}
          color="text-blue-400"
          subtitle="Classe C que converteu"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Score Distribution Histogram */}
        <ScoreHistogram data={histogramData} totalLeads={totalLeads} />

        {/* Classification Pie Chart */}
        <ClassificationPieChart data={pieData} totalLeads={totalLeads} />
      </div>

      {/* Score Validation Insights */}
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <InsightCard key={index} {...insight} />
        ))}
      </div>

      {/* Detailed Breakdown Table */}
      <ScoreBreakdownTable distribution={distributionWithPercentages} />
    </div>
  );
}

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string;
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
        <div className={`text-3xl font-display font-bold ${color}`}>{value}</div>
        {subtitle && <div className="text-xs text-kosmos-gray mt-1">{subtitle}</div>}
      </CardContent>
    </Card>
  );
}

// Score Histogram Component
interface ScoreHistogramProps {
  data: {
    bucket: string;
    total: number;
    replied: number;
    replyRate: number;
    classificacao: string;
    color: string;
  }[];
  totalLeads: number;
}

function ScoreHistogram({ data, totalLeads }: ScoreHistogramProps) {
  return (
    <div className="card-structural p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
        <Target className="h-5 w-5 text-kosmos-orange" />
        <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
          Distribuicao de Score
        </h3>
        <span className="ml-auto text-sm text-kosmos-gray">
          {totalLeads.toLocaleString('pt-BR')} leads
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(0, 0%, 20%)"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="bucket"
              tick={{ fill: 'hsl(0, 0%, 80%)', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(0, 0%, 20%)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(0, 0%, 20%)' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 8%)',
                border: '1px solid hsl(0, 0%, 15%)',
                borderRadius: '8px',
                color: 'white',
                fontFamily: 'Space Grotesk',
              }}
              formatter={(value: number, name: string, props) => {
                if (name === 'total') {
                  const replyRate = props.payload?.replyRate;
                  return [
                    <div key="content" className="space-y-1">
                      <div className="font-bold">{value.toLocaleString('pt-BR')} leads</div>
                      <div className="text-kosmos-gray">
                        {props.payload?.replied || 0} responderam ({replyRate?.toFixed(1)}%)
                      </div>
                    </div>,
                    '',
                  ];
                }
                return [value, name];
              }}
              labelFormatter={(label) => `Score: ${label}`}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: OUTBOUND_COLORS.classC }} />
          <span className="text-kosmos-gray">Classe C (0-40)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: OUTBOUND_COLORS.classB }} />
          <span className="text-kosmos-gray">Classe B (41-80)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: OUTBOUND_COLORS.classA }} />
          <span className="text-kosmos-gray">Classe A (81-100)</span>
        </div>
      </div>
    </div>
  );
}

// Classification Pie Chart Component
interface ClassificationPieChartProps {
  data: { name: string; value: number; color: string }[];
  totalLeads: number;
}

function ClassificationPieChart({ data, totalLeads }: ClassificationPieChartProps) {
  return (
    <div className="card-structural p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
        <Target className="h-5 w-5 text-kosmos-orange" />
        <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
          Breakdown por Classificacao
        </h3>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={{ stroke: 'hsl(0, 0%, 40%)', strokeWidth: 1 }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
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
              formatter={(value: number) => [
                <div key="content">
                  <span className="font-bold">{value.toLocaleString('pt-BR')} leads</span>
                  <span className="text-kosmos-gray ml-2">
                    ({((value / totalLeads) * 100).toFixed(1)}%)
                  </span>
                </div>,
                '',
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-kosmos-white text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <div className="text-lg font-display font-bold" style={{ color: item.color }}>
              {item.value.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-kosmos-gray">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Insight Card Component
interface InsightCardProps {
  type: 'success' | 'warning' | 'error';
  title: string;
  description: string;
}

function InsightCard({ type, title, description }: InsightCardProps) {
  const styles = {
    success: {
      bg: 'bg-green-900/20',
      border: 'border-green-800/30',
      titleColor: 'text-green-400',
      icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-900/20',
      border: 'border-yellow-800/30',
      titleColor: 'text-yellow-400',
      icon: AlertTriangle,
    },
    error: {
      bg: 'bg-red-900/20',
      border: 'border-red-800/30',
      titleColor: 'text-red-400',
      icon: AlertTriangle,
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={cn('rounded-lg p-4 border', style.bg, style.border)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', style.titleColor)} />
        <div>
          <h4 className={cn('font-display font-semibold mb-1', style.titleColor)}>{title}</h4>
          <p className="text-sm text-kosmos-gray">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Score Breakdown Table Component
interface ScoreBreakdownTableProps {
  distribution: (ScoreBucketMetricWithPercentage)[];
}

interface ScoreBucketMetricWithPercentage {
  scoreBucket: string;
  classificacao: string;
  total: number;
  replied: number;
  replyRate: number;
  percentage: number;
}

function ScoreBreakdownTable({ distribution }: ScoreBreakdownTableProps) {
  return (
    <div className="card-structural p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
        <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
          Detalhamento por Faixa de Score
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-kosmos-gray border-b border-border">
              <th className="pb-3 font-medium">Faixa</th>
              <th className="pb-3 font-medium">Classe</th>
              <th className="pb-3 font-medium text-right">Total</th>
              <th className="pb-3 font-medium text-right">Responderam</th>
              <th className="pb-3 font-medium text-right">Taxa</th>
              <th className="pb-3 font-medium text-right">% do Total</th>
            </tr>
          </thead>
          <tbody>
            {distribution.map((item, index) => (
              <tr key={index} className="border-b border-border/50 hover:bg-white/5">
                <td className="py-3 font-medium text-kosmos-white">{item.scoreBucket}</td>
                <td className="py-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${getBucketColor(item.classificacao as Classificacao)}20`,
                      color: getBucketColor(item.classificacao as Classificacao),
                    }}
                  >
                    Classe {item.classificacao}
                  </span>
                </td>
                <td className="py-3 text-right text-kosmos-white">
                  {item.total.toLocaleString('pt-BR')}
                </td>
                <td className="py-3 text-right text-green-400">
                  {item.replied.toLocaleString('pt-BR')}
                </td>
                <td className="py-3 text-right text-kosmos-white">{item.replyRate.toFixed(1)}%</td>
                <td className="py-3 text-right text-kosmos-gray">{item.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
