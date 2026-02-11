import { useState } from 'react';
import { Badge } from '@/design-system/primitives/badge';
import { Button } from '@/design-system/primitives/button';
import { Separator } from '@/design-system/primitives/separator';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { Textarea } from '@/design-system/primitives/textarea';
import {
  Building2,
  Calendar,
  DollarSign,
  Target,
  User,
  Trophy,
  XCircle,
  MessageSquare,
  Phone,
  Mail,
  Save,
} from 'lucide-react';
import { useDealDetail, useCloseDeal, useAddDealActivity } from '../../hooks/useDeals';
import { TaskPanel } from '../tasks';
import type { DealActivity } from '../../types';

interface DealDetailProps {
  dealId: string;
  onClose: () => void;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Aberto', variant: 'default' },
  won: { label: 'Ganho', variant: 'secondary' },
  lost: { label: 'Perdido', variant: 'destructive' },
  abandoned: { label: 'Abandonado', variant: 'outline' },
};

const activityTypeIcons: Record<DealActivity['type'], React.ReactNode> = {
  note: <MessageSquare className="h-4 w-4" />,
  email_sent: <Mail className="h-4 w-4" />,
  call: <Phone className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  proposal_sent: <DollarSign className="h-4 w-4" />,
  stage_changed: <Target className="h-4 w-4" />,
  won: <Trophy className="h-4 w-4 text-green-500" />,
  lost: <XCircle className="h-4 w-4 text-red-500" />,
};

export function DealDetail({ dealId, onClose }: DealDetailProps) {
  const { data: deal, isLoading, error } = useDealDetail(dealId);
  const closeDeal = useCloseDeal();
  const addActivity = useAddDealActivity();

  const [noteContent, setNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="py-6 text-center text-red-400">
        Erro ao carregar deal
      </div>
    );
  }

  const status = statusLabels[deal.status] || statusLabels.open;

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: deal.currency || 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleWin = () => {
    closeDeal.mutate({ dealId, status: 'won' });
  };

  const handleLose = () => {
    closeDeal.mutate({ dealId, status: 'lost' });
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;

    addActivity.mutate({
      dealId,
      data: {
        type: 'note',
        title: 'Nota adicionada',
        description: noteContent.trim(),
      },
    });

    setNoteContent('');
    setIsAddingNote(false);
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-semibold">{deal.name}</h2>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        {deal.company && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{deal.company.name}</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Valor</span>
          </div>
          <p className="text-lg font-semibold">{formatCurrency(deal.amount)}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <Target className="h-4 w-4" />
            <span className="text-xs">Probabilidade</span>
          </div>
          <p className="text-lg font-semibold">{deal.probability || 0}%</p>
        </div>

        <div className="p-3 rounded-lg bg-green-500/10">
          <div className="flex items-center gap-1 text-green-600 mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Receita Esperada</span>
          </div>
          <p className="text-lg font-semibold text-green-600">
            {formatCurrency(deal.expected_revenue)}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Previsão</span>
          </div>
          <p className="text-sm font-medium">
            {formatDate(deal.expected_close_date)}
          </p>
        </div>
      </div>

      {/* Stage */}
      {deal.stage && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Estágio Atual</h3>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: deal.stage.color }}
              />
              <span className="font-medium">{deal.stage.display_name}</span>
              {deal.pipeline && (
                <span className="text-sm text-muted-foreground">
                  ({deal.pipeline.display_name})
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {/* Contacts */}
      {deal.contacts && deal.contacts.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">
              Contatos ({deal.contacts.length})
            </h3>
            <div className="space-y-2">
              {deal.contacts.map((dc) => (
                <div key={dc.id} className="p-2 rounded-lg border bg-card">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {dc.contact.full_name || dc.contact.email}
                    </span>
                    {dc.is_primary && (
                      <Badge variant="secondary" className="text-xs">Principal</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {dc.contact.email}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tasks */}
      <Separator />
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-muted-foreground">Tarefas</h3>
        <TaskPanel dealId={dealId} />
      </div>

      {/* Notes */}
      <Separator />
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-muted-foreground">Adicionar Nota</h3>

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
                disabled={!noteContent.trim() || addActivity.isPending}
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
            <MessageSquare className="h-4 w-4 mr-2" />
            Adicionar nota...
          </Button>
        )}
      </div>

      {/* Timeline */}
      {deal.activities && deal.activities.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">
              Atividades Recentes
            </h3>
            <div className="space-y-2">
              {deal.activities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex gap-3 text-sm">
                  <div className="shrink-0 mt-0.5 text-muted-foreground">
                    {activityTypeIcons[activity.type] || <MessageSquare className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{activity.title}</p>
                    {activity.description && (
                      <p className="text-muted-foreground line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      {deal.status === 'open' && (
        <>
          <Separator />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLose}
              disabled={closeDeal.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Perdido
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleWin}
              disabled={closeDeal.isPending}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Ganho
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
