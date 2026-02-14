import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/design-system/primitives/badge';
import type { JourneyIdea } from '../../types';

interface SolutionsListProps {
  ideas: JourneyIdea[];
}

export function SolutionsList({ ideas }: SolutionsListProps) {
  if (ideas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Selecione ideias na aba Idear para ver as solucoes aqui
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {ideas.map((idea) => (
        <div key={idea.id} className="p-4 rounded-lg border">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">{idea.title}</p>
              {idea.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                  {idea.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {idea.impact && (
                  <Badge variant="outline" className="text-xs">
                    Impacto: {idea.impact}
                  </Badge>
                )}
                {idea.effort && (
                  <Badge variant="outline" className="text-xs">
                    Esforco: {idea.effort}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {idea.votes} votos
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
