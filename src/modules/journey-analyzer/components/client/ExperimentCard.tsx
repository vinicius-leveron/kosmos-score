import { useState, memo } from 'react';
import { Trash2, Loader2, ExternalLink } from 'lucide-react';
import { Badge } from '@/design-system/primitives/badge';
import { Button } from '@/design-system/primitives/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/primitives/select';
import type { JourneyTest, TestStatus, TestResult } from '../../types';

const STATUS_LABELS: Record<TestStatus, string> = {
  planned: 'Planejado',
  in_progress: 'Em andamento',
  completed: 'Concluido',
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

interface ExperimentCardProps {
  test: JourneyTest;
  onStatusChange: (test: JourneyTest, status: string) => void;
  onResultChange: (test: JourneyTest, result: string) => void;
  onFindingsChange: (test: JourneyTest, findings: string) => void;
  onDelete: (testId: string) => void;
  isDeleting: boolean;
}

export const ExperimentCard = memo(function ExperimentCard({
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
});
