import { useState } from 'react';
import { Plus, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import { Button } from '@/design-system/primitives/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/primitives/select';
import { useToast } from '@/hooks/use-toast';
import { useClientContext } from '../../contexts/ClientAccessContext';
import { useClientCreateTest, useClientUpdateTest, useClientDeleteTest } from '../../hooks';
import { ClientExperimentForm } from './ClientExperimentForm';
import type { JourneyTest, TestStatus, TestResult } from '../../types';

const STATUS_LABELS: Record<TestStatus, string> = {
  planned: 'Planejado',
  in_progress: 'Em andamento',
  completed: 'Concluido',
};

const STATUS_COLORS: Record<TestStatus, string> = {
  planned: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

const RESULT_LABELS: Record<TestResult, string> = {
  validated: 'Validado',
  invalidated: 'Invalidado',
  inconclusive: 'Inconclusivo',
};

const RESULT_COLORS: Record<TestResult, string> = {
  validated: 'bg-green-100 text-green-700',
  invalidated: 'bg-red-100 text-red-700',
  inconclusive: 'bg-yellow-100 text-yellow-700',
};

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
                  isUpdating={updateTest.isPending}
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

interface ExperimentCardProps {
  test: JourneyTest;
  onStatusChange: (test: JourneyTest, status: string) => void;
  onResultChange: (test: JourneyTest, result: string) => void;
  onFindingsChange: (test: JourneyTest, findings: string) => void;
  onDelete: (testId: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

function ExperimentCard({
  test,
  onStatusChange,
  onResultChange,
  onFindingsChange,
  onDelete,
  isDeleting,
}: ExperimentCardProps) {
  const [editingFindings, setEditingFindings] = useState(false);
  const [findingsText, setFindingsText] = useState(test.findings || '');

  return (
    <div className="p-4 rounded-lg border space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium">{test.hypothesis}</p>
          {test.method && (
            <Badge variant="outline" className="text-xs mt-1">{test.method}</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => onDelete(test.id)}
          disabled={isDeleting}
          aria-label="Excluir experimento"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Metadata */}
      {(test.success_metric || test.target_audience) && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {test.success_metric && <span>Meta: {test.success_metric}</span>}
          {test.target_audience && <span>Publico: {test.target_audience}</span>}
        </div>
      )}

      {/* Status & Result Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={test.status} onValueChange={(v) => onStatusChange(test, v)}>
          <SelectTrigger className="w-[150px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(STATUS_LABELS) as TestStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {test.status === 'completed' && (
          <Select value={test.result || ''} onValueChange={(v) => onResultChange(test, v)}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="Resultado" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(RESULT_LABELS) as TestResult[]).map((r) => (
                <SelectItem key={r} value={r}>{RESULT_LABELS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {test.result && (
          <Badge className={`text-xs ${RESULT_COLORS[test.result]}`}>
            {RESULT_LABELS[test.result]}
          </Badge>
        )}
      </div>

      {/* Findings */}
      {test.status === 'completed' && (
        <div className="pt-2 border-t">
          {editingFindings ? (
            <div className="space-y-2">
              <textarea
                className="w-full text-sm border rounded-md p-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary"
                value={findingsText}
                onChange={(e) => setFindingsText(e.target.value)}
                placeholder="Descreva os achados e aprendizados deste experimento..."
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFindingsText(test.findings || '');
                    setEditingFindings(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    onFindingsChange(test, findingsText);
                    setEditingFindings(false);
                  }}
                >
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditingFindings(true)}
              className="w-full text-left"
            >
              {test.findings ? (
                <p className="text-sm text-muted-foreground">{test.findings}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Clique para adicionar achados e aprendizados...
                </p>
              )}
            </button>
          )}
        </div>
      )}

      {/* Evidence URL */}
      {test.evidence_url && (
        <a
          href={test.evidence_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Ver evidencia
        </a>
      )}
    </div>
  );
}
