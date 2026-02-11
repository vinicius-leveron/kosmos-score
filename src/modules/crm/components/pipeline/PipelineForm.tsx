import { useState } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Textarea } from '@/design-system/primitives/textarea';
import { Switch } from '@/design-system/primitives/switch';
import { Loader2 } from 'lucide-react';
import { useCreatePipeline } from '../../hooks/usePipelines';
import type { PipelineFormData } from '../../types';

interface PipelineFormProps {
  organizationId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PipelineForm({ organizationId, onSuccess, onCancel }: PipelineFormProps) {
  const createPipeline = useCreatePipeline();
  const [formData, setFormData] = useState<PipelineFormData>({
    name: '',
    description: '',
    is_default: false,
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    createPipeline.mutate(
      {
        organizationId,
        data: formData,
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
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

      <div className="flex items-center justify-between">
        <Label htmlFor="is_active" className="text-sm">
          Pipeline ativo
        </Label>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
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