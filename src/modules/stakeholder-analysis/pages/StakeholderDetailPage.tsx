/**
 * StakeholderDetailPage - Detail view for a single stakeholder
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Briefcase,
  Calendar,
  ExternalLink,
  Users,
  Activity,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/design-system/primitives/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/design-system/primitives/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/design-system/primitives/alert-dialog';
import { Skeleton } from '@/design-system/primitives/skeleton';

import {
  useStakeholderWithRelations,
  useStakeholderRelationships,
  useStakeholderInteractions,
  useDeleteStakeholder,
  useStakeholderScoreTrend,
  useRecalculateScore,
} from '../hooks/useStakeholders';
import { StakeholderForm } from '../components/StakeholderForm';
import { InteractionForm } from '../components/InteractionForm';
import { ScoreBreakdownCard } from '../components/ScoreBreakdownCard';
import type { ScoreTrend } from '../types/stakeholder.types';
import {
  STAKEHOLDER_TYPE_LABELS,
  STAKEHOLDER_TYPE_COLORS,
  STAKEHOLDER_STATUS_LABELS,
  STAKEHOLDER_STATUS_COLORS,
  RELATIONSHIP_TYPE_LABELS,
  INTERACTION_TYPE_LABELS,
} from '../types/stakeholder.types';

// ============================================================================
// HELPERS
// ============================================================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatCurrency(value: number | null): string {
  if (value === null) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
}

// ============================================================================
// LOADING STATE
// ============================================================================

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SCORE GAUGE
// ============================================================================

function ScoreGauge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 75) return 'text-green-500';
    if (s >= 50) return 'text-yellow-500';
    if (s >= 25) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col items-center">
      <div className={cn('text-4xl font-bold', getColor(score))}>{score.toFixed(0)}</div>
      <p className="text-xs text-muted-foreground">Score de Contribuicao</p>
    </div>
  );
}

// ============================================================================
// RELATIONSHIPS TAB
// ============================================================================

function RelationshipsTab({ stakeholderId }: { stakeholderId: string }) {
  const { data: relationships, isLoading } = useStakeholderRelationships(stakeholderId);

  if (isLoading) {
    return <Skeleton className="h-32" />;
  }

  if (!relationships?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Nenhum relacionamento cadastrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {relationships.map((rel) => (
        <Card key={rel.relationship_id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{getInitials(rel.related_stakeholder_name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{rel.related_stakeholder_name}</p>
                <p className="text-xs text-muted-foreground">
                  {STAKEHOLDER_TYPE_LABELS[rel.related_stakeholder_type]}
                </p>
              </div>
            </div>
            <Badge variant="outline">{RELATIONSHIP_TYPE_LABELS[rel.relationship_type]}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// INTERACTIONS TAB
// ============================================================================

function InteractionsTab({ stakeholderId }: { stakeholderId: string }) {
  const { data: interactions, isLoading } = useStakeholderInteractions(stakeholderId);

  if (isLoading) {
    return <Skeleton className="h-32" />;
  }

  if (!interactions?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Nenhuma interacao registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {interactions.map((int) => (
        <Card key={int.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{int.title}</p>
                <p className="text-sm text-muted-foreground">{int.description}</p>
              </div>
              <Badge variant="secondary">{INTERACTION_TYPE_LABELS[int.interaction_type]}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(int.occurred_at)}
              </span>
              {int.impact_score && (
                <span>Impacto: {'★'.repeat(int.impact_score)}</span>
              )}
              {int.created_by_name && <span>Por: {int.created_by_name}</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export function StakeholderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInteractionOpen, setIsInteractionOpen] = useState(false);

  const { data: stakeholder, isLoading } = useStakeholderWithRelations(id || '');
  const { data: scoreTrend } = useStakeholderScoreTrend(id || '');
  const deleteMutation = useDeleteStakeholder();
  const recalculateMutation = useRecalculateScore();

  // Get the latest trend from score history
  const latestTrend: ScoreTrend | undefined = scoreTrend?.[0]?.trend;

  const handleDelete = async () => {
    if (!stakeholder) return;

    try {
      await deleteMutation.mutateAsync({
        id: stakeholder.id,
        organizationId: stakeholder.organization_id,
      });
      toast.success('Stakeholder removido com sucesso');
      navigate('/admin/stakeholders');
    } catch {
      toast.error('Erro ao remover stakeholder');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/stakeholders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <LoadingState />
      </div>
    );
  }

  if (!stakeholder) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Stakeholder nao encontrado</p>
        <Button variant="link" onClick={() => navigate('/admin/stakeholders')}>
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/admin/stakeholders')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage src={stakeholder.avatar_url || undefined} alt={stakeholder.full_name} />
            <AvatarFallback className="text-xl">{getInitials(stakeholder.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{stakeholder.full_name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className={STAKEHOLDER_TYPE_COLORS[stakeholder.stakeholder_type]}>
                {STAKEHOLDER_TYPE_LABELS[stakeholder.stakeholder_type]}
              </Badge>
              <Badge className={STAKEHOLDER_STATUS_COLORS[stakeholder.status]}>
                {STAKEHOLDER_STATUS_LABELS[stakeholder.status]}
              </Badge>
              {stakeholder.linkedin_url && (
                <a
                  href={stakeholder.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-kosmos-orange"
                  aria-label="Ver perfil no LinkedIn"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setIsInteractionOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Interacao
          </Button>
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover stakeholder?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acao nao pode ser desfeita. Todos os dados deste stakeholder serao
                  permanentemente removidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Remover</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <ScoreGauge score={stakeholder.contribution_score} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {stakeholder.participation_pct?.toFixed(1) || '-'}%
            </p>
            <p className="text-xs text-muted-foreground">Participacao</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(stakeholder.investment_amount)}
            </p>
            <p className="text-xs text-muted-foreground">Investimento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {stakeholder.interactions_count || 0}
            </p>
            <p className="text-xs text-muted-foreground">Interacoes</p>
            {stakeholder.last_interaction_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Ultima: {formatDate(stakeholder.last_interaction_at)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Profile Info + Score Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informacoes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stakeholder.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{stakeholder.email}</span>
                </div>
              )}
              {stakeholder.sector && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{stakeholder.sector}</span>
                </div>
              )}
              {stakeholder.joined_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Desde {formatDate(stakeholder.joined_at)}</span>
                </div>
              )}
              {stakeholder.bio && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">{stakeholder.bio}</p>
                </div>
              )}
              {stakeholder.expertise.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Expertise</p>
                  <div className="flex flex-wrap gap-1">
                    {stakeholder.expertise.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <ScoreBreakdownCard
            score={stakeholder.contribution_score}
            breakdown={stakeholder.score_breakdown}
            trend={latestTrend}
            onRecalculate={() => recalculateMutation.mutate(stakeholder.id)}
            isRecalculating={recalculateMutation.isPending}
          />
        </div>

        {/* Right Column: Tabs */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="interactions">
            <TabsList>
              <TabsTrigger value="interactions">
                <Activity className="h-4 w-4 mr-2" />
                Interacoes ({stakeholder.interactions_count})
              </TabsTrigger>
              <TabsTrigger value="relationships">
                <Users className="h-4 w-4 mr-2" />
                Relacionamentos ({stakeholder.relationships_count})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="interactions" className="mt-4">
              <InteractionsTab stakeholderId={stakeholder.id} />
            </TabsContent>
            <TabsContent value="relationships" className="mt-4">
              <RelationshipsTab stakeholderId={stakeholder.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Stakeholder</DialogTitle>
          </DialogHeader>
          <StakeholderForm
            organizationId={stakeholder.organization_id}
            initialData={stakeholder}
            onSuccess={() => setIsEditOpen(false)}
            onCancel={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Interaction Form Dialog */}
      <Dialog open={isInteractionOpen} onOpenChange={setIsInteractionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Interacao</DialogTitle>
          </DialogHeader>
          <InteractionForm
            stakeholderId={stakeholder.id}
            organizationId={stakeholder.organization_id}
            onSuccess={() => setIsInteractionOpen(false)}
            onCancel={() => setIsInteractionOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
