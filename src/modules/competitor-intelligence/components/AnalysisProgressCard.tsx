/**
 * AnalysisProgressCard - Shows pipeline progress for a competitor analysis run
 */

import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Progress } from '@/design-system/primitives/progress';
import { PIPELINE_STATUS_CONFIG } from '../lib/channelConfig';
import type { CompetitorAnalysisRun } from '../lib/competitorTypes';

interface AnalysisProgressCardProps {
  run: CompetitorAnalysisRun;
}

const PIPELINE_STAGES = [
  { key: 'discovering', label: 'Descoberta', agent: '@discovery' },
  { key: 'scraping', label: 'Extração', agent: '@scraper' },
  { key: 'analyzing', label: 'Análise', agent: '@analyst' },
  { key: 'enriching', label: 'Insights', agent: '@enrichment' },
  { key: 'completed', label: 'Relatório', agent: '@report' },
] as const;

function getStageStatus(stageKey: string, currentStatus: string): 'done' | 'active' | 'pending' {
  const stageOrder = ['pending', 'discovering', 'scraping', 'analyzing', 'enriching', 'completed'];
  const stageIndex = stageOrder.indexOf(stageKey);
  const currentIndex = stageOrder.indexOf(currentStatus);

  if (currentStatus === 'failed') return stageIndex <= currentIndex ? 'done' : 'pending';
  if (stageIndex < currentIndex) return 'done';
  if (stageIndex === currentIndex) return 'active';
  return 'pending';
}

export function AnalysisProgressCard({ run }: AnalysisProgressCardProps) {
  const statusConfig = PIPELINE_STATUS_CONFIG[run.status] ?? PIPELINE_STATUS_CONFIG.pending;
  const isFailed = run.status === 'failed';
  const isCompleted = run.status === 'completed';

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4" aria-live="polite" aria-atomic="true">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-green-400" aria-hidden="true" />
          ) : isFailed ? (
            <XCircle className="h-4 w-4 text-red-400" aria-hidden="true" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" aria-hidden="true" />
          )}
          <span className={`text-sm font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {run.progress}%
        </span>
      </div>

      {/* Progress bar */}
      <Progress
        value={run.progress}
        className="h-2"
        aria-label={`Progresso da análise: ${run.progress}%`}
      />

      {/* Stages */}
      <div className="flex justify-between">
        {PIPELINE_STAGES.map((stage) => {
          const status = getStageStatus(stage.key, run.status);
          return (
            <div key={stage.key} className="flex flex-col items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  status === 'done'
                    ? 'bg-green-400'
                    : status === 'active'
                      ? 'bg-blue-400 animate-pulse'
                      : 'bg-muted'
                }`}
                aria-hidden="true"
              />
              <span className={`text-xs ${
                status === 'active' ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {isFailed && run.error_message && (
        <p className="text-xs text-red-400 bg-red-400/10 rounded p-2">
          {run.error_message}
        </p>
      )}

      {/* Timing */}
      {run.started_at && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span>
            {run.completed_at
              ? `Concluído em ${getElapsedTime(run.started_at, run.completed_at)}`
              : `Iniciado ${formatTime(run.started_at)}`
            }
          </span>
        </div>
      )}
    </div>
  );
}

function getElapsedTime(start: string, end: string): string {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const seconds = Math.round(diff / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}min`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
