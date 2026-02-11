import { useState } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Textarea } from '@/design-system/primitives/textarea';
import { Switch } from '@/design-system/primitives/switch';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useCreatePipeline } from '../../hooks/usePipelines';

interface PipelineStage {
  name: string;
  color: string;
}

interface PipelineFormProps {
  organizationId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const defaultColors = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
];

export function PipelineForm({ organizationId, onSuccess, onCancel }: PipelineFormProps) {
  const createPipeline = useCreatePipeline();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_default: false,
  });
  
  const [stages, setStages] = useState<PipelineStage[]>([
    { name: 'Novo', color: '#3B82F6' },
    { name: 'Em Progresso', color: '#F59E0B' },
    { name: 'Fechado', color: '#10B981' },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || stages.length === 0) {
      return;
    }

    createPipeline.mutate(
      {
        organizationId,
        data: {
          ...formData,
          stages,
        },
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };
  
  const addStage = () => {
    const colorIndex = stages.length % defaultColors.length;
    setStages([...stages, { name: '', color: defaultColors[colorIndex] }]);
  };
  
  const removeStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };
  
  const updateStage = (index: number, field: 'name' | 'color', value: string) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], [field]: value };
    setStages(newStages);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Pipeline *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Pipeline de Vendas"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva o objetivo deste pipeline"
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="is_default" className="text-sm">
          Definir como padrão
        </Label>
        <Switch
          id="is_default"
          checked={formData.is_default}
          onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Estágios do Pipeline</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addStage}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Estágio
          </Button>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {stages.map((stage, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Nome do estágio"
                value={stage.name}
                onChange={(e) => updateStage(index, 'name', e.target.value)}
                required
              />
              <Input
                type="color"
                value={stage.color}
                onChange={(e) => updateStage(index, 'color', e.target.value)}
                className="w-20"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeStage(index)}
                disabled={stages.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={createPipeline.isPending}>
          {createPipeline.isPending && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          )}
          Criar Pipeline
        </Button>
      </div>
    </form>
  );
}