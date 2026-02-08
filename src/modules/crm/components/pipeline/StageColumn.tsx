import { cn } from '@/design-system/lib/utils';
import { ScrollArea } from '@/design-system/primitives/scroll-area';
import { ContactDragCard } from './ContactDragCard';
import type { JourneyStage, ContactListItem, PipelineStage } from '../../types';

interface StageColumnProps {
  stage: JourneyStage | PipelineStage;
  contacts: ContactListItem[];
  count: number;
  onContactClick: (contact: ContactListItem) => void;
  onDrop?: (contactOrgId: string, stageId: string) => void;
  isDropTarget?: boolean;
  className?: string;
}

export function StageColumn({
  stage,
  contacts,
  count,
  onContactClick,
  onDrop,
  isDropTarget = false,
  className,
}: StageColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const contactOrgId = e.dataTransfer.getData('text/plain');
    if (contactOrgId && onDrop) {
      onDrop(contactOrgId, stage.id);
    }
  };

  const handleDragStart = (e: React.DragEvent, contactOrgId: string) => {
    e.dataTransfer.setData('text/plain', contactOrgId);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={cn(
        'flex flex-col w-72 flex-shrink-0 bg-muted/30 rounded-lg',
        isDropTarget && 'ring-2 ring-primary ring-offset-2',
        className
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <span className="font-medium text-sm">{stage.display_name}</span>
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {contacts.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhum contato
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                draggable
                onDragStart={(e) => handleDragStart(e, contact.id)}
              >
                <ContactDragCard
                  contact={contact}
                  onClick={() => onContactClick(contact)}
                />
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
