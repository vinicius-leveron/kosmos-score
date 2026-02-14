import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Textarea } from '@/design-system/primitives/textarea';
import { Label } from '@/design-system/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/primitives/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/design-system/primitives/dialog';
import { useCreateTest, useUpdateTest } from '../../hooks';
import { useToast } from '@/hooks/use-toast';
import type { JourneyTest, JourneyIdea } from '../../types';
import { TEST_METHODS } from '../../types';

interface TestPlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  test?: JourneyTest;
  ideas: JourneyIdea[];
}

export function TestPlanForm({ open, onOpenChange, projectId, test, ideas }: TestPlanFormProps) {
  const createTest = useCreateTest();
  const updateTest = useUpdateTest();
  const { toast } = useToast();

  const [hypothesis, setHypothesis] = useState('');
  const [method, setMethod] = useState('');
  const [successMetric, setSuccessMetric] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [ideaId, setIdeaId] = useState('');

  useEffect(() => {
    if (test) {
      setHypothesis(test.hypothesis);
      setMethod(test.method || '');
      setSuccessMetric(test.success_metric || '');
      setTargetAudience(test.target_audience || '');
      setIdeaId(test.idea_id || '');
    } else {
      setHypothesis('');
      setMethod('');
      setSuccessMetric('');
      setTargetAudience('');
      setIdeaId('');
    }
  }, [test, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypothesis.trim()) return;

    try {
      if (test) {
        await updateTest.mutateAsync({
          id: test.id,
          hypothesis: hypothesis.trim(),
          method: method || null,
          success_metric: successMetric.trim() || null,
          target_audience: targetAudience.trim() || null,
          idea_id: ideaId || null,
        });
        toast({ title: 'Teste atualizado' });
      } else {
        await createTest.mutateAsync({
          project_id: projectId,
          hypothesis: hypothesis.trim(),
          method: method || undefined,
          success_metric: successMetric.trim() || undefined,
          target_audience: targetAudience.trim() || undefined,
          idea_id: ideaId || undefined,
        });
        toast({ title: 'Teste criado' });
      }
      onOpenChange(false);
    } catch {
      toast({ title: 'Erro ao salvar teste', variant: 'destructive' });
    }
  };

  const isPending = createTest.isPending || updateTest.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{test ? 'Editar Teste' : 'Novo Teste'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test-hyp">Hipotese *</Label>
              <Textarea
                id="test-hyp"
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
              <Label htmlFor="test-metric">Metrica de sucesso</Label>
              <Input
                id="test-metric"
                placeholder="Ex: Taxa de conversao > 5%"
                value={successMetric}
                onChange={(e) => setSuccessMetric(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-aud">Publico-alvo</Label>
              <Input
                id="test-aud"
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {test ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
