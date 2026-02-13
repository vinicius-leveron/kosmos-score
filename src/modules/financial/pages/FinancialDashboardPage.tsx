import { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/design-system/primitives/card';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { cn } from '@/design-system/lib/utils';
import { useOrganization } from '@/core/auth';
import { useFinancialDashboard } from '../hooks';
import { formatCurrency } from '../lib/formatters';
import type { LucideIcon } from 'lucide-react';

/** Reusable KPI metric card for the financial dashboard */
function MetricCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={cn("p-3 rounded-full", color)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Skeleton placeholder for loading state */
function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-32" />
          </div>
          <Skeleton className="h-11 w-11 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

/** Alert card for overdue receivables/payables */
function AlertCard({
  title,
  count,
  total,
  hasOverdue,
}: {
  title: string;
  count: number;
  total: string;
  hasOverdue: boolean;
}) {
  return (
    <Card className={cn(hasOverdue && "border-red-500/50")}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-full",
            hasOverdue ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"
          )}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={cn("text-xl font-bold", hasOverdue && "text-red-500")}>
              {count} {count === 1 ? 'titulo' : 'titulos'} - {total}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Pending summary card for receivables/payables */
function PendingCard({ title, total }: { title: string; total: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-muted text-muted-foreground">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{total}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinancialDashboardPage() {
  const { organization } = useOrganization();
  const { data, isLoading } = useFinancialDashboard({
    organizationId: organization?.id,
  });

  const margin = useMemo(() => {
    if (!data || data.revenue_month === 0) return 0;
    return (data.profit_month / data.revenue_month) * 100;
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container py-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="container py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
              <p className="text-muted-foreground mt-1">
                Visao geral das suas financas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Receita do Mes"
            value={formatCurrency(data?.revenue_month ?? 0)}
            icon={TrendingUp}
            color="bg-green-500/10 text-green-500"
          />
          <MetricCard
            title="Despesas do Mes"
            value={formatCurrency(data?.expenses_month ?? 0)}
            icon={TrendingDown}
            color="bg-red-500/10 text-red-500"
          />
          <MetricCard
            title="Lucro do Mes"
            value={formatCurrency(data?.profit_month ?? 0)}
            icon={DollarSign}
            color="bg-blue-500/10 text-blue-500"
          />
          <MetricCard
            title="Margem (%)"
            value={`${margin.toFixed(1)}%`}
            icon={Percent}
            color="bg-purple-500/10 text-purple-500"
          />
        </div>

        {/* Alert Cards - Overdue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AlertCard
            title="A Receber Vencidos"
            count={data?.receivables_overdue_count ?? 0}
            total={formatCurrency(data?.receivables_overdue ?? 0)}
            hasOverdue={(data?.receivables_overdue_count ?? 0) > 0}
          />
          <AlertCard
            title="A Pagar Vencidos"
            count={data?.payables_overdue_count ?? 0}
            total={formatCurrency(data?.payables_overdue ?? 0)}
            hasOverdue={(data?.payables_overdue_count ?? 0) > 0}
          />
        </div>

        {/* Pending Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PendingCard
            title="A Receber Pendente"
            total={formatCurrency(data?.receivables_pending ?? 0)}
          />
          <PendingCard
            title="A Pagar Pendente"
            total={formatCurrency(data?.payables_pending ?? 0)}
          />
        </div>
      </div>
    </div>
  );
}
