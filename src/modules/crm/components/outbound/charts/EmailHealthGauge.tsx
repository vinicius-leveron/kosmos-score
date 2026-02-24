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
import { Mail, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { OUTBOUND_COLORS } from '../../../types/outbound';

interface EmailDailyData {
  activity_date: string;
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
}

interface EmailHealthData {
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  bounce_rate: number | null;
  open_rate: number | null;
  click_rate: number | null;
  health_status: 'healthy' | 'warning' | 'critical';
}

interface EmailHealthGaugeProps {
  health: EmailHealthData | null;
  daily: EmailDailyData[];
  className?: string;
}

export function EmailHealthGauge({ health, daily, className }: EmailHealthGaugeProps) {
  const status = health?.health_status || 'healthy';
  const bounceRate = health?.bounce_rate || 0;
  const openRate = health?.open_rate || 0;
  const clickRate = health?.click_rate || 0;

  // Format daily data for chart
  const chartData = daily.map((item) => ({
    date: new Date(item.activity_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
    sent: item.sent,
    opened: item.opened,
    bounced: item.bounced,
    bounceRate: item.sent > 0 ? ((item.bounced / item.sent) * 100).toFixed(1) : '0',
  }));

  const StatusIcon = status === 'healthy' ? CheckCircle : status === 'warning' ? AlertTriangle : XCircle;
  const statusColor = OUTBOUND_COLORS[status];
  const statusLabel = status === 'healthy' ? 'Saudável' : status === 'warning' ? 'Atenção' : 'Crítico';

  return (
    <div className={cn('card-structural p-6', className)}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
        <Mail className="h-5 w-5 text-kosmos-orange" />
        <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
          Saúde de Email
        </h3>
      </div>

      {/* Health Status Indicator */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div
          className="flex items-center gap-3 px-6 py-3 rounded-lg border"
          style={{ borderColor: statusColor, backgroundColor: `${statusColor}10` }}
        >
          <StatusIcon className="h-8 w-8" style={{ color: statusColor }} />
          <div>
            <div className="font-display text-lg font-bold" style={{ color: statusColor }}>
              {statusLabel}
            </div>
            <div className="text-sm text-kosmos-gray">
              Bounce Rate: {bounceRate?.toFixed(1) || 0}%
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-kosmos-black-light rounded-lg p-3 text-center">
          <div className="text-2xl font-display font-bold text-kosmos-white">
            {health?.total_sent?.toLocaleString('pt-BR') || 0}
          </div>
          <div className="text-xs text-kosmos-gray">Enviados</div>
        </div>
        <div className="bg-kosmos-black-light rounded-lg p-3 text-center">
          <div className="text-2xl font-display font-bold text-blue-400">
            {openRate?.toFixed(1) || 0}%
          </div>
          <div className="text-xs text-kosmos-gray">Open Rate</div>
        </div>
        <div className="bg-kosmos-black-light rounded-lg p-3 text-center">
          <div className="text-2xl font-display font-bold text-green-400">
            {clickRate?.toFixed(1) || 0}%
          </div>
          <div className="text-xs text-kosmos-gray">Click Rate</div>
        </div>
        <div className="bg-kosmos-black-light rounded-lg p-3 text-center">
          <div className="text-2xl font-display font-bold" style={{ color: statusColor }}>
            {bounceRate?.toFixed(1) || 0}%
          </div>
          <div className="text-xs text-kosmos-gray">Bounce Rate</div>
        </div>
      </div>

      {/* Timeline Chart */}
      {chartData.length > 0 && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="sent"
                stroke={OUTBOUND_COLORS.email}
                strokeWidth={2}
                dot={false}
                name="Enviados"
              />
              <Line
                type="monotone"
                dataKey="opened"
                stroke="#22C55E"
                strokeWidth={2}
                dot={false}
                name="Abertos"
              />
              <Line
                type="monotone"
                dataKey="bounced"
                stroke="#DC2626"
                strokeWidth={2}
                dot={false}
                name="Bounced"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.length === 0 && (
        <div className="h-48 flex items-center justify-center text-kosmos-gray">
          Nenhum dado de email disponível
        </div>
      )}

      {/* Threshold Reference */}
      <div className="flex justify-center gap-6 mt-4 text-xs text-kosmos-gray">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
          Bounce &lt; 2% = Saudável
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1" />
          2-5% = Atenção
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />
          &gt; 5% = Crítico
        </span>
      </div>
    </div>
  );
}
