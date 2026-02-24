import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Mail, MessageCircle, Send, Trophy, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/design-system/primitives/card';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { cn } from '@/design-system/lib/utils';
import { useChannelMetrics, aggregateByDate } from '../../../hooks/outbound/useChannelMetrics';
import { OUTBOUND_COLORS, CHANNEL_LABELS, type Channel, type OutboundFilters } from '../../../types/outbound';

interface D3ChannelDashboardProps {
  filters: OutboundFilters;
}

export function D3ChannelDashboard({ filters }: D3ChannelDashboardProps) {
  const { daily, totals, bestChannel, isLoading, error } = useChannelMetrics(filters);

  // Aggregate data for line chart
  const chartData = aggregateByDate(daily).map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
  }));

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Erro ao carregar metricas de canal: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Best Channel Highlight */}
      <BestChannelCard bestChannel={bestChannel} totals={totals} isLoading={isLoading} />

      {/* Channel KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <ChannelKPICard
          channel="email"
          icon={Mail}
          totals={totals.email}
          isBest={bestChannel === 'email'}
          isLoading={isLoading}
        />
        <ChannelKPICard
          channel="instagram_dm"
          icon={MessageCircle}
          totals={totals.instagram_dm}
          isBest={bestChannel === 'instagram_dm'}
          isLoading={isLoading}
        />
        <ChannelKPICard
          channel="whatsapp"
          icon={Send}
          totals={totals.whatsapp}
          isBest={bestChannel === 'whatsapp'}
          isLoading={isLoading}
        />
      </div>

      {/* Line Chart */}
      {isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <ChannelLineChart data={chartData} />
      )}
    </div>
  );
}

// Best Channel Highlight Card
interface BestChannelCardProps {
  bestChannel: Channel;
  totals: Record<Channel, { sent: number; delivered: number; engaged: number; rate: number }>;
  isLoading: boolean;
}

function BestChannelCard({ bestChannel, totals, isLoading }: BestChannelCardProps) {
  const channelColor = OUTBOUND_COLORS[bestChannel];
  const channelLabel = CHANNEL_LABELS[bestChannel];
  const rate = totals[bestChannel]?.rate || 0;

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  return (
    <Card
      className="border-2"
      style={{ borderColor: channelColor, backgroundColor: `${channelColor}10` }}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: `${channelColor}20` }}
            >
              <Trophy className="h-6 w-6" style={{ color: channelColor }} />
            </div>
            <div>
              <div className="text-sm text-kosmos-gray">Melhor Performance</div>
              <div className="text-xl font-display font-bold" style={{ color: channelColor }}>
                {channelLabel}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2" style={{ color: channelColor }}>
              <TrendingUp className="h-5 w-5" />
              <span className="text-2xl font-display font-bold">{rate.toFixed(1)}%</span>
            </div>
            <div className="text-xs text-kosmos-gray">Taxa de Engajamento</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Channel KPI Card
interface ChannelKPICardProps {
  channel: Channel;
  icon: React.ElementType;
  totals: { sent: number; delivered: number; engaged: number; rate: number };
  isBest: boolean;
  isLoading: boolean;
}

function ChannelKPICard({ channel, icon: Icon, totals, isBest, isLoading }: ChannelKPICardProps) {
  const color = OUTBOUND_COLORS[channel];
  const label = CHANNEL_LABELS[channel];

  return (
    <Card
      className={cn(
        'bg-kosmos-black-light border-border transition-all',
        isBest && 'ring-2'
      )}
      style={isBest ? { ringColor: color } : undefined}
    >
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <span className="font-display font-semibold text-kosmos-white">{label}</span>
          {isBest && (
            <span
              className="ml-auto text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: `${color}20`, color }}
            >
              Melhor
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-display font-bold text-kosmos-white">
                  {totals.sent.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-kosmos-gray">Enviados</div>
              </div>
              <div>
                <div className="text-lg font-display font-bold text-blue-400">
                  {totals.delivered.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-kosmos-gray">Entregues</div>
              </div>
              <div>
                <div className="text-lg font-display font-bold text-green-400">
                  {totals.engaged.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-kosmos-gray">Engajados</div>
              </div>
            </div>

            {/* Progress bar for engagement rate */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-kosmos-gray">Taxa de Engajamento</span>
                <span style={{ color }}>{totals.rate.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-kosmos-black rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(totals.rate, 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Channel Line Chart
interface ChannelLineChartProps {
  data: Array<{
    date: string;
    email: number;
    instagram_dm: number;
    whatsapp: number;
  }>;
}

function ChannelLineChart({ data }: ChannelLineChartProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-kosmos-black-light border-border">
        <CardContent className="pt-6">
          <div className="h-64 flex items-center justify-center text-kosmos-gray">
            Nenhum dado de canal disponivel
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-kosmos-black-light border-border">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
          <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
            Envios por Canal (Ultimos 14 dias)
          </h3>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(0, 0%, 20%)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 10 }}
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
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    email: 'Email',
                    instagram_dm: 'DM Instagram',
                    whatsapp: 'WhatsApp',
                  };
                  return [value.toLocaleString('pt-BR'), labels[name] || name];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    email: 'Email',
                    instagram_dm: 'DM Instagram',
                    whatsapp: 'WhatsApp',
                  };
                  return labels[value] || value;
                }}
              />
              <Line
                type="monotone"
                dataKey="email"
                stroke={OUTBOUND_COLORS.email}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="instagram_dm"
                stroke={OUTBOUND_COLORS.instagram_dm}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="whatsapp"
                stroke={OUTBOUND_COLORS.whatsapp}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Color Legend */}
        <div className="flex justify-center gap-6 mt-4 text-xs text-kosmos-gray">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: OUTBOUND_COLORS.email }}
            />
            Email
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: OUTBOUND_COLORS.instagram_dm }}
            />
            DM Instagram
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: OUTBOUND_COLORS.whatsapp }}
            />
            WhatsApp
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
