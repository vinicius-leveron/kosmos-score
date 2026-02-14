import { memo } from 'react';
import { ThumbsUp, GripVertical } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import type { JourneyIdea } from '../../types';

interface IdeaCardProps {
  idea: JourneyIdea;
  onEdit: (idea: JourneyIdea) => void;
  onVote: (id: string) => void;
}

export const IdeaCard = memo(function IdeaCard({ idea, onEdit, onVote }: IdeaCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', idea.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className="p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
      onClick={() => onEdit(idea)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{idea.title}</p>
          {idea.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {idea.description}
            </p>
          )}
        </div>
        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
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
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={(e) => {
            e.stopPropagation();
            onVote(idea.id);
          }}
          aria-label="Votar nesta ideia"
        >
          <ThumbsUp className="h-3 w-3 mr-1" />
          <span className="text-xs">{idea.votes}</span>
        </Button>
      </div>
    </div>
  );
});
