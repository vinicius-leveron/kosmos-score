import { Clock, TrendingUp, TrendingDown, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  useEngagementMetrics,
  getHeatmapColor,
  DAY_LABELS,
  DAY_FULL_LABELS,
} from '../../../hooks/outbound/useEngagementMetrics';
import type { OutboundFilters, EngagementHeatmapCell } from '../../../types/outbound';

interface D5EngagementDashboardProps {
  filters: OutboundFilters;
}

export function D5EngagementDashboard({ filters }: D5EngagementDashboardProps) {
  const { heatmap, bestTimeSlot, worstTimeSlot, isLoading, error } = useEngagementMetrics(filters);

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Erro ao carregar metricas de engajamento: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Calculate totals for summary
  const totalSent = heatmap.reduce((sum, cell) => sum + cell.messagesSent, 0);
  const totalReplied = heatmap.reduce((sum, cell) => sum + cell.messagesReplied, 0);
  const overallReplyRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Enviadas"
          value={totalSent.toLocaleString('pt-BR')}
          icon={MessageSquare}
          color="text-blue-400"
        />
        <SummaryCard
          title="Taxa Media"
          value={`${overallReplyRate.toFixed(1)}%`}
          icon={TrendingUp}
          color="text-kosmos-orange"
        />
        {bestTimeSlot && (
          <TimeSlotCard
            title="Melhor Horario"
            day={bestTimeSlot.day}
            hour={bestTimeSlot.hour}
            rate={bestTimeSlot.rate}
            variant="best"
          />
        )}
        {worstTimeSlot && (
          <TimeSlotCard
            title="Pior Horario"
            day={worstTimeSlot.day}
            hour={worstTimeSlot.hour}
            rate={worstTimeSlot.rate}
            variant="worst"
          />
        )}
      </div>

      {/* Heatmap */}
      <Card className="bg-kosmos-black-light border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-kosmos-white">
            <Calendar className="h-5 w-5 text-kosmos-orange" />
            Heatmap de Engajamento
          </CardTitle>
          <p className="text-sm text-kosmos-gray">
            Taxa de resposta por dia da semana e hora do dia
          </p>
        </CardHeader>
        <CardContent>
          <EngagementHeatmap heatmap={heatmap} />
          <HeatmapLegend />
        </CardContent>
      </Card>

      {/* Insights */}
      <InsightsCard bestTimeSlot={bestTimeSlot} worstTimeSlot={worstTimeSlot} />
    </div>
  );
}

// Summary Card Component
interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color?: string;
}

function SummaryCard({ title, value, icon: Icon, color = 'text-kosmos-orange' }: SummaryCardProps) {
  return (
    <Card className="bg-kosmos-black-light border-border">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`h-5 w-5 ${color}`} />
          <span className="text-sm text-kosmos-gray">{title}</span>
        </div>
        <div className={`text-2xl font-display font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

// Time Slot Card Component
interface TimeSlotCardProps {
  title: string;
  day: number;
  hour: number;
  rate: number;
  variant: 'best' | 'worst';
}

function TimeSlotCard({ title, day, hour, rate, variant }: TimeSlotCardProps) {
  const Icon = variant === 'best' ? TrendingUp : TrendingDown;
  const color = variant === 'best' ? 'text-green-400' : 'text-red-400';
  const bgColor = variant === 'best' ? 'bg-green-400/10' : 'bg-red-400/10';

  return (
    <Card className={`bg-kosmos-black-light border-border ${bgColor}`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`h-5 w-5 ${color}`} />
          <span className="text-sm text-kosmos-gray">{title}</span>
        </div>
        <div className={`text-2xl font-display font-bold ${color}`}>
          {DAY_LABELS[day]} {hour}h
        </div>
        <div className="text-sm text-kosmos-gray mt-1">{rate.toFixed(1)}% de resposta</div>
      </CardContent>
    </Card>
  );
}

// Heatmap Grid Component
interface EngagementHeatmapProps {
  heatmap: EngagementHeatmapCell[];
}

function EngagementHeatmap({ heatmap }: EngagementHeatmapProps) {
  // Filter to show only business-relevant hours (6h to 22h)
  const HOURS_TO_SHOW = Array.from({ length: 17 }, (_, i) => i + 6); // 6h to 22h

  // Create a lookup map for quick access
  const heatmapMap = new Map<string, EngagementHeatmapCell>();
  heatmap.forEach((cell) => {
    heatmapMap.set(`${cell.dayOfWeek}-${cell.hourOfDay}`, cell);
  });

  // Find max messages for intensity scaling
  const maxSent = Math.max(...heatmap.map((cell) => cell.messagesSent), 1);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header: Days of week */}
        <div className="grid grid-cols-8 gap-1 mb-2">
          <div className="text-xs text-kosmos-gray text-right pr-2" />
          {DAY_LABELS.map((day, index) => (
            <div key={day} className="text-center text-xs font-medium text-kosmos-gray">
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap rows: Hours */}
        <div className="space-y-1">
          {HOURS_TO_SHOW.map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-1">
              {/* Hour label */}
              <div className="text-xs text-kosmos-gray text-right pr-2 flex items-center justify-end">
                {hour}h
              </div>

              {/* Day cells */}
              {DAY_LABELS.map((_, dayIndex) => {
                const cell = heatmapMap.get(`${dayIndex}-${hour}`);
                const replyRate = cell?.replyRate || 0;
                const messagesSent = cell?.messagesSent || 0;

                // Determine opacity based on volume
                const intensity = maxSent > 0 ? Math.max(0.3, messagesSent / maxSent) : 0.3;

                return (
                  <HeatmapCell
                    key={`${dayIndex}-${hour}`}
                    replyRate={replyRate}
                    messagesSent={messagesSent}
                    messagesReplied={cell?.messagesReplied || 0}
                    intensity={intensity}
                    dayLabel={DAY_FULL_LABELS[dayIndex]}
                    hour={hour}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Individual Heatmap Cell
interface HeatmapCellProps {
  replyRate: number;
  messagesSent: number;
  messagesReplied: number;
  intensity: number;
  dayLabel: string;
  hour: number;
}

function HeatmapCell({
  replyRate,
  messagesSent,
  messagesReplied,
  intensity,
  dayLabel,
  hour,
}: HeatmapCellProps) {
  const bgColor = getHeatmapColor(replyRate);

  // Show minimal data for cells with very few messages
  const hasData = messagesSent >= 5;

  return (
    <div
      className="relative h-8 rounded-sm transition-all hover:scale-105 hover:z-10 cursor-pointer group"
      style={{
        backgroundColor: hasData ? bgColor : '#1F2937',
        opacity: hasData ? intensity : 0.2,
      }}
      title={`${dayLabel} ${hour}h: ${replyRate.toFixed(1)}% (${messagesReplied}/${messagesSent})`}
      aria-label={`${dayLabel} as ${hour} horas: ${replyRate.toFixed(1)} porcento de resposta, ${messagesReplied} de ${messagesSent} mensagens`}
    >
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
        <div className="bg-kosmos-black border border-border rounded-lg p-2 shadow-lg whitespace-nowrap">
          <div className="text-xs font-medium text-kosmos-white">
            {dayLabel} {hour}h
          </div>
          <div className="text-xs text-kosmos-gray">
            {replyRate.toFixed(1)}% de resposta
          </div>
          <div className="text-xs text-kosmos-gray">
            {messagesReplied}/{messagesSent} mensagens
          </div>
        </div>
      </div>
    </div>
  );
}

// Heatmap Legend
function HeatmapLegend() {
  const legendItems = [
    { color: '#EF4444', label: '0-10%' },
    { color: '#F97316', label: '10-20%' },
    { color: '#F59E0B', label: '20-30%' },
    { color: '#84CC16', label: '30-40%' },
    { color: '#22C55E', label: '40%+' },
  ];

  return (
    <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-border">
      <span className="text-xs text-kosmos-gray">Taxa de Resposta:</span>
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-1">
          <div
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span className="text-xs text-kosmos-gray">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Insights Card
interface InsightsCardProps {
  bestTimeSlot: { day: number; hour: number; rate: number } | null;
  worstTimeSlot: { day: number; hour: number; rate: number } | null;
}

function InsightsCard({ bestTimeSlot, worstTimeSlot }: InsightsCardProps) {
  if (!bestTimeSlot) return null;

  return (
    <Card className="bg-kosmos-black-light border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-kosmos-white">
          <Clock className="h-5 w-5 text-kosmos-orange" />
          Insights de Timing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4">
            <h4 className="font-display font-semibold text-green-400 mb-2">
              Horarios Ideais
            </h4>
            <p className="text-sm text-kosmos-gray">
              Suas mensagens tem melhor desempenho em{' '}
              <strong className="text-green-300">
                {DAY_FULL_LABELS[bestTimeSlot.day]} as {bestTimeSlot.hour}h
              </strong>{' '}
              com {bestTimeSlot.rate.toFixed(1)}% de taxa de resposta.
            </p>
            <p className="text-sm text-kosmos-gray mt-2">
              Considere concentrar suas cadencias outbound durante a manha de dias uteis
              para maximizar engajamento.
            </p>
          </div>

          {worstTimeSlot && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
              <h4 className="font-display font-semibold text-red-400 mb-2">
                Horarios a Evitar
              </h4>
              <p className="text-sm text-kosmos-gray">
                Evite enviar mensagens em{' '}
                <strong className="text-red-300">
                  {DAY_FULL_LABELS[worstTimeSlot.day]} as {worstTimeSlot.hour}h
                </strong>{' '}
                - taxa de apenas {worstTimeSlot.rate.toFixed(1)}%.
              </p>
              <p className="text-sm text-kosmos-gray mt-2">
                Finais de semana e horarios noturnos geralmente apresentam menor engajamento
                B2B.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
