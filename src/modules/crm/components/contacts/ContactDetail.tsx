import { useState } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import { Separator } from '@/design-system/primitives/separator';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { Textarea } from '@/design-system/primitives/textarea';
import {
  Mail,
  Phone,
  Calendar,
  Tag,
  Plus,
  X,
  Edit2,
  Save,
} from 'lucide-react';
import { useContactDetail } from '../../hooks/useContactDetail';
import { useUpdateContactStage } from '../../hooks/useJourneyStages';
import { useAddTagToContact, useRemoveTagFromContact, useTags } from '../../hooks/useTags';
import { useCreateActivity } from '../../hooks/useActivities';
import { ContactAvatar, ScoreBadge, JourneyStageSelect } from '../shared';
import { ActivityTimeline } from '../timeline/ActivityTimeline';
import { ScoreDisplay } from './ScoreDisplay';
import { ContactPipelinesList } from './ContactPipelinesList';

interface ContactDetailProps {
  contactOrgId: string;
  onClose: () => void;
}

export function ContactDetail({ contactOrgId, onClose }: ContactDetailProps) {
  const { data: contact, isLoading, error } = useContactDetail(contactOrgId);
  const { data: allTags } = useTags();
  const updateStage = useUpdateContactStage();
  const addTag = useAddTagToContact();
  const removeTag = useRemoveTagFromContact();
  const createActivity = useCreateActivity();

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showTagPicker, setShowTagPicker] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="py-6 text-center text-red-400">
        Erro ao carregar contato
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleStageChange = (stageId: string) => {
    updateStage.mutate({ contactOrgId, stageId });
  };

  const handleAddTag = (tagId: string) => {
    addTag.mutate({ contactOrgId, tagId });
    setShowTagPicker(false);
  };

  const handleRemoveTag = (tagId: string) => {
    removeTag.mutate({ contactOrgId, tagId });
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;

    createActivity.mutate({
      contactOrgId,
      data: {
        type: 'note',
        title: 'Nota adicionada',
        description: noteContent.trim(),
      },
    });

    setNoteContent('');
    setIsAddingNote(false);
  };

  const availableTags = allTags?.filter(
    (tag) => !contact.contact_org.tags.some((t) => t.id === tag.id)
  );

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <ContactAvatar
          name={contact.full_name}
          email={contact.email}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold truncate">
            {contact.full_name || 'Sem nome'}
          </h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{contact.email}</span>
          </div>
          {contact.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{contact.phone}</span>
            </div>
          )}
        </div>
        <ScoreBadge score={contact.contact_org.score} size="lg" />
      </div>

      <Separator />

      {/* Score Breakdown */}
      {contact.contact_org.score !== null && (
        <>
          <ScoreDisplay scoreBreakdown={contact.contact_org.score_breakdown} />
          <Separator />
        </>
      )}

      {/* Pipelines */}
      <ContactPipelinesList contactOrgId={contactOrgId} />

      <Separator />

      {/* Legacy Stage - keeping for backwards compatibility */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Estágio da Jornada (Legado)</label>
        <JourneyStageSelect
          value={contact.contact_org.journey_stage_id || undefined}
          onValueChange={handleStageChange}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Tags</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTagPicker(!showTagPicker)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {showTagPicker && availableTags && availableTags.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
            {availableTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="cursor-pointer hover:bg-muted"
                style={{ borderColor: tag.color, color: tag.color }}
                onClick={() => handleAddTag(tag.id)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {contact.contact_org.tags.map((tag) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color + '20', color: tag.color }}
              className="pr-1"
            >
              {tag.name}
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 hover:bg-black/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {contact.contact_org.tags.length === 0 && (
            <span className="text-sm text-muted-foreground">Nenhuma tag</span>
          )}
        </div>
      </div>

      <Separator />

      {/* Notes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Adicionar Nota</label>
        </div>

        {isAddingNote ? (
          <div className="space-y-2">
            <Textarea
              placeholder="Digite sua nota..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingNote(false);
                  setNoteContent('');
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={!noteContent.trim() || createActivity.isPending}
              >
                <Save className="h-4 w-4 mr-1" />
                Salvar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setIsAddingNote(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Adicionar nota...
          </Button>
        )}
      </div>

      <Separator />

      {/* Timeline */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Atividades</label>
        <ActivityTimeline contactOrgId={contactOrgId} />
      </div>

      {/* Metadata */}
      <Separator />
      <div className="text-sm text-muted-foreground space-y-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Criado em {formatDate(contact.created_at)}</span>
        </div>
        <div>Fonte: {contact.source}</div>
      </div>
    </div>
  );
}
