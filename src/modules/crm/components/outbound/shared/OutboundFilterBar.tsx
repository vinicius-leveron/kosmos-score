import { useState, useCallback } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/design-system/primitives/popover';
import { Calendar } from '@/design-system/primitives/calendar';
import { Checkbox } from '@/design-system/primitives/checkbox';
import { Label } from '@/design-system/primitives/label';
import { Calendar as CalendarIcon, Filter, RotateCcw, X } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { format, subDays, startOfMonth, startOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  OutboundFilters,
  Tenant,
  Classificacao,
  CadenceStatus,
  CADENCE_STATUS_LABELS,
  CLASSIFICACAO_LABELS,
} from '../../../types/outbound';

interface OutboundFilterBarProps {
  filters: OutboundFilters;
  onFiltersChange: (filters: OutboundFilters) => void;
  showCadenceStatus?: boolean;
  showClassificacao?: boolean;
  showSources?: boolean;
  availableSources?: string[];
  className?: string;
}

type DatePreset = '7d' | '30d' | '90d' | 'month' | 'year' | 'custom';

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: 'month', label: 'Este mês' },
  { value: 'year', label: 'Este ano' },
  { value: 'custom', label: 'Personalizado' },
];

export function OutboundFilterBar({
  filters,
  onFiltersChange,
  showCadenceStatus = false,
  showClassificacao = true,
  showSources = false,
  availableSources = [],
  className,
}: OutboundFilterBarProps) {
  const [datePreset, setDatePreset] = useState<DatePreset>('30d');
  const [showCalendar, setShowCalendar] = useState(false);

  const handleTenantChange = useCallback(
    (tenant: string) => {
      onFiltersChange({ ...filters, tenant: tenant as Tenant });
    },
    [filters, onFiltersChange]
  );

  const handleDatePresetChange = useCallback(
    (preset: DatePreset) => {
      setDatePreset(preset);
      const now = new Date();
      let start: Date;

      switch (preset) {
        case '7d':
          start = subDays(now, 7);
          break;
        case '30d':
          start = subDays(now, 30);
          break;
        case '90d':
          start = subDays(now, 90);
          break;
        case 'month':
          start = startOfMonth(now);
          break;
        case 'year':
          start = startOfYear(now);
          break;
        case 'custom':
          setShowCalendar(true);
          return;
        default:
          start = subDays(now, 30);
      }

      onFiltersChange({
        ...filters,
        dateRange: { start, end: now },
      });
    },
    [filters, onFiltersChange]
  );

  const handleClassificacaoToggle = useCallback(
    (classificacao: Classificacao) => {
      const current = filters.classificacao;
      const updated = current.includes(classificacao)
        ? current.filter((c) => c !== classificacao)
        : [...current, classificacao];
      onFiltersChange({ ...filters, classificacao: updated });
    },
    [filters, onFiltersChange]
  );

  const handleCadenceStatusToggle = useCallback(
    (status: CadenceStatus) => {
      const current = filters.cadenceStatus;
      const updated = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status];
      onFiltersChange({ ...filters, cadenceStatus: updated });
    },
    [filters, onFiltersChange]
  );

  const handleSourceToggle = useCallback(
    (source: string) => {
      const current = filters.sources;
      const updated = current.includes(source)
        ? current.filter((s) => s !== source)
        : [...current, source];
      onFiltersChange({ ...filters, sources: updated });
    },
    [filters, onFiltersChange]
  );

  const handleReset = useCallback(() => {
    onFiltersChange({
      tenant: 'all',
      dateRange: { start: subDays(new Date(), 30), end: new Date() },
      classificacao: [],
      sources: [],
      cadenceStatus: [],
    });
    setDatePreset('30d');
  }, [onFiltersChange]);

  const activeFiltersCount =
    (filters.tenant !== 'all' ? 1 : 0) +
    filters.classificacao.length +
    filters.cadenceStatus.length +
    filters.sources.length;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 p-4 bg-kosmos-black-light rounded-lg border border-border',
        className
      )}
    >
      {/* Tenant Selector */}
      <div className="flex items-center gap-2">
        <Label className="text-kosmos-gray text-sm">Tenant:</Label>
        <Select value={filters.tenant} onValueChange={handleTenantChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="kosmos">KOSMOS</SelectItem>
            <SelectItem value="oliveira-dev">Oliveira Dev</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-2">
        <Label className="text-kosmos-gray text-sm">Período:</Label>
        <Select value={datePreset} onValueChange={(v) => handleDatePresetChange(v as DatePreset)}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {datePreset === 'custom' && (
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(filters.dateRange.start, 'dd/MM', { locale: ptBR })} -{' '}
                {format(filters.dateRange.end, 'dd/MM', { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: filters.dateRange.start,
                  to: filters.dateRange.end,
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    onFiltersChange({
                      ...filters,
                      dateRange: { start: range.from, end: range.to },
                    });
                  }
                }}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Classificacao Filter */}
      {showClassificacao && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="w-4 h-4 mr-2" />
              Classificação
              {filters.classificacao.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {filters.classificacao.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3">
            <div className="space-y-2">
              {(['A', 'B', 'C'] as Classificacao[]).map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <Checkbox
                    id={`class-${c}`}
                    checked={filters.classificacao.includes(c)}
                    onCheckedChange={() => handleClassificacaoToggle(c)}
                  />
                  <Label htmlFor={`class-${c}`} className="text-sm cursor-pointer">
                    {CLASSIFICACAO_LABELS[c]}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Cadence Status Filter */}
      {showCadenceStatus && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="w-4 h-4 mr-2" />
              Status
              {filters.cadenceStatus.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {filters.cadenceStatus.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(Object.keys(CADENCE_STATUS_LABELS) as CadenceStatus[]).map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.cadenceStatus.includes(status)}
                    onCheckedChange={() => handleCadenceStatusToggle(status)}
                  />
                  <Label htmlFor={`status-${status}`} className="text-sm cursor-pointer">
                    {CADENCE_STATUS_LABELS[status]}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Sources Filter */}
      {showSources && availableSources.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="w-4 h-4 mr-2" />
              Fontes
              {filters.sources.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {filters.sources.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableSources.map((source) => (
                <div key={source} className="flex items-center gap-2">
                  <Checkbox
                    id={`source-${source}`}
                    checked={filters.sources.includes(source)}
                    onCheckedChange={() => handleSourceToggle(source)}
                  />
                  <Label htmlFor={`source-${source}`} className="text-sm cursor-pointer capitalize">
                    {source.replace(/_/g, ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Active Filters & Reset */}
      <div className="flex items-center gap-2 ml-auto">
        {activeFiltersCount > 0 && (
          <>
            <Badge variant="outline" className="text-kosmos-orange border-kosmos-orange">
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo
              {activeFiltersCount > 1 ? 's' : ''}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-9">
              <RotateCcw className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
