import { useState } from 'react';
import { Plus, Trash2, FlaskConical } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/primitives/select';
import { TestPlanForm } from './TestPlanForm';
import { useUpdateTestResult, useDeleteTest } from '../../hooks';
import type { JourneyTest, JourneyIdea, TestStatus, TestResult } from '../../types';

interface TestPlanListProps {
  projectId: string;
  tests: JourneyTest[];
  ideas: JourneyIdea[];
}

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

export function TestPlanList({ projectId, tests, ideas }: TestPlanListProps) {
  const updateResult = useUpdateTestResult();
  const deleteTest = useDeleteTest();
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState<JourneyTest | undefined>();

  const handleStatusChange = (test: JourneyTest, status: string) => {
    updateResult.mutate({
      id: test.id,
      status: status as TestStatus,
      result: test.result || undefined,
    });
  };

  const handleResultChange = (test: JourneyTest, result: string) => {
    updateResult.mutate({
      id: test.id,
      status: 'completed',
      result: result as TestResult,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setEditingTest(undefined); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Teste
        </Button>
      </div>

      {tests.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <FlaskConical className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-1">Nenhum teste criado</p>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            Crie testes para validar hipoteses sobre as ideias selecionadas
          </p>
          <Button variant="outline" size="sm" onClick={() => { setEditingTest(undefined); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Teste
          </Button>
        </div>
      ) : (
        tests.map((test) => (
          <div key={test.id} className="p-4 rounded-lg border space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium flex-1">{test.hypothesis}</p>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => deleteTest.mutate({ id: test.id, projectId })}
                aria-label="Excluir teste"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {test.method && <Badge variant="outline" className="text-xs">{test.method}</Badge>}
              <Select value={test.status} onValueChange={(v) => handleStatusChange(test, v)}>
                <SelectTrigger className="w-[140px] h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as TestStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {test.status === 'completed' && (
                <Select value={test.result || ''} onValueChange={(v) => handleResultChange(test, v)}>
                  <SelectTrigger className="w-[140px] h-7 text-xs">
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
            {test.findings && (
              <p className="text-xs text-muted-foreground">{test.findings}</p>
            )}
          </div>
        ))
      )}

      <TestPlanForm
        open={showForm}
        onOpenChange={setShowForm}
        projectId={projectId}
        test={editingTest}
        ideas={ideas}
      />
    </div>
  );
}
