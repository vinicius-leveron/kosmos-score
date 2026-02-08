import { Badge } from '@/design-system/primitives/badge';
import { cn } from '@/design-system/lib/utils';
import { ContactAvatar, ScoreBadge } from '../shared';
import type { ContactListItem } from '../../types';

interface ContactDragCardProps {
  contact: ContactListItem;
  onClick?: () => void;
  isDragging?: boolean;
  className?: string;
}

export function ContactDragCard({
  contact,
  onClick,
  isDragging = false,
  className,
}: ContactDragCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3 bg-card border rounded-lg cursor-pointer transition-all',
        'hover:border-primary/50 hover:shadow-md',
        isDragging && 'opacity-50 rotate-2 scale-105 shadow-lg',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <ContactAvatar
          name={contact.full_name}
          email={contact.email}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {contact.full_name || 'Sem nome'}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {contact.email}
          </div>
        </div>
        <ScoreBadge score={contact.score} size="sm" />
      </div>

      {/* Tags */}
      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {contact.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="text-xs px-1.5 py-0"
              style={{
                backgroundColor: tag.color + '20',
                color: tag.color,
              }}
            >
              {tag.name}
            </Badge>
          ))}
          {contact.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              +{contact.tags.length - 2}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
