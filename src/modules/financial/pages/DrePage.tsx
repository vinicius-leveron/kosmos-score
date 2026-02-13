import { useState, useMemo } from 'react';
import { FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/primitives/table';
import { Button } from '@/design-system/primitives/button';
import { useOrganization } from '@/core/auth';
import { useDre } from '../hooks';
import { formatCurrency } from '../lib/formatters';
import type { DreGroupTotal, DreReport } from '../types';

function getDefaultPeriod() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { start: fmt(start), end: fmt(end) };
}

/** A single expandable DRE group row with its category-level items. */
function DreGroupRow({
  sign,
  group,
  expanded,
  onToggle,
}: {
  sign: string;
  group: DreGroupTotal;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <TableRow className="hover:bg-muted/40 cursor-pointer" onClick={onToggle}>
        <TableCell className="font-medium">
          <span className="inline-flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0"
              aria-label={expanded ? `Recolher ${group.label}` : `Expandir ${group.label}`}
              tabIndex={-1}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            ({sign}) {group.label}
          </span>
        </TableCell>
        <TableCell className="text-right font-medium tabular-nums">
          {formatCurrency(group.total)}
        </TableCell>
      </TableRow>
      {expanded &&
        group.items.map((item) => (
          <TableRow key={item.category_id} className="text-muted-foreground">
            <TableCell className="pl-12 text-sm">{item.category_name}</TableCell>
            <TableCell className="text-right text-sm tabular-nums">
              {formatCurrency(item.total_amount)}
            </TableCell>
          </TableRow>
        ))}
    </>
  );
}

/** A calculated subtotal row (bold, highlighted). */
function SubtotalRow({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: number;
  variant?: 'default' | 'final';
}) {
  const isFinal = variant === 'final';
  const colorClass =
    isFinal && value >= 0
      ? 'text-emerald-500'
      : isFinal && value < 0
        ? 'text-red-500'
        : '';

  return (
    <TableRow className="bg-muted/50 font-bold">
      <TableCell>(=) {label}</TableCell>
      <TableCell className={cn('text-right tabular-nums', colorClass)}>
        {formatCurrency(value)}
      </TableCell>
    </TableRow>
  );
}

function DreSkeleton() {
  return (
    <div className="space-y-3 py-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

/** Maps a DreReport into the ordered list of rows to render. */
function useDreRows(report: DreReport | undefined) {
  return useMemo(() => {
    if (!report) return [];
    return [
      { type: 'group' as const, sign: '+', group: report.receita_bruta },
      { type: 'group' as const, sign: '-', group: report.deducoes },
      { type: 'subtotal' as const, label: 'RECEITA LIQUIDA', value: report.receita_liquida },
      { type: 'group' as const, sign: '-', group: report.custos },
      { type: 'subtotal' as const, label: 'LUCRO BRUTO', value: report.lucro_bruto },
      { type: 'group' as const, sign: '-', group: report.despesas_administrativas },
      { type: 'group' as const, sign: '-', group: report.despesas_comerciais },
      { type: 'group' as const, sign: '-', group: report.despesas_pessoal },
      { type: 'group' as const, sign: '-', group: report.despesas_outras },
      { type: 'subtotal' as const, label: 'EBITDA', value: report.ebitda },
      { type: 'group' as const, sign: '-', group: report.depreciacao_amortizacao },
      { type: 'subtotal' as const, label: 'EBIT (Lucro Operacional)', value: report.ebit },
      { type: 'group' as const, sign: '-/+', group: report.resultado_financeiro },
      { type: 'subtotal' as const, label: 'LUCRO ANTES DO IR', value: report.lucro_antes_ir },
      { type: 'group' as const, sign: '-', group: report.impostos },
      { type: 'subtotal' as const, label: 'LUCRO LIQUIDO', value: report.lucro_liquido, variant: 'final' as const },
    ];
  }, [report]);
}

export function DrePage() {
  const { organizationId } = useOrganization();
  const defaults = getDefaultPeriod();

  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [regime, setRegime] = useState<'competencia' | 'caixa'>('competencia');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const { data: report, isLoading } = useDre({
    organizationId: organizationId || undefined,
    startDate,
    endDate,
    useCompetence: regime === 'competencia',
  });

  const rows = useDreRows(report);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                DRE - Demonstrativo de Resultado
              </h1>
              <p className="text-sm text-muted-foreground">
                Analise de resultado do exercicio
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b">
        <div className="container py-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label htmlFor="dre-start">Inicio</Label>
              <Input
                id="dre-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dre-end">Fim</Label>
              <Input
                id="dre-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dre-regime">Regime</Label>
              <Select
                value={regime}
                onValueChange={(v) => setRegime(v as 'competencia' | 'caixa')}
              >
                <SelectTrigger id="dre-regime" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="competencia">Competencia</SelectItem>
                  <SelectItem value="caixa">Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* DRE Table */}
      <div className="container py-6 pb-8">
        {isLoading ? (
          <DreSkeleton />
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descricao</TableHead>
                  <TableHead className="text-right w-[180px]">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, idx) =>
                  row.type === 'group' ? (
                    <DreGroupRow
                      key={row.group.group}
                      sign={row.sign}
                      group={row.group}
                      expanded={expandedGroups.has(row.group.group)}
                      onToggle={() => toggleGroup(row.group.group)}
                    />
                  ) : (
                    <SubtotalRow
                      key={`subtotal-${idx}`}
                      label={row.label}
                      value={row.value}
                      variant={row.variant ?? 'default'}
                    />
                  ),
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
