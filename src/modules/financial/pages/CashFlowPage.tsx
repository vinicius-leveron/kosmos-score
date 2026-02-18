import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useOrganization } from '@/core/auth';
import { useCashFlow } from '../hooks';
import { formatCurrency, formatDate } from '../lib/formatters';
import type { CashFlowGranularity } from '../types';

const CHART_COLORS = {
  receivables: '#10B981',
  payables: '#EF4444',
  cumulative: '#3B82F6',
} as const;

const GRANULARITY_OPTIONS: { value: CashFlowGranularity; label: string }[] = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
];

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDefaultDates() {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 30);
  return {
    startDate: toISODate(today),
    endDate: toISODate(endDate),
  };
}

/** Loading skeleton for the cash flow page */
function CashFlowSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-48" />
      <div className="flex gap-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-[350px] w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function CashFlowPage() {
  const { organization } = useOrganization();
  const defaults = useMemo(() => getDefaultDates(), []);

  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [granularity, setGranularity] = useState<CashFlowGranularity>('daily');

  const { data: cashFlowData, isLoading } = useCashFlow({
    organizationId: organization?.id,
    startDate,
    endDate,
    granularity,
  });

  const chartData = useMemo(() => {
    if (!cashFlowData) return [];
    return cashFlowData.map((item) => ({
      ...item,
      label: formatDate(item.period_date),
    }));
  }, [cashFlowData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <CashFlowSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
              <p className="text-muted-foreground mt-1">
                Projecao de entradas e saidas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label htmlFor="start-date" className="text-sm font-medium">
              Data Inicio
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="end-date" className="text-sm font-medium">
              Data Fim
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Granularidade</label>
            <Select
              value={granularity}
              onValueChange={(v) => setGranularity(v as CashFlowGranularity)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRANULARITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Projecao de Fluxo de Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="receivables"
                  name="Entradas"
                  stroke={CHART_COLORS.receivables}
                  fill={CHART_COLORS.receivables}
                  fillOpacity={0.15}
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="payables"
                  name="Saidas"
                  stroke={CHART_COLORS.payables}
                  fill={CHART_COLORS.payables}
                  fillOpacity={0.15}
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="cumulative_balance"
                  name="Saldo Acumulado"
                  stroke={CHART_COLORS.cumulative}
                  fill={CHART_COLORS.cumulative}
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento por Periodo</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periodo</TableHead>
                  <TableHead className="text-right">Entradas</TableHead>
                  <TableHead className="text-right">Saidas</TableHead>
                  <TableHead className="text-right">Saldo Liquido</TableHead>
                  <TableHead className="text-right">Saldo Acumulado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashFlowData?.map((row) => (
                  <TableRow key={row.period_date}>
                    <TableCell className="font-medium">
                      {formatDate(row.period_date)}
                    </TableCell>
                    <TableCell className="text-right text-green-500">
                      {formatCurrency(row.receivables)}
                    </TableCell>
                    <TableCell className="text-right text-red-500">
                      {formatCurrency(row.payables)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        row.net >= 0 ? "text-green-500" : "text-red-500"
                      )}
                    >
                      {formatCurrency(row.net)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold",
                        row.cumulative_balance >= 0 ? "text-blue-500" : "text-red-500"
                      )}
                    >
                      {formatCurrency(row.cumulative_balance)}
                    </TableCell>
                  </TableRow>
                ))}
                {(!cashFlowData || cashFlowData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum dado encontrado para o periodo selecionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
