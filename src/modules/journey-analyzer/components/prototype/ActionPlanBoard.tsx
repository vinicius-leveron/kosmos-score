import { Badge } from '@/design-system/primitives/badge';
import type { JourneyIdea } from '../../types';

interface ActionPlanBoardProps {
  projectId: string;
  ideas: JourneyIdea[];
}

export function ActionPlanBoard({ ideas }: ActionPlanBoardProps) {
  if (ideas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhuma solucao selecionada ainda
      </p>
    );
  }

  const quickWins = ideas.filter((i) => (i.impact || 0) >= 4 && (i.effort || 0) <= 2);
  const strategic = ideas.filter((i) => (i.impact || 0) >= 4 && (i.effort || 0) >= 3);
  const other = ideas.filter(
    (i) => !quickWins.includes(i) && !strategic.includes(i)
  );

  const renderCategory = (title: string, items: JourneyIdea[], color: string) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          {title}
        </h4>
        {items.map((idea) => (
          <div key={idea.id} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="min-w-0">
              <p className="text-sm font-medium">{idea.title}</p>
              {idea.description && (
                <p className="text-xs text-muted-foreground truncate">{idea.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              {idea.impact && (
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    idea.impact >= 4 ? 'text-green-600' : idea.impact >= 3 ? 'text-yellow-600' : 'text-red-600'
                  }`}
                >
                  I:{idea.impact}
                </Badge>
              )}
              {idea.effort && (
                <Badge variant="outline" className="text-xs">
                  E:{idea.effort}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderCategory('Quick Wins', quickWins, 'bg-green-500')}
      {renderCategory('Estrategico', strategic, 'bg-yellow-500')}
      {renderCategory('Outros', other, 'bg-blue-500')}
    </div>
  );
}
