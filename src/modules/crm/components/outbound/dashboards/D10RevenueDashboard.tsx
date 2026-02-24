import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, Target, Percent, ArrowRight, Info, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent } from '@/design-system/primitives/card';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { Alert, AlertDescription } from '@/design-system/primitives/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/primitives/table';
import { cn } from '@/design-system/lib/utils';
import {
  useRevenueMetrics,
  formatCurrency,
  getRevenueSourceColor,
} from '../../../hooks/outbound/useRevenueMetrics';
import { CHANNEL_IN_LABELS, type ChannelIn, type OutboundFilters } from '../../../types/outbound';

interface D10RevenueDashboardProps {
  filters: OutboundFilters;
}

export function D10RevenueDashboard({ filters }: D10RevenueDashboardProps) {
  const {
    bySource,
    totals,
    comparison,
    topRevenueSource,
    bestRoiSource,
    isLoading,
    error,
  } = useRevenueMetrics(filters);

  // Prepare chart data sorted by revenue
  const chartData = [...bySource]
    .sort((a, b) => b.revenue - a.revenue)
    .map((source) => ({
      source: source.source,
      label: CHANNEL_IN_LABELS[source.source as ChannelIn] || source.source,
      revenue: source.revenue,
      pipeline: source.pipelineValue,
      winRate: source.winRate,
      color: getRevenueSourceColor(source.source),
    }));

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Erro ao carregar metricas de receita: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Context Banner */}
      <Alert className="bg-kosmos-black-light border-kosmos-orange/30">
        <Info className="h-4 w-4 text-kosmos-orange" />
        <AlertDescription className="text-kosmos-gray">
          Esta visao mostra receita de deals criados a partir de leads de outbound.
          Para a visao total do CRM,{' '}
          <Link to="/admin/crm" className="text-kosmos-orange hover:underline inline-flex items-center gap-1">
            acesse o Dashboard principal <ArrowRight className="h-3 w-3" />
          </Link>
        </AlertDescription>
      </Alert>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Receita Outbound"
          value={formatCurrency(totals.totalRevenue)}
          icon={DollarSign}
          color="text-green-400"
          subtitle="deals fechados"
          isLoading={isLoading}
        />
        <KPICard
          title="Pipeline Outbound"
          value={formatCurrency(totals.totalPipeline)}
          icon={BarChart3}
          color="text-blue-400"
          subtitle="em aberto"
          isLoading={isLoading}
        />
        <KPICard
          title="Ticket Medio"
          value={formatCurrency(totals.avgDealSize)}
          icon={Target}
          color="text-purple-400"
          isLoading={isLoading}
        />
        <KPICard
          title="Win Rate"
          value={`${totals.winRate.toFixed(1)}%`}
          icon={Percent}
          color="text-kosmos-orange"
          subtitle="taxa de conversao"
          isLoading={isLoading}
        />
      </div>

      {/* Revenue Bar Chart */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <RevenueBarChart data={chartData} totalRevenue={totals.totalRevenue} />
      )}

      {/* Two columns: Attribution Table + Comparison Widget */}
      <div className="grid grid-cols-3 gap-6">
        {/* Attribution Table - 2/3 width */}
        <div className="col-span-2">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <AttributionTable
              sources={bySource}
              topRevenueSource={topRevenueSource}
              bestRoiSource={bestRoiSource}
            />
          )}
        </div>

        {/* Comparison Widget - 1/3 width */}
        <div className="col-span-1">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ComparisonWidget
              outboundRevenue={totals.totalRevenue}
              totalCrmRevenue={comparison.totalCrmRevenue}
              percentage={comparison.outboundPercentage}
            />
          )}
        </div>
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

function KPICard({
  title,
  value,
  icon: Icon,
  color = 'text-kosmos-orange',
  subtitle,
  isLoading,
}: KPICardProps) {
  return (
    <Card className="bg-kosmos-black-light border-border">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`h-5 w-5 ${color}`} />
          <span className="text-sm text-kosmos-gray">{title}</span>
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className={`text-2xl font-display font-bold ${color}`}>
              {value || '-'}
            </div>
            {subtitle && <div className="text-xs text-kosmos-gray mt-1">{subtitle}</div>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Revenue Bar Chart
interface RevenueBarChartProps {
  data: {
    source: string;
    label: string;
    revenue: number;
    pipeline: number;
    winRate: number;
    color: string;
  }[];
  totalRevenue: number;
}

function RevenueBarChart({ data, totalRevenue }: RevenueBarChartProps) {
  return (
    <div className="card-structural p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-green-500 rounded-r" />
        <DollarSign className="h-5 w-5 text-green-400" />
        <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
          Receita por Origem
        </h3>
        <span className="ml-auto text-sm text-kosmos-gray">
          {formatCurrency(totalRevenue)} total
        </span>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 90, bottom: 10 }}
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
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: 'hsl(0, 0%, 80%)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 8%)',
                border: '1px solid hsl(0, 0%, 15%)',
                borderRadius: '8px',
                color: 'white',
                fontFamily: 'Space Grotesk',
              }}
              formatter={(value: number, _name, props) => {
                const winRate = props.payload?.winRate;
                const pipeline = props.payload?.pipeline;
                const percentage = totalRevenue > 0 ? ((value / totalRevenue) * 100).toFixed(1) : '0';
                return [
                  <div key="content" className="space-y-1">
                    <div className="font-bold text-green-400">{formatCurrency(value)} receita</div>
                    {pipeline > 0 && (
                      <div className="text-blue-400 text-sm">{formatCurrency(pipeline)} em pipeline</div>
                    )}
                    <div className="text-kosmos-gray text-sm">{percentage}% do total</div>
                    {winRate !== undefined && (
                      <div className="text-yellow-400 text-xs">
                        {winRate.toFixed(1)}% win rate
                      </div>
                    )}
                  </div>,
                  '',
                ];
              }}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
        {data.slice(0, 5).map((item) => (
          <div key={item.source} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: item.color }} />
            <span className="text-kosmos-gray">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Attribution Table
interface AttributionTableProps {
  sources: {
    source: string;
    dealsCount: number;
    pipelineValue: number;
    revenue: number;
    avgDealSize: number;
    winRate: number;
  }[];
  topRevenueSource: string;
  bestRoiSource: string;
}

function AttributionTable({ sources, topRevenueSource, bestRoiSource }: AttributionTableProps) {
  // Sort by revenue descending
  const sortedSources = [...sources].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="card-structural p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
        <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
          Atribuicao de Receita
        </h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-kosmos-gray">Origem</TableHead>
              <TableHead className="text-kosmos-gray text-right">Deals</TableHead>
              <TableHead className="text-kosmos-gray text-right">Pipeline</TableHead>
              <TableHead className="text-kosmos-gray text-right">Receita</TableHead>
              <TableHead className="text-kosmos-gray text-right">Ticket Med</TableHead>
              <TableHead className="text-kosmos-gray text-right">Win Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSources.map((source) => {
              const isTopRevenue = source.source === topRevenueSource;
              const isBestRoi = source.source === bestRoiSource;

              return (
                <TableRow key={source.source} className="border-border">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded"
                        style={{ backgroundColor: getRevenueSourceColor(source.source) }}
                      />
                      <span className="text-kosmos-white">
                        {CHANNEL_IN_LABELS[source.source as ChannelIn] || source.source}
                      </span>
                      {isTopRevenue && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">
                          TOP
                        </span>
                      )}
                      {isBestRoi && !isTopRevenue && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                          ROI
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-kosmos-white">
                    {source.dealsCount.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right text-blue-400">
                    {formatCurrency(source.pipelineValue)}
                  </TableCell>
                  <TableCell className="text-right text-green-400 font-medium">
                    {formatCurrency(source.revenue)}
                  </TableCell>
                  <TableCell className="text-right text-kosmos-white">
                    {formatCurrency(source.avgDealSize)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'font-medium',
                        source.winRate >= 50 ? 'text-green-400' :
                        source.winRate >= 35 ? 'text-yellow-400' : 'text-gray-400'
                      )}
                    >
                      {source.winRate.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Comparison Widget
interface ComparisonWidgetProps {
  outboundRevenue: number;
  totalCrmRevenue: number;
  percentage: number;
}

function ComparisonWidget({ outboundRevenue, totalCrmRevenue, percentage }: ComparisonWidgetProps) {
  return (
    <div className="card-structural p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-purple-500 rounded-r" />
        <TrendingUp className="h-5 w-5 text-purple-400" />
        <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
          Outbound vs Total
        </h3>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-6">
        {/* Outbound */}
        <div className="text-center">
          <div className="text-xs text-kosmos-gray mb-1 uppercase tracking-wider">Outbound</div>
          <div className="text-3xl font-display font-bold text-green-400">
            {formatCurrency(outboundRevenue)}
          </div>
        </div>

        {/* Visual separator with percentage */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <div className="px-3 py-1.5 bg-kosmos-orange/20 rounded-full">
            <span className="text-sm font-bold text-kosmos-orange">{percentage}%</span>
          </div>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Total CRM */}
        <div className="text-center">
          <div className="text-xs text-kosmos-gray mb-1 uppercase tracking-wider">Total CRM</div>
          <div className="text-3xl font-display font-bold text-kosmos-white">
            {formatCurrency(totalCrmRevenue)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="h-2 bg-kosmos-black rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-kosmos-gray text-center mt-2">
          Outbound representa {percentage}% da receita total
        </p>
      </div>
    </div>
  );
}
