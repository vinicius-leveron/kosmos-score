import { useState, useCallback } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/design-system/primitives/popover';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Badge } from '@/design-system/primitives/badge';
import { Separator } from '@/design-system/primitives/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import { Slider } from '@/design-system/primitives/slider';
import { Calendar } from '@/design-system/primitives/calendar';
import { 
  Filter, 
  X, 
  Save, 
  RotateCcw, 
  ChevronDown,
  Calendar as CalendarIcon,
  Search,
  Tag,
} from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type FilterType = 'text' | 'select' | 'date' | 'daterange' | 'range' | 'tags' | 'multiselect';

export type FilterOperator = 'equals' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in';

export interface FilterField<T = any> {
  key: keyof T;
  label: string;
  type: FilterType;
  operators?: FilterOperator[];
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface FilterPreset<T = any> {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  filters: Partial<T>;
}

export interface FilterValue {
  operator: FilterOperator;
  value: any;
}

interface AdvancedFiltersProps<T = any> {
  fields: FilterField<T>[];
  onApply: (filters: Record<string, FilterValue>) => void;
  presets?: FilterPreset<T>[];
  savedFilters?: Record<string, FilterValue>;
  onSavePreset?: (name: string, filters: Record<string, FilterValue>) => void;
  className?: string;
}

export function AdvancedFilters<T = any>({
  fields,
  onApply,
  presets,
  savedFilters,
  onSavePreset,
  className,
}: AdvancedFiltersProps<T>) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, FilterValue>>(savedFilters || {});
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  const activeFiltersCount = Object.keys(filters).length;

  const handleFieldChange = (key: string, value: FilterValue) => {
    if (value.value === null || value.value === undefined || value.value === '') {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleApply = () => {
    onApply(filters);
    setOpen(false);
  };

  const handleReset = () => {
    setFilters({});
    onApply({});
  };

  const handlePresetSelect = (preset: FilterPreset<T>) => {
    const presetFilters: Record<string, FilterValue> = {};
    
    Object.entries(preset.filters).forEach(([key, value]) => {
      presetFilters[key] = {
        operator: 'equals',
        value,
      };
    });
    
    setFilters(presetFilters);
    onApply(presetFilters);
    setOpen(false);
  };

  const handleSavePreset = () => {
    if (presetName && onSavePreset) {
      onSavePreset(presetName, filters);
      setPresetName('');
      setShowSavePreset(false);
    }
  };

  const renderFilterField = (field: FilterField<T>) => {
    const currentFilter = filters[field.key as string];
    const FieldIcon = field.icon;

    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              {FieldIcon && <FieldIcon className="h-4 w-4" />}
              {field.label}
            </Label>
            <div className="flex gap-2">
              <Select
                value={currentFilter?.operator || 'contains'}
                onValueChange={(op) => 
                  handleFieldChange(field.key as string, {
                    operator: op as FilterOperator,
                    value: currentFilter?.value || '',
                  })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Contém</SelectItem>
                  <SelectItem value="equals">Igual a</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder={field.placeholder || 'Digite...'}
                value={currentFilter?.value || ''}
                onChange={(e) =>
                  handleFieldChange(field.key as string, {
                    operator: currentFilter?.operator || 'contains',
                    value: e.target.value,
                  })
                }
                className="flex-1"
              />
            </div>
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              {FieldIcon && <FieldIcon className="h-4 w-4" />}
              {field.label}
            </Label>
            <Select
              value={currentFilter?.value || ''}
              onValueChange={(value) =>
                handleFieldChange(field.key as string, {
                  operator: 'equals',
                  value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'multiselect':
      case 'tags':
        return (
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              {FieldIcon && <FieldIcon className="h-4 w-4" />}
              {field.label}
            </Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[38px]">
              {field.options?.map(option => {
                const selected = Array.isArray(currentFilter?.value) 
                  && currentFilter.value.includes(option.value);
                
                return (
                  <Badge
                    key={option.value}
                    variant={selected ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const currentValues = Array.isArray(currentFilter?.value) 
                        ? currentFilter.value 
                        : [];
                      
                      const newValues = selected
                        ? currentValues.filter(v => v !== option.value)
                        : [...currentValues, option.value];
                      
                      handleFieldChange(field.key as string, {
                        operator: 'in',
                        value: newValues.length > 0 ? newValues : null,
                      });
                    }}
                  >
                    {option.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        );

      case 'range':
        const rangeValue = currentFilter?.value || [field.min || 0, field.max || 100];
        return (
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              {FieldIcon && <FieldIcon className="h-4 w-4" />}
              {field.label}
            </Label>
            <div className="px-2">
              <Slider
                value={rangeValue}
                onValueChange={(value) =>
                  handleFieldChange(field.key as string, {
                    operator: 'between',
                    value,
                  })
                }
                min={field.min || 0}
                max={field.max || 100}
                step={field.step || 1}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{rangeValue[0]}</span>
                <span>{rangeValue[1]}</span>
              </div>
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              {FieldIcon && <FieldIcon className="h-4 w-4" />}
              {field.label}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !currentFilter?.value && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {currentFilter?.value 
                    ? format(new Date(currentFilter.value), 'dd/MM/yyyy')
                    : 'Selecione uma data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={currentFilter?.value ? new Date(currentFilter.value) : undefined}
                  onSelect={(date) =>
                    handleFieldChange(field.key as string, {
                      operator: 'equals',
                      value: date?.toISOString() || null,
                    })
                  }
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn('gap-2', className)}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filtros Avançados</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Presets */}
            {presets && presets.length > 0 && (
              <>
                <div className="flex flex-wrap gap-2">
                  {presets.map(preset => {
                    const PresetIcon = preset.icon;
                    return (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetSelect(preset)}
                      >
                        {PresetIcon && <PresetIcon className="h-3 w-3 mr-1" />}
                        {preset.name}
                      </Button>
                    );
                  })}
                </div>
                <Separator />
              </>
            )}

            {/* Filter Fields */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {fields.map(field => (
                <div key={field.key as string}>
                  {renderFilterField(field)}
                </div>
              ))}
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={activeFiltersCount === 0}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Limpar
              </Button>
              
              <div className="flex gap-2">
                {onSavePreset && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSavePreset(true)}
                    disabled={activeFiltersCount === 0}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                )}
                
                <Button
                  size="sm"
                  onClick={handleApply}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </div>

          {/* Save Preset Dialog */}
          {showSavePreset && (
            <div className="border-t p-4 space-y-3">
              <Label>Nome do Preset</Label>
              <Input
                placeholder="Ex: Leads Quentes"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSavePreset(false);
                    setPresetName('');
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePreset}
                  disabled={!presetName}
                >
                  Salvar Preset
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(filters).map(([key, filter]) => {
            const field = fields.find(f => f.key === key);
            if (!field) return null;

            let displayValue = filter.value;
            if (field.type === 'select' && field.options) {
              const option = field.options.find(o => o.value === filter.value);
              displayValue = option?.label || filter.value;
            } else if (field.type === 'range') {
              displayValue = `${filter.value[0]} - ${filter.value[1]}`;
            } else if (field.type === 'date' && filter.value) {
              displayValue = format(new Date(filter.value), 'dd/MM/yyyy');
            } else if (Array.isArray(filter.value)) {
              displayValue = `${filter.value.length} selecionados`;
            }

            return (
              <Badge
                key={key}
                variant="secondary"
                className="gap-1"
              >
                {field.label}: {displayValue}
                <button
                  onClick={() => handleFieldChange(key, { operator: 'equals', value: null })}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </>
  );
}