import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Textarea } from '@/design-system/primitives/textarea';
import { Label } from '@/design-system/primitives/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import { useToast } from '@/hooks/use-toast';
import { touchpointSchema } from '../schemas';
import type { TouchpointType } from '../types';

const TOUCHPOINT_TYPE_OPTIONS: { value: TouchpointType; label: string }[] = [
  { value: 'page', label: 'Pagina' },
  { value: 'email', label: 'E-mail' },
  { value: 'event', label: 'Evento' },
  { value: 'content', label: 'Conteudo' },
  { value: 'automation', label: 'Automacao' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'call', label: 'Ligacao' },
  { value: 'other', label: 'Outro' },
];

interface AddTouchpointFormProps {
  onAdd: (data: { name: string; description: string; type: TouchpointType }) => Promise<void>;
  isAdding: boolean;
}

export function AddTouchpointForm({ onAdd, isAdding }: AddTouchpointFormProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TouchpointType>('other');

  const handleSubmit = async () => {
    const parsed = touchpointSchema.safeParse({
      name: name.trim(),
      description: description.trim() || undefined,
      type,
    });
    if (!parsed.success) {
      toast({ title: parsed.error.errors[0]?.message || 'Dados invalidos', variant: 'destructive' });
      return;
    }
    await onAdd({ name: name.trim(), description: description.trim(), type });
    setName('');
    setDescription('');
    setType('other');
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <Button variant="outline" className="w-full" onClick={() => setShowForm(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Touchpoint
      </Button>
    );
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
      <div className="space-y-2">
        <Label>Nome do Touchpoint</Label>
        <Input
          placeholder="Ex: Landing page de captacao"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select value={type} onValueChange={(v) => setType(v as TouchpointType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOUCHPOINT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Descricao</Label>
        <Textarea
          placeholder="Descreva este touchpoint..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={isAdding}>
          {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Adicionar
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
