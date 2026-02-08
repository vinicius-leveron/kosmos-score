import { useState } from 'react';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/design-system/primitives/sheet';
import { ScrollArea, ScrollBar } from '@/design-system/primitives/scroll-area';
import { usePipeline } from '../../hooks/usePipeline';
import { useUpdateContactStage } from '../../hooks/useJourneyStages';
import { StageColumn } from './StageColumn';
import { ContactDetail } from '../contacts/ContactDetail';
import type { ContactListItem } from '../../types';

export function PipelineBoard() {
  const { data, isLoading, error } = usePipeline();
  const updateStage = useUpdateContactStage();
  const [selectedContact, setSelectedContact] = useState<ContactListItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleContactClick = (contact: ContactListItem) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedContact(null), 300);
  };

  const handleDrop = (contactOrgId: string, stageId: string) => {
    // Don't update if dropping on "no-stage" placeholder
    if (stageId === 'no-stage') return;

    updateStage.mutate({ contactOrgId, stageId });
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Erro ao carregar pipeline: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-72 flex-shrink-0 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="w-full">
        <div className="flex gap-4 p-4 min-h-[calc(100vh-200px)]">
          {data?.columns.map((column) => (
            <StageColumn
              key={column.stage.id}
              stage={column.stage}
              contacts={column.contacts}
              count={column.count}
              onContactClick={handleContactClick}
              onDrop={handleDrop}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Contact Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhes do Contato</SheetTitle>
          </SheetHeader>
          {selectedContact && (
            <ContactDetail
              contactOrgId={selectedContact.id}
              onClose={handleCloseDetail}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
