import { Compass, TrendingUp, Users, Percent } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/primitives/table';
import { cn } from '@/design-system/lib/utils';
import { useSourceMetrics, getSourceColor } from '../../../hooks/outbound/useSourceMetrics';
import { CHANNEL_IN_LABELS, type ChannelIn, type OutboundFilters } from '../../../types/outbound';

interface D2SourceDashboardProps {
  filters: OutboundFilters;
}

export function D2SourceDashboard({ filters }: D2SourceDashboardProps) {
  const {
    sources,
    topSource,
    bestConvertingSource,
    totalLeads,
    avgReplyRate,
    isLoading,
    error,
  } = useSourceMetrics(filters);

  // Prepare chart data sorted by totalLeads
  const chartData = [...sources]
    .sort((a, b) => b.totalLeads - a.totalLeads)
    .map((source) => ({
      source: source.source,
      label: CHANNEL_IN_LABELS[source.source as ChannelIn] || source.source,
      totalLeads: source.totalLeads,
      replyRate: source.replyRate,
      color: getSourceColor(source.source),
    }));

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Erro ao carregar metricas de origem: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Melhor Origem"
          value={CHANNEL_IN_LABELS[topSource as ChannelIn] || topSource || '-'}
          icon={Compass}
          color="text-kosmos-orange"
          subtitle="maior volume"
          isLoading={isLoading}
        />
        <KPICard
          title="Maior Conversao"
          value={CHANNEL_IN_LABELS[bestConvertingSource as ChannelIn] || bestConvertingSource || '-'}
          icon={TrendingUp}
          color="text-green-400"
          subtitle="maior taxa de resposta"
          isLoading={isLoading}
        />
        <KPICard
          title="Total Leads"
          value={totalLeads}
          icon={Users}
          color="text-blue-400"
          isLoading={isLoading}
        />
        <KPICard
          title="Taxa Media"
          value={`${avgReplyRate.toFixed(1)}%`}
          icon={Percent}
          color="text-purple-400"
          subtitle="de resposta"
          isLoading={isLoading}
        />
      </div>

      {/* Horizontal Bar Chart */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <SourceBarChart data={chartData} totalLeads={totalLeads} />
      )}

      {/* Source Breakdown Table */}
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <SourceTable sources={sources} />
      )}
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
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className={`text-2xl font-display font-bold ${color}`}>
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value || '-'}
            </div>
            {subtitle && <div className="text-xs text-kosmos-gray mt-1">{subtitle}</div>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Horizontal Bar Chart for Sources
interface SourceBarChartProps {
  data: {
    source: string;
    label: string;
    totalLeads: number;
    replyRate: number;
    color: string;
  }[];
  totalLeads: number;
}

function SourceBarChart({ data, totalLeads }: SourceBarChartProps) {
  return (
    <div className="card-structural p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
        <Compass className="h-5 w-5 text-kosmos-orange" />
        <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
          Leads por Origem
        </h3>
        <span className="ml-auto text-sm text-kosmos-gray">
          {totalLeads.toLocaleString('pt-BR')} leads
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
                const replyRate = props.payload?.replyRate;
                const percentage = totalLeads > 0 ? ((value / totalLeads) * 100).toFixed(1) : '0';
                return [
                  <div key="content" className="space-y-1">
                    <div className="font-bold">{value.toLocaleString('pt-BR')} leads</div>
                    <div className="text-kosmos-gray">{percentage}% do total</div>
                    {replyRate !== undefined && (
                      <div className="text-green-400 text-xs">
                        {replyRate.toFixed(1)}% taxa de resposta
                      </div>
                    )}
                  </div>,
                  '',
                ];
              }}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="totalLeads" radius={[0, 4, 4, 0]} barSize={24}>
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

// Source Breakdown Table
interface SourceTableProps {
  sources: {
    source: string;
    totalLeads: number;
    avgIcpScore: number | null;
    classACount: number;
    classBCount: number;
    classCCount: number;
    repliedCount: number;
    replyRate: number;
  }[];
}

function SourceTable({ sources }: SourceTableProps) {
  // Sort by totalLeads descending
  const sortedSources = [...sources].sort((a, b) => b.totalLeads - a.totalLeads);

  return (
    <div className="card-structural p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
        <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
          Detalhamento por Origem
        </h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-kosmos-gray">Origem</TableHead>
              <TableHead className="text-kosmos-gray text-right">Leads</TableHead>
              <TableHead className="text-kosmos-gray text-right">Score ICP</TableHead>
              <TableHead className="text-kosmos-gray text-right">Classe A</TableHead>
              <TableHead className="text-kosmos-gray text-right">Classe B</TableHead>
              <TableHead className="text-kosmos-gray text-right">Classe C</TableHead>
              <TableHead className="text-kosmos-gray text-right">Responderam</TableHead>
              <TableHead className="text-kosmos-gray text-right">Taxa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSources.map((source) => (
              <TableRow key={source.source} className="border-border">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded"
                      style={{ backgroundColor: getSourceColor(source.source) }}
                    />
                    <span className="text-kosmos-white">
                      {CHANNEL_IN_LABELS[source.source as ChannelIn] || source.source}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-kosmos-white">
                  {source.totalLeads.toLocaleString('pt-BR')}
                </TableCell>
                <TableCell className="text-right text-kosmos-white">
                  {source.avgIcpScore !== null ? source.avgIcpScore.toFixed(1) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-green-400">{source.classACount.toLocaleString('pt-BR')}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-yellow-400">{source.classBCount.toLocaleString('pt-BR')}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-gray-400">{source.classCCount.toLocaleString('pt-BR')}</span>
                </TableCell>
                <TableCell className="text-right text-kosmos-white">
                  {source.repliedCount.toLocaleString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      'font-medium',
                      source.replyRate >= 25 ? 'text-green-400' :
                      source.replyRate >= 15 ? 'text-yellow-400' : 'text-gray-400'
                    )}
                  >
                    {source.replyRate.toFixed(1)}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
