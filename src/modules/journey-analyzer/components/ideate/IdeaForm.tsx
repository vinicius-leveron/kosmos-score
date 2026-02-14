import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Textarea } from '@/design-system/primitives/textarea';
import { Label } from '@/design-system/primitives/label';
import { Slider } from '@/design-system/primitives/slider';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/design-system/primitives/dialog';
import { useCreateIdea, useUpdateIdea } from '../../hooks';
import { useToast } from '@/hooks/use-toast';
import type { JourneyIdea } from '../../types';

interface IdeaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  idea?: JourneyIdea;
}

export function IdeaForm({ open, onOpenChange, projectId, idea }: IdeaFormProps) {
  const createIdea = useCreateIdea();
  const updateIdea = useUpdateIdea();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [impact, setImpact] = useState<number[]>([3]);
  const [effort, setEffort] = useState<number[]>([3]);

  useEffect(() => {
    if (idea) {
      setTitle(idea.title);
      setDescription(idea.description || '');
      setCategory(idea.category || '');
      setImpact([idea.impact || 3]);
      setEffort([idea.effort || 3]);
    } else {
      setTitle('');
      setDescription('');
      setCategory('');
      setImpact([3]);
      setEffort([3]);
    }
  }, [idea, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (idea) {
        await updateIdea.mutateAsync({
          id: idea.id,
          title: title.trim(),
          description: description.trim() || null,
          category: category.trim() || null,
          impact: impact[0],
          effort: effort[0],
        });
        toast({ title: 'Ideia atualizada' });
      } else {
        await createIdea.mutateAsync({
          project_id: projectId,
          title: title.trim(),
          description: description.trim() || undefined,
          category: category.trim() || undefined,
        });
        toast({ title: 'Ideia criada' });
      }
      onOpenChange(false);
    } catch {
      toast({ title: 'Erro ao salvar ideia', variant: 'destructive' });
    }
  };

  const isPending = createIdea.isPending || updateIdea.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{idea ? 'Editar Ideia' : 'Nova Ideia'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="idea-title">Titulo *</Label>
              <Input
                id="idea-title"
                placeholder="Descreva sua ideia..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idea-desc">Descricao</Label>
              <Textarea
                id="idea-desc"
                placeholder="Detalhes da ideia..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idea-cat">Categoria</Label>
              <Input
                id="idea-cat"
                placeholder="Ex: UX, Marketing, Produto..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Impacto: {impact[0]}</Label>
              <Slider value={impact} onValueChange={setImpact} min={1} max={5} step={1} />
            </div>
            <div className="space-y-2">
              <Label>Esforco: {effort[0]}</Label>
              <Slider value={effort} onValueChange={setEffort} min={1} max={5} step={1} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {idea ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
