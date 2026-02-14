import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Button } from '@/design-system/primitives/button';
import { useToast } from '@/hooks/use-toast';
import { useClientContext } from '../../contexts/ClientAccessContext';
import { useClientCreateTest, useClientUpdateTest, useClientDeleteTest } from '../../hooks';
import { ClientExperimentForm } from './ClientExperimentForm';
import { ExperimentCard } from './ExperimentCard';
import type { JourneyTest } from '../../types';

export function ClientExperimentsPanel() {
  const { token, data } = useClientContext();
  const { tests, ideas } = data;
  const createTest = useClientCreateTest(token);
  const updateTest = useClientUpdateTest(token);
  const deleteTest = useClientDeleteTest(token);
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const selectedIdeas = ideas.filter((i) => i.status === 'selected');

  const handleStatusChange = async (test: JourneyTest, status: string) => {
    try {
      await updateTest.mutateAsync({ id: test.id, status });
    } catch {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    }
  };

  const handleResultChange = async (test: JourneyTest, result: string) => {
    try {
      await updateTest.mutateAsync({ id: test.id, status: 'completed', result });
    } catch {
      toast({ title: 'Erro ao registrar resultado', variant: 'destructive' });
    }
  };

  const handleFindingsChange = async (test: JourneyTest, findings: string) => {
    try {
      await updateTest.mutateAsync({ id: test.id, findings });
    } catch {
      toast({ title: 'Erro ao salvar achados', variant: 'destructive' });
    }
  };

  const handleDelete = async (testId: string) => {
    try {
      await deleteTest.mutateAsync(testId);
      toast({ title: 'Experimento removido' });
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Seus Experimentos</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Crie e gerencie experimentos para validar as ideias selecionadas
              </p>
            </div>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Experimento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Nenhum experimento criado ainda. Comece criando seu primeiro experimento!
              </p>
              <Button variant="outline" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Experimento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => (
                <ExperimentCard
                  key={test.id}
                  test={test}
                  onStatusChange={handleStatusChange}
                  onResultChange={handleResultChange}
                  onFindingsChange={handleFindingsChange}
                  onDelete={handleDelete}
                  isDeleting={deleteTest.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ClientExperimentForm
        open={showForm}
        onOpenChange={setShowForm}
        token={token}
        ideas={selectedIdeas}
        onCreate={createTest}
      />
    </div>
  );
}
