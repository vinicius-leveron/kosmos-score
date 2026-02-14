import { Badge } from '@/design-system/primitives/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/design-system/primitives/tooltip';
import type { JourneyIdea } from '../../types';

interface ImpactEffortMatrixProps {
  ideas: JourneyIdea[];
}

export function ImpactEffortMatrix({ ideas }: ImpactEffortMatrixProps) {
  const scoredIdeas = ideas.filter((i) => i.impact !== null && i.effort !== null);

  if (scoredIdeas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Adicione scores de impacto e esforco nas ideias para visualizar a matriz
      </p>
    );
  }

  const getQuadrant = (impact: number, effort: number) => {
    if (impact >= 3 && effort <= 3) return 'quick-win';
    if (impact >= 3 && effort > 3) return 'strategic';
    if (impact < 3 && effort <= 3) return 'nice-to-have';
    return 'avoid';
  };

  const quadrants = {
    'quick-win': { label: 'Quick Wins', bg: 'bg-green-50', border: 'border-green-200', ideas: [] as JourneyIdea[] },
    'strategic': { label: 'Estrategico', bg: 'bg-yellow-50', border: 'border-yellow-200', ideas: [] as JourneyIdea[] },
    'nice-to-have': { label: 'Nice to Have', bg: 'bg-blue-50', border: 'border-blue-200', ideas: [] as JourneyIdea[] },
    'avoid': { label: 'Evitar', bg: 'bg-red-50', border: 'border-red-200', ideas: [] as JourneyIdea[] },
  };

  scoredIdeas.forEach((idea) => {
    const q = getQuadrant(idea.impact!, idea.effort!);
    quadrants[q].ideas.push(idea);
  });

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {/* Y axis label */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground -rotate-90 w-4">Impacto</span>
          <div className="flex-1 grid grid-cols-2 gap-2">
            {/* Top row: high impact */}
            {(['quick-win', 'strategic'] as const).map((key) => {
              const q = quadrants[key];
              return (
                <div key={key} className={`${q.bg} ${q.border} border rounded-lg p-3 min-h-[120px]`}>
                  <p className="text-xs font-medium mb-2">{q.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {q.ideas.map((idea) => (
                      <Tooltip key={idea.id}>
                        <TooltipTrigger>
                          <Badge variant="secondary" className="text-xs cursor-default">
                            {idea.title.slice(0, 15)}{idea.title.length > 15 ? '...' : ''}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{idea.title}</p>
                          <p className="text-xs">Impacto: {idea.impact} | Esforco: {idea.effort}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              );
            })}
            {/* Bottom row: low impact */}
            {(['nice-to-have', 'avoid'] as const).map((key) => {
              const q = quadrants[key];
              return (
                <div key={key} className={`${q.bg} ${q.border} border rounded-lg p-3 min-h-[120px]`}>
                  <p className="text-xs font-medium mb-2">{q.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {q.ideas.map((idea) => (
                      <Tooltip key={idea.id}>
                        <TooltipTrigger>
                          <Badge variant="secondary" className="text-xs cursor-default">
                            {idea.title.slice(0, 15)}{idea.title.length > 15 ? '...' : ''}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{idea.title}</p>
                          <p className="text-xs">Impacto: {idea.impact} | Esforco: {idea.effort}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* X axis label */}
        <div className="text-center">
          <span className="text-xs text-muted-foreground">Esforco →</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
