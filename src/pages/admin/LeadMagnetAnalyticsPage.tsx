import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/design-system/primitives/card';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/tabs';
import {
  Target,
  ArrowLeft,
  Users,
  TrendingUp,
  Zap,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Download,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useLeadMagnetStats } from '@/modules/kosmos-score/hooks/useLeadMagnetStats';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SCORE_COLORS = {
  low: '#EF4444',
  medium: '#F59E0B',
  good: '#3B82F6',
  high: '#22C55E',
};

const PROFILE_LABELS: Record<string, string> = {
  low: 'Base sem Estrutura (0-25)',
  medium: 'Base em Construção (26-50)',
  good: 'Base em Maturação (51-75)',
  high: 'Ativo de Alta Performance (76-100)',
};

const LEAD_MAGNET_CONFIG: Record<string, { title: string; icon: typeof Target; color: string; publicUrl: string }> = {
  kosmos_score: {
    title: 'KOSMOS Score Analytics',
    icon: Target,
    color: 'bg-orange-500/10 text-orange-500',
    publicUrl: '/quiz/kosmos-score',
  },
  application: {
    title: 'Aplicação KOSMOS Analytics',
    icon: Users,
    color: 'bg-purple-500/10 text-purple-500',
    publicUrl: '/f/aplicacao-kosmos',
  },
  forms: {
    title: 'Formulários Analytics',
    icon: BarChart3,
    color: 'bg-blue-500/10 text-blue-500',
    publicUrl: '',
  },
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: { value: number; label: string };
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+{trend.value} {trend.label}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreDistributionChart({ data }: { data: { low: number; medium: number; good: number; high: number } }) {
  const chartData = [
    { name: '0-25', value: data.low, fill: SCORE_COLORS.low, label: 'Base sem Estrutura' },
    { name: '26-50', value: data.medium, fill: SCORE_COLORS.medium, label: 'Base em Construção' },
    { name: '51-75', value: data.good, fill: SCORE_COLORS.good, label: 'Base em Maturação' },
    { name: '76-100', value: data.high, fill: SCORE_COLORS.high, label: 'Alta Performance' },
  ];

  const total = data.low + data.medium + data.good + data.high;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Distribuição por Score
        </CardTitle>
        <CardDescription>Classificação dos leads por faixa de score</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8">
          <div className="w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} leads`, '']}
                  contentStyle={{ backgroundColor: 'hsl(0, 0%, 8%)', border: '1px solid hsl(0, 0%, 20%)' }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{item.value}</span>
                  <span className="text-muted-foreground ml-1">
                    ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineChart({ data }: { data: Array<{ date: string; count: number }> }) {
  const chartData = data.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Submissões ao Longo do Tempo
        </CardTitle>
        <CardDescription>Últimos 30 dias de atividade</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
              <XAxis
                dataKey="label"
                tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0, 0%, 8%)',
                  border: '1px solid hsl(0, 0%, 20%)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value} submissões`, '']}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#F97316"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentSubmissionsTable({ submissions, leadMagnetType }: {
  submissions: Array<{
    id: string;
    email: string;
    score: number;
    created_at: string;
    result_profile: string | null;
    status?: string;
  }>;
  leadMagnetType: string;
}) {
  const getScoreColor = (score: number) => {
    if (score <= 25) return 'text-red-500';
    if (score <= 50) return 'text-yellow-500';
    if (score <= 75) return 'text-blue-500';
    return 'text-green-500';
  };

  const getScoreBadge = (score: number) => {
    if (score <= 25) return { label: 'Baixo', className: 'bg-red-500/10 text-red-500 border-red-500/20' };
    if (score <= 50) return { label: 'Médio', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
    if (score <= 75) return { label: 'Bom', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
    return { label: 'Alto', className: 'bg-green-500/10 text-green-500 border-green-500/20' };
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completo', className: 'bg-green-500/10 text-green-500 border-green-500/20' };
      case 'in_progress':
        return { label: 'Em andamento', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
      case 'abandoned':
        return { label: 'Abandonado', className: 'bg-red-500/10 text-red-500 border-red-500/20' };
      default:
        return { label: 'Desconhecido', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Submissões Recentes
        </CardTitle>
        <CardDescription>Últimos leads capturados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {submissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma submissão ainda
            </p>
          ) : (
            submissions.map((sub) => {
              const scoreBadge = getScoreBadge(sub.score);
              const statusBadge = getStatusBadge(sub.status);
              const showStatus = leadMagnetType === 'application' && sub.status;
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {sub.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{sub.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(sub.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {sub.status === 'completed' || !showStatus ? (
                      <>
                        <span className={`text-lg font-bold ${getScoreColor(sub.score)}`}>
                          {sub.score}
                        </span>
                        <Badge variant="outline" className={scoreBadge.className}>
                          {scoreBadge.label}
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="outline" className={statusBadge.className}>
                        {statusBadge.label}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {submissions.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link to={leadMagnetType === 'kosmos_score' ? '/admin/kosmos-score/results' : '/admin/toolkit/forms'}>
                {leadMagnetType === 'kosmos_score' ? 'Ver Todos os Resultados' : 'Ver Formulário'}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LeadMagnetAnalyticsPage() {
  const { type } = useParams<{ type: string }>();
  const leadMagnetType = (type as 'kosmos_score' | 'application' | 'forms') || 'kosmos_score';
  const config = LEAD_MAGNET_CONFIG[leadMagnetType] || LEAD_MAGNET_CONFIG.kosmos_score;
  const Icon = config.icon;

  const { data: stats, isLoading, error } = useLeadMagnetStats(leadMagnetType);

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-6 text-center">
            <p className="text-red-500">Erro ao carregar analytics: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/lead-magnets">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}`}>
              <Icon className={`h-6 w-6 ${config.color.split(' ')[1]}`} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{config.title}</h1>
              <p className="text-muted-foreground">
                Métricas e insights do seu lead magnet
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={leadMagnetType === 'kosmos_score' ? '/admin/kosmos-score/results' : '/admin/toolkit/forms'}>
              <Download className="h-4 w-4 mr-2" />
              {leadMagnetType === 'kosmos_score' ? 'Exportar Dados' : 'Ver Formulário'}
            </Link>
          </Button>
          {config.publicUrl && (
            <Button variant="outline" asChild>
              <a href={`#${config.publicUrl}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver {leadMagnetType === 'kosmos_score' ? 'Quiz' : 'Formulário'}
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Submissões"
            value={stats.total_submissions}
            subtitle={leadMagnetType === 'kosmos_score'
              ? `${stats.beginners_count} iniciantes, ${stats.experienced_count} experientes`
              : `${stats.status_distribution.completed} completas, ${stats.status_distribution.in_progress} em andamento`}
            icon={Users}
            color="bg-orange-500/10 text-orange-500"
            trend={stats.submissions_last_7_days > 0 ? {
              value: stats.submissions_last_7_days,
              label: 'nos últimos 7 dias'
            } : undefined}
          />
          <StatCard
            title="Score Médio"
            value={stats.average_score}
            subtitle="de 100 pontos possíveis"
            icon={Zap}
            color="bg-blue-500/10 text-blue-500"
          />
          {leadMagnetType === 'kosmos_score' ? (
            <StatCard
              title="Lucro Oculto Total"
              value={formatCurrency(stats.total_lucro_oculto)}
              subtitle="potencial identificado"
              icon={DollarSign}
              color="bg-green-500/10 text-green-500"
            />
          ) : (
            <StatCard
              title="Taxa de Conclusão"
              value={`${stats.completion_rate}%`}
              subtitle={`${stats.status_distribution.completed} de ${stats.total_submissions} formulários`}
              icon={Activity}
              color="bg-green-500/10 text-green-500"
            />
          )}
          {leadMagnetType === 'kosmos_score' ? (
            <StatCard
              title="Taxa de Alta Performance"
              value={`${stats.conversion_rate}%`}
              subtitle="leads com score > 75"
              icon={TrendingUp}
              color="bg-purple-500/10 text-purple-500"
            />
          ) : (
            <StatCard
              title="Tempo Médio"
              value={stats.avg_time_spent > 60
                ? `${Math.round(stats.avg_time_spent / 60)} min`
                : `${stats.avg_time_spent} seg`}
              subtitle="para completar o formulário"
              icon={Calendar}
              color="bg-purple-500/10 text-purple-500"
            />
          )}
        </div>
      )}

      {/* Charts */}
      {stats && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ScoreDistributionChart data={stats.score_distribution} />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Métricas de Conversão
                  </CardTitle>
                  <CardDescription>Performance do lead magnet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Leads Qualificados (Score {'>'} 50)</span>
                        <span className="font-medium">
                          {stats.score_distribution.good + stats.score_distribution.high} leads
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{
                            width: `${stats.total_submissions > 0
                              ? ((stats.score_distribution.good + stats.score_distribution.high) / stats.total_submissions) * 100
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Alta Performance (Score {'>'} 75)</span>
                        <span className="font-medium">{stats.score_distribution.high} leads</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{
                            width: `${stats.total_submissions > 0
                              ? (stats.score_distribution.high / stats.total_submissions) * 100
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Iniciantes vs Experientes</span>
                        <span className="font-medium">
                          {stats.beginners_count} / {stats.experienced_count}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-yellow-500"
                          style={{
                            width: `${stats.total_submissions > 0
                              ? (stats.beginners_count / stats.total_submissions) * 100
                              : 50}%`
                          }}
                        />
                        <div
                          className="h-full bg-purple-500"
                          style={{
                            width: `${stats.total_submissions > 0
                              ? (stats.experienced_count / stats.total_submissions) * 100
                              : 50}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Iniciantes</span>
                        <span>Experientes</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-orange-500">
                          {stats.submissions_last_30_days}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Submissões (30 dias)
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-green-500">
                          {stats.total_submissions > 0
                            ? formatCurrency(stats.total_lucro_oculto / stats.total_submissions)
                            : 'R$ 0'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Lucro Oculto Médio
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineChart data={stats.daily_submissions} />
          </TabsContent>

          <TabsContent value="leads">
            <RecentSubmissionsTable submissions={stats.recent_submissions} leadMagnetType={leadMagnetType} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
