/**
 * StakeholderDashboardPage - Consultant dashboard with aggregated metrics
 *
 * Features:
 * - KPIs: Total stakeholders, Active, Avg Score, Total Investment
 * - Charts: Distribution by type, Score by client, Top contributors
 * - Alerts: Stakeholders with no recent interactions
 */

import { useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  Wallet,
  AlertTriangle,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { cn } from '@/design-system/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import { Button } from '@/design-system/primitives/button';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { Progress } from '@/design-system/primitives/progress';

import { useStakeholderDashboard } from '../hooks/useStakeholders';
import { STAKEHOLDER_TYPE_LABELS } from '../types/stakeholder.types';

// ============================================================================
// CHART COLORS
// ============================================================================

const TYPE_COLORS: Record<string, string> = {
  investor: '#10B981', // emerald
  partner: '#3B82F6',  // blue
  co_founder: '#8B5CF6', // purple
  advisor: '#F59E0B',  // amber
};

const CHART_COLORS = ['#F97316', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

// ============================================================================
// KPI CARD
// ============================================================================

interface KpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

function KpiCard({ label, value, subValue, icon }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-3 text-muted-foreground text-xs font-medium tracking-wider mb-3">
          <span className="text-kosmos-orange">{icon}</span>
          {label.toUpperCase()}
        </div>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// TYPE DISTRIBUTION CHART
// ============================================================================

interface TypeDistributionChartProps {
  data: { type: string; count: number; label: string }[];
}

function TypeDistributionChart({ data }: TypeDistributionChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-kosmos-orange" />
          Distribuicao por Tipo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                nameKey="label"
                label={({ label, percent }) =>
                  `${label} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.type}`}
                    fill={TYPE_COLORS[entry.type] || '#6B7280'}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} stakeholders`, 'Total']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {data.map((item) => (
            <Badge
              key={item.type}
              variant="outline"
              className="text-xs"
              style={{ borderColor: TYPE_COLORS[item.type] || '#6B7280' }}
            >
              <span
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: TYPE_COLORS[item.type] || '#6B7280' }}
              />
              {item.label}: {item.count}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SCORE BY CLIENT CHART
// ============================================================================

interface ScoreByClientChartProps {
  data: { clientName: string; avgScore: number; count: number }[];
}

function ScoreByClientChart({ data }: ScoreByClientChartProps) {
  const chartData = data.slice(0, 8).map(d => ({
    name: d.clientName.length > 15 ? d.clientName.substring(0, 15) + '...' : d.clientName,
    fullName: d.clientName,
    score: Math.round(d.avgScore),
    count: d.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-kosmos-orange" />
          Score Medio por Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, name: string, props) => [
                  `Score: ${value}`,
                  props.payload.fullName,
                ]}
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Bar
                dataKey="score"
                fill="#F97316"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// TOP CONTRIBUTORS RANKING
// ============================================================================

interface TopContributorsProps {
  data: { id: string; name: string; score: number; type: string; clientName?: string }[];
  onViewDetail: (id: string) => void;
}

function TopContributorsRanking({ data, onViewDetail }: TopContributorsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-kosmos-orange" />
          Top 10 Contribuidores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => onViewDetail(item.id)}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                index === 0 && 'bg-amber-500/20 text-amber-500',
                index === 1 && 'bg-gray-300/20 text-gray-300',
                index === 2 && 'bg-orange-600/20 text-orange-600',
                index > 2 && 'bg-muted text-muted-foreground'
              )}
            >
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {STAKEHOLDER_TYPE_LABELS[item.type as keyof typeof STAKEHOLDER_TYPE_LABELS] || item.type}
                {item.clientName && ` • ${item.clientName}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={item.score} className="w-16 h-2" />
              <span className="text-sm font-semibold w-8 text-right">{item.score.toFixed(0)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// INACTIVE ALERTS
// ============================================================================

interface InactiveAlertsProps {
  data: { id: string; name: string; daysSinceInteraction: number; clientName?: string }[];
  onViewDetail: (id: string) => void;
}

function InactiveAlerts({ data, onViewDetail }: InactiveAlertsProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Alertas de Inatividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum stakeholder com inatividade prolongada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/30">
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Alertas de Inatividade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 cursor-pointer hover:bg-amber-500/20 transition-colors"
            onClick={() => onViewDetail(item.id)}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              {item.clientName && (
                <p className="text-xs text-muted-foreground truncate">{item.clientName}</p>
              )}
            </div>
            <Badge variant="outline" className="text-amber-500 border-amber-500/30 shrink-0">
              {item.daysSinceInteraction} dias
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// LOADING STATE
// ============================================================================

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-muted rounded-full mb-4">
        <BarChart3 className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Nenhum dado para exibir
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Cadastre stakeholders para ver as metricas e graficos do dashboard.
      </p>
      <Button onClick={() => navigate('/admin/stakeholders')}>
        Ver Stakeholders
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export function StakeholderDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useStakeholderDashboard();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visao geral dos stakeholders de todos os clientes
          </p>
        </div>
        <LoadingState />
      </div>
    );
  }

  if (!data || data.totalStakeholders === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visao geral dos stakeholders de todos os clientes
          </p>
        </div>
        <EmptyState />
      </div>
    );
  }

  const handleViewDetail = (id: string) => {
    navigate(`/admin/stakeholders/${id}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visao geral dos stakeholders de todos os clientes
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/stakeholders')}>
          Ver todos
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total de Stakeholders"
          value={data.totalStakeholders}
          subValue={`${data.activeStakeholders} ativos`}
          icon={<Users className="h-4 w-4" />}
        />
        <KpiCard
          label="Score Medio"
          value={data.avgScore.toFixed(0)}
          subValue="de 100 pontos"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KpiCard
          label="Total Investido"
          value={formatCurrency(data.totalInvestment)}
          subValue="todos os stakeholders"
          icon={<Wallet className="h-4 w-4" />}
        />
        <KpiCard
          label="Clientes"
          value={data.byClient.length}
          subValue="organizacoes mapeadas"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TypeDistributionChart data={data.byType} />
        <ScoreByClientChart data={data.byClient} />
      </div>

      {/* Rankings & Alerts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopContributorsRanking
          data={data.topContributors}
          onViewDetail={handleViewDetail}
        />
        <InactiveAlerts
          data={data.inactiveAlerts}
          onViewDetail={handleViewDetail}
        />
      </div>
    </div>
  );
}
