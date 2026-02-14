import { User, Pencil, Trash2, Target, AlertTriangle } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import type { JourneyPersona } from '../../types';

interface PersonaCardProps {
  /** The persona data to display */
  persona: JourneyPersona;
  /** Callback when the edit button is clicked */
  onEdit: (persona: JourneyPersona) => void;
  /** Callback when the delete button is clicked */
  onDelete: (id: string) => void;
}

/**
 * PersonaCard - Displays a persona summary in a compact card format.
 * Shows name, role, age range, plus goals and pain points as badges.
 */
export function PersonaCard({ persona, onEdit, onDelete }: PersonaCardProps) {
  return (
    <div className="group relative rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30">
      {/* Header: Avatar + Info */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {persona.avatar_url ? (
            <img
              src={persona.avatar_url}
              alt={persona.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold text-foreground">{persona.name}</h4>
          <p className="text-sm text-muted-foreground">
            {[persona.role, persona.age_range].filter(Boolean).join(' · ') || 'Sem detalhes'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(persona)}
            aria-label={`Editar persona ${persona.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(persona.id)}
            aria-label={`Excluir persona ${persona.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Bio */}
      {persona.bio && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{persona.bio}</p>
      )}

      {/* Goals */}
      {persona.goals.length > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Target className="h-3 w-3" />
            <span>Objetivos</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {persona.goals.slice(0, 3).map((goal, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {goal}
              </Badge>
            ))}
            {persona.goals.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{persona.goals.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Pain Points */}
      {persona.pain_points.length > 0 && (
        <div className="mt-2">
          <div className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            <span>Dores</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {persona.pain_points.slice(0, 3).map((pain, i) => (
              <Badge
                key={i}
                variant="outline"
                className={cn('text-xs border-destructive/30 text-destructive/80')}
              >
                {pain}
              </Badge>
            ))}
            {persona.pain_points.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{persona.pain_points.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
