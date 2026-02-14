import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import { IdeaCard } from './IdeaCard';
import { IdeaForm } from './IdeaForm';
import { useMoveIdeaStatus, useVoteIdea } from '../../hooks';
import type { JourneyIdea, IdeaStatus } from '../../types';

interface IdeationBoardProps {
  projectId: string;
  ideas: JourneyIdea[];
}

const COLUMNS: { status: IdeaStatus; label: string; color: string }[] = [
  { status: 'draft', label: 'Rascunho', color: 'bg-gray-100' },
  { status: 'voting', label: 'Votacao', color: 'bg-blue-100' },
  { status: 'selected', label: 'Selecionada', color: 'bg-green-100' },
];

export function IdeationBoard({ projectId, ideas }: IdeationBoardProps) {
  const moveStatus = useMoveIdeaStatus();
  const voteIdea = useVoteIdea();
  const [showForm, setShowForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState<JourneyIdea | undefined>();
  const [dragOverColumn, setDragOverColumn] = useState<IdeaStatus | null>(null);

  const handleDrop = (e: React.DragEvent, status: IdeaStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const ideaId = e.dataTransfer.getData('text/plain');
    if (ideaId) {
      moveStatus.mutate({ id: ideaId, status });
    }
  };

  const handleVote = (id: string) => {
    voteIdea.mutate({ id, projectId });
  };

  const handleEdit = (idea: JourneyIdea) => {
    setEditingIdea(idea);
    setShowForm(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setEditingIdea(undefined); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Ideia
        </Button>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map((col) => {
            const columnIdeas = ideas.filter((i) => i.status === col.status);
            return (
              <div
                key={col.status}
                className={`w-72 shrink-0 rounded-lg border p-3 transition-colors ${
                  dragOverColumn === col.status ? 'border-primary bg-primary/5' : ''
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverColumn(col.status);
                }}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={(e) => handleDrop(e, col.status)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">{col.label}</h3>
                  <Badge variant="secondary" className="text-xs">{columnIdeas.length}</Badge>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {columnIdeas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onEdit={handleEdit}
                      onVote={handleVote}
                    />
                  ))}
                  {columnIdeas.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      Arraste ideias para ca
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <IdeaForm
        open={showForm}
        onOpenChange={setShowForm}
        projectId={projectId}
        idea={editingIdea}
      />
    </div>
  );
}
