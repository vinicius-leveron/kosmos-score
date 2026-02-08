import { useState, useCallback } from 'react';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/design-system/primitives/sheet';
import { ScrollArea, ScrollBar } from '@/design-system/primitives/scroll-area';
import { usePipelineBoard, useMoveContactInPipeline } from '../../hooks/usePipelineBoard';
import { StageColumn } from './StageColumn';
import { ContactDetail } from '../contacts/ContactDetail';
import { ConvertToClientModal } from './ConvertToClientModal';
import { useOrganization } from '@/core/auth';
import type { ContactListItem, PipelineBoardContact, PipelineStage } from '../../types';

interface PipelineBoardProps {
  pipelineId?: string;
}

// Pending move state for conversion flow
interface PendingMove {
  positionId: string;
  contactOrgId: string;
  contactName: string;
  stageId: string;
  stage: PipelineStage;
}

export function PipelineBoard({ pipelineId }: PipelineBoardProps) {
  const { data, isLoading, error } = usePipelineBoard(pipelineId);
  const { isKosmosMaster } = useOrganization();
  const moveContact = useMoveContactInPipeline();
  const [selectedContact, setSelectedContact] = useState<ContactListItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  const handleContactClick = (contact: ContactListItem) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedContact(null), 300);
  };

  // Find the target stage by ID
  const findStageById = useCallback((stageId: string): PipelineStage | undefined => {
    return data?.columns.find(col => col.stage.id === stageId)?.stage;
  }, [data]);

  // Find the contact being dropped
  const findContactByOrgId = useCallback((contactOrgId: string): PipelineBoardContact | undefined => {
    for (const column of data?.columns || []) {
      const contact = column.contacts.find(c => c.contact_org_id === contactOrgId);
      if (contact) return contact;
    }
    return undefined;
  }, [data]);

  // Complete the move (after conversion or skip)
  const completePendingMove = useCallback(() => {
    if (!pendingMove || !pipelineId) return;

    moveContact.mutate({
      positionId: pendingMove.positionId,
      pipelineId,
      newStageId: pendingMove.stageId,
    });

    setPendingMove(null);
  }, [pendingMove, pipelineId, moveContact]);

  const handleDrop = (contactOrgId: string, stageId: string) => {
    // Don't update if dropping on "no-stage" placeholder or no pipeline selected
    if (stageId === 'no-stage' || !pipelineId) return;

    const targetStage = findStageById(stageId);
    const contact = findContactByOrgId(contactOrgId);

    if (!targetStage || !contact) {
      // Fallback to regular move
      moveContact.mutate({ positionId: contact?.id || contactOrgId, pipelineId, newStageId: stageId });
      return;
    }

    // Check if this is a "winning" stage (positive exit) and user is KOSMOS master
    const isWinningStage = targetStage.is_exit_stage && targetStage.exit_type === 'positive';

    if (isWinningStage && isKosmosMaster) {
      // Store pending move and open conversion modal
      setPendingMove({
        positionId: contact.id,
        contactOrgId: contact.contact_org_id,
        contactName: contact.full_name,
        stageId,
        stage: targetStage,
      });
      setIsConvertModalOpen(true);
    } else {
      // Regular move
      moveContact.mutate({ positionId: contact.id, pipelineId, newStageId: stageId });
    }
  };

  const handleConvertSuccess = (organizationId: string) => {
    // Complete the move after successful conversion
    completePendingMove();
    setIsConvertModalOpen(false);
  };

  const handleConvertSkip = () => {
    // Complete the move without conversion
    completePendingMove();
    setIsConvertModalOpen(false);
  };

  if (!pipelineId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Selecione um pipeline para visualizar
      </div>
    );
  }

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
      <div className="h-full overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-4 h-full min-w-max">
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
      </div>

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

      {/* Convert to Client Modal */}
      {pendingMove && (
        <ConvertToClientModal
          open={isConvertModalOpen}
          onOpenChange={setIsConvertModalOpen}
          contactOrgId={pendingMove.contactOrgId}
          contactName={pendingMove.contactName}
          onSuccess={handleConvertSuccess}
          onSkip={handleConvertSkip}
        />
      )}
    </>
  );
}
