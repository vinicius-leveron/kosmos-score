import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Textarea } from '@/design-system/primitives/textarea';
import { Label } from '@/design-system/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/primitives/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/design-system/primitives/dialog';
import { useToast } from '@/hooks/use-toast';
import { TEST_METHODS } from '../../types';
import type { JourneyIdea } from '../../types';
import type { UseMutationResult } from '@tanstack/react-query';

interface ClientExperimentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
  ideas: JourneyIdea[];
  onCreate: UseMutationResult<unknown, Error, {
    hypothesis: string;
    method?: string;
    success_metric?: string;
    target_audience?: string;
    idea_id?: string;
  }>;
}

export function ClientExperimentForm({
  open,
  onOpenChange,
  ideas,
  onCreate,
}: ClientExperimentFormProps) {
  const { toast } = useToast();
  const [hypothesis, setHypothesis] = useState('');
  const [method, setMethod] = useState('');
  const [successMetric, setSuccessMetric] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [ideaId, setIdeaId] = useState('');

  const resetForm = () => {
    setHypothesis('');
    setMethod('');
    setSuccessMetric('');
    setTargetAudience('');
    setIdeaId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypothesis.trim()) return;

    try {
      await onCreate.mutateAsync({
        hypothesis: hypothesis.trim(),
        method: method || undefined,
        success_metric: successMetric.trim() || undefined,
        target_audience: targetAudience.trim() || undefined,
        idea_id: ideaId || undefined,
      });
      toast({ title: 'Experimento criado!' });
      resetForm();
      onOpenChange(false);
    } catch {
      toast({ title: 'Erro ao criar experimento', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Experimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client-exp-hyp">Hipotese *</Label>
              <Textarea
                id="client-exp-hyp"
                placeholder="Se fizermos X, entao Y vai acontecer..."
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Metodo</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {TEST_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-exp-metric">Metrica de sucesso</Label>
              <Input
                id="client-exp-metric"
                placeholder="Ex: Taxa de conversao > 5%"
                value={successMetric}
                onChange={(e) => setSuccessMetric(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-exp-aud">Publico-alvo</Label>
              <Input
                id="client-exp-aud"
                placeholder="Ex: Membros ativos"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
            {ideas.length > 0 && (
              <div className="space-y-2">
                <Label>Ideia vinculada</Label>
                <Select value={ideaId} onValueChange={setIdeaId}>
                  <SelectTrigger><SelectValue placeholder="Vincular a ideia (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {ideas.map((i) => (
                      <SelectItem key={i.id} value={i.id}>{i.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={onCreate.isPending}>
              {onCreate.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Experimento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
