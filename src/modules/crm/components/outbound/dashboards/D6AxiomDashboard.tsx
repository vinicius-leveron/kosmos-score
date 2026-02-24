import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  UserPlus,
  Heart,
  MessageCircle,
  Percent,
  Flame,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/design-system/primitives/card';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/design-system/primitives/table';
import { useAxiomMetrics, AXIOM_COLORS } from '../../../hooks/outbound/useAxiomMetrics';
import type { OutboundFilters, AxiomDayMetric } from '../../../types/outbound';

interface D6AxiomDashboardProps {
  filters: OutboundFilters;
}

export function D6AxiomDashboard({ filters }: D6AxiomDashboardProps) {
  const { daily, totals, warmupProgress, isLoading, error } = useAxiomMetrics(filters);

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Erro ao carregar metricas do Axiom: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Prepare chart data
  const chartData = daily.map((item) => ({
    date: new Date(item.activity_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
    follows: item.follows,
    likes: item.likes,
    dms: item.dmsSent,
    stories: item.storiesViewed,
    comments: item.comments,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-4">
        <KPICard
          title="Total Follows"
          value={totals?.totalFollows}
          icon={UserPlus}
          color="text-purple-400"
        />
        <KPICard
          title="Total Likes"
          value={totals?.totalLikes}
          icon={Heart}
          color="text-pink-400"
        />
        <KPICard
          title="Total DMs"
          value={totals?.totalDMs}
          icon={MessageCircle}
          color="text-[#E1306C]"
        />
        <KPICard
          title="DM Reply Rate"
          value={totals?.dmReplyRate ? `${totals.dmReplyRate.toFixed(1)}%` : '0%'}
          icon={Percent}
          color="text-green-400"
          subtitle="taxa de resposta"
        />
        <KPICard
          title="Accounts in Warmup"
          value={warmupProgress?.accountsInWarmup}
          icon={Flame}
          color="text-amber-400"
          subtitle="contas aquecendo"
        />
        <KPICard
          title="Avg Warmup Days"
          value={warmupProgress?.avgWarmupDays ? `${warmupProgress.avgWarmupDays.toFixed(1)}d` : '-'}
          icon={Clock}
          color="text-blue-400"
          subtitle="dias de warmup"
        />
      </div>

      {/* Area Chart - Daily Operations */}
      <Card className="bg-kosmos-black-light border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
            <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
              Operacoes Diarias (Ultimos 30 dias)
            </h3>
          </div>

          {chartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientFollows" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={AXIOM_COLORS.follows} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={AXIOM_COLORS.follows} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradientLikes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={AXIOM_COLORS.likes} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={AXIOM_COLORS.likes} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradientDMs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={AXIOM_COLORS.dms} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={AXIOM_COLORS.dms} stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="follows"
                    stroke={AXIOM_COLORS.follows}
                    fill="url(#gradientFollows)"
                    strokeWidth={2}
                    name="Follows"
                    stackId="1"
                  />
                  <Area
                    type="monotone"
                    dataKey="likes"
                    stroke={AXIOM_COLORS.likes}
                    fill="url(#gradientLikes)"
                    strokeWidth={2}
                    name="Likes"
                    stackId="2"
                  />
                  <Area
                    type="monotone"
                    dataKey="dms"
                    stroke={AXIOM_COLORS.dms}
                    fill="url(#gradientDMs)"
                    strokeWidth={2}
                    name="DMs"
                    stackId="3"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-kosmos-gray">
              Nenhum dado de operacoes disponivel
            </div>
          )}

          {/* Legend for additional metrics */}
          <div className="flex justify-center gap-6 mt-4 text-xs text-kosmos-gray">
            <span>
              <span
                className="inline-block w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: AXIOM_COLORS.stories }}
              />
              Stories
            </span>
            <span>
              <span
                className="inline-block w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: AXIOM_COLORS.comments }}
              />
              Comments
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Daily Breakdown Table */}
      <Card className="bg-kosmos-black-light border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
            <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
              Detalhamento Diario
            </h3>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-kosmos-gray">Data</TableHead>
                  <TableHead className="text-kosmos-gray text-right">Follows</TableHead>
                  <TableHead className="text-kosmos-gray text-right">Unfollows</TableHead>
                  <TableHead className="text-kosmos-gray text-right">Likes</TableHead>
                  <TableHead className="text-kosmos-gray text-right">DMs Enviadas</TableHead>
                  <TableHead className="text-kosmos-gray text-right">DMs Respondidas</TableHead>
                  <TableHead className="text-kosmos-gray text-right">Stories</TableHead>
                  <TableHead className="text-kosmos-gray text-right">Comments</TableHead>
                  <TableHead className="text-kosmos-gray text-right">Warmup</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daily.slice(-10).reverse().map((row) => (
                  <DailyRow key={row.activity_date} data={row} />
                ))}
              </TableBody>
            </Table>
          </div>

          {daily.length > 10 && (
            <div className="text-center text-xs text-kosmos-gray mt-4">
              Mostrando os ultimos 10 dias de {daily.length} registros
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warmup Status */}
      {warmupProgress && warmupProgress.accountsInWarmup > 0 && (
        <WarmupStatusCard warmupProgress={warmupProgress} />
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
}

function KPICard({ title, value, icon: Icon, color = 'text-kosmos-orange', subtitle }: KPICardProps) {
  return (
    <Card className="bg-kosmos-black-light border-border">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
          <span className="text-sm text-kosmos-gray">{title}</span>
        </div>
        <div className={`text-2xl font-display font-bold ${color}`}>
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value || '0'}
        </div>
        {subtitle && <div className="text-xs text-kosmos-gray mt-1">{subtitle}</div>}
      </CardContent>
    </Card>
  );
}

// Daily Row Component
interface DailyRowProps {
  data: AxiomDayMetric;
}

function DailyRow({ data }: DailyRowProps) {
  const formattedDate = new Date(data.activity_date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    weekday: 'short',
  });

  const replyRate = data.dmsSent > 0 ? ((data.dmsReplied / data.dmsSent) * 100).toFixed(1) : '0';

  return (
    <TableRow className="border-border">
      <TableCell className="font-medium text-kosmos-white">{formattedDate}</TableCell>
      <TableCell className="text-right text-purple-400">{data.follows}</TableCell>
      <TableCell className="text-right text-kosmos-gray">{data.unfollows}</TableCell>
      <TableCell className="text-right text-pink-400">{data.likes}</TableCell>
      <TableCell className="text-right text-[#E1306C]">{data.dmsSent}</TableCell>
      <TableCell className="text-right">
        <span className="text-green-400">{data.dmsReplied}</span>
        <span className="text-kosmos-gray text-xs ml-1">({replyRate}%)</span>
      </TableCell>
      <TableCell className="text-right text-amber-400">{data.storiesViewed}</TableCell>
      <TableCell className="text-right text-blue-400">{data.comments}</TableCell>
      <TableCell className="text-right">
        {data.accountsWarming > 0 ? (
          <span className="inline-flex items-center gap-1 text-amber-400">
            <Flame className="h-3 w-3" aria-hidden="true" />
            {data.accountsWarming}
          </span>
        ) : (
          <span className="text-green-400">-</span>
        )}
      </TableCell>
    </TableRow>
  );
}

// Warmup Status Card
interface WarmupStatusCardProps {
  warmupProgress: {
    accountsInWarmup: number;
    avgWarmupDays: number;
  };
}

function WarmupStatusCard({ warmupProgress }: WarmupStatusCardProps) {
  const daysRemaining = Math.max(0, 14 - warmupProgress.avgWarmupDays);
  const progress = Math.min(100, (warmupProgress.avgWarmupDays / 14) * 100);

  return (
    <Card className="bg-amber-900/20 border-amber-800/30">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="h-5 w-5 text-amber-400" aria-hidden="true" />
          <h4 className="font-display font-semibold text-amber-400">
            Warmup em Progresso
          </h4>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-2xl font-display font-bold text-amber-400">
              {warmupProgress.accountsInWarmup}
            </div>
            <div className="text-xs text-kosmos-gray">contas aquecendo</div>
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-kosmos-white">
              {warmupProgress.avgWarmupDays.toFixed(1)}d
            </div>
            <div className="text-xs text-kosmos-gray">dias em media</div>
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-kosmos-white">
              ~{daysRemaining.toFixed(0)}d
            </div>
            <div className="text-xs text-kosmos-gray">restantes</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-kosmos-black-light rounded-full h-2">
          <div
            className="bg-amber-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-kosmos-gray mt-2">
          Warmup recomendado: 14 dias antes de operar em capacidade total
        </div>
      </CardContent>
    </Card>
  );
}
