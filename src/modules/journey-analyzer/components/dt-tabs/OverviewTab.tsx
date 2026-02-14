import { Heart, Target, Lightbulb, Hammer, FlaskConical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import { Progress } from '@/design-system/primitives/progress';
import { ScoreGauge, ScoreBar } from '../ScoreGauge';
import { ExportButton } from '../export/ExportButton';
import { DT_PHASES, getPhaseLabel, getPhaseStatusColor } from '../../lib/dtPhases';
import type { JourneyProjectWithStages, PhaseProgress, PhaseStatus } from '../../types';

interface OverviewTabProps {
  project: JourneyProjectWithStages;
}

const PHASE_ICONS = {
  empathize: Heart,
  define: Target,
  ideate: Lightbulb,
  prototype: Hammer,
  test: FlaskConical,
} as const;

export function OverviewTab({ project }: OverviewTabProps) {
  const phaseProgress = ((project as Record<string, unknown>).phase_progress as PhaseProgress) || {
    empathize: 'not_started',
    define: 'not_started',
    ideate: 'not_started',
    prototype: 'not_started',
    test: 'not_started',
  };

  const completedPhases = Object.values(phaseProgress).filter((s) => s === 'completed').length;
  const progressPercent = (completedPhases / 5) * 100;

  return (
    <div className="space-y-6">
      {/* Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Visao Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Score Geral</p>
              <ScoreGauge score={project.overall_score} size="lg" />
            </div>
            <div className="flex-1 space-y-3 w-full">
              {project.stages?.map((stage) => (
                <ScoreBar key={stage.id} score={stage.score} label={stage.display_name} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Progress */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Progresso Design Thinking</CardTitle>
            <ExportButton project={project} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progresso geral</span>
              <span className="font-medium">{completedPhases}/5 fases</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {DT_PHASES.map((phase) => {
              const Icon = PHASE_ICONS[phase.id];
              const status = phaseProgress[phase.id] as PhaseStatus;
              return (
                <div key={phase.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{phase.name}</p>
                    <Badge variant="outline" className={`text-xs ${getPhaseStatusColor(status)}`}>
                      {getPhaseLabel(status)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
