/**
 * CompetitorListPage - Lists all competitors with their analysis status
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Trash2,
  RefreshCw,
  Instagram,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/core/auth';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Badge } from '@/design-system/primitives/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/design-system/primitives/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/design-system/primitives/alert-dialog';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { CompetitorForm } from '../components/CompetitorForm';
import { AnalysisProgressCard } from '../components/AnalysisProgressCard';
import { useCompetitors, useDeleteCompetitor, useRerunAnalysis } from '../hooks/useCompetitorAnalysis';
import { PIPELINE_STATUS_CONFIG } from '../lib/channelConfig';
import type { CompetitorWithLatestRun } from '../lib/competitorTypes';

export function CompetitorListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isKosmosMaster } = useOrganization();
  const { data: competitors, isLoading, error } = useCompetitors();
  const deleteCompetitor = useDeleteCompetitor();
  const rerunAnalysis = useRerunAnalysis();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CompetitorWithLatestRun | null>(null);

  const basePath = isKosmosMaster ? '/admin/competitors' : '/app/competitors';

  const filtered = (competitors ?? []).filter((c) =>
    c.instagram_handle.toLowerCase().includes(search.toLowerCase())
    || c.display_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const hasCompetitors = (competitors ?? []).length > 0;
  const hasSearchResults = filtered.length > 0;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCompetitor.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast({ title: 'Concorrente removido' });
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
  };

  const handleRerun = async (competitorId: string) => {
    try {
      await rerunAnalysis.mutateAsync(competitorId);
      toast({ title: 'Reanálise iniciada' });
    } catch {
      toast({ title: 'Erro ao iniciar reanálise', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inteligência Competitiva</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analise concorrentes a partir do Instagram
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Analisar concorrente
        </Button>
      </div>

      {/* Search - only show when there are competitors */}
      {hasCompetitors && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Buscar por handle ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Buscar concorrentes"
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
          <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
          <p className="text-sm text-destructive">Erro ao carregar concorrentes</p>
        </div>
      )}

      {/* Empty state - no competitors at all */}
      {!isLoading && !error && !hasCompetitors && (
        <div className="text-center py-16">
          <Instagram className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" aria-hidden="true" />
          <h3 className="text-lg font-medium">Nenhum concorrente analisado</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Comece adicionando o Instagram de um concorrente
          </p>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Analisar concorrente
          </Button>
        </div>
      )}

      {/* Empty state - no search results */}
      {!isLoading && !error && hasCompetitors && !hasSearchResults && (
        <div className="text-center py-12">
          <Search className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Nenhum concorrente encontrado para &ldquo;{search}&rdquo;
          </p>
        </div>
      )}

      {/* Competitor cards */}
      {!isLoading && hasSearchResults && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((competitor) => (
            <CompetitorCard
              key={competitor.id}
              competitor={competitor}
              basePath={basePath}
              onView={() => navigate(`${basePath}/${competitor.id}`)}
              onRerun={() => handleRerun(competitor.id)}
              onDelete={() => setDeleteTarget(competitor)}
            />
          ))}
        </div>
      )}

      {/* Form dialog */}
      <CompetitorForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Delete confirmation - AlertDialog for destructive action */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover concorrente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover @{deleteTarget?.instagram_handle}?
              Todos os dados de análise serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCompetitor.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCompetitor.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCompetitor.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================================
// CompetitorCard (inline sub-component)
// ============================================================================

interface CompetitorCardProps {
  competitor: CompetitorWithLatestRun;
  basePath: string;
  onView: () => void;
  onRerun: () => void;
  onDelete: () => void;
}

function CompetitorCard({ competitor, onView, onRerun, onDelete }: CompetitorCardProps) {
  const run = competitor.latest_run;
  const statusConfig = run
    ? PIPELINE_STATUS_CONFIG[run.status] ?? PIPELINE_STATUS_CONFIG.pending
    : null;

  return (
    <div
      className="rounded-lg border bg-card p-4 space-y-3 hover:border-foreground/20 transition-colors cursor-pointer"
      onClick={onView}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView(); } }}
      role="button"
      tabIndex={0}
      aria-label={`Ver análise de ${competitor.display_name ?? `@${competitor.instagram_handle}`}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="font-medium truncate">
            {competitor.display_name ?? `@${competitor.instagram_handle}`}
          </h3>
          <p className="text-xs text-muted-foreground">
            @{competitor.instagram_handle}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Ações do concorrente"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRerun(); }}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reanalisar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status badge */}
      {statusConfig && (
        <Badge variant="outline" className={`text-xs ${statusConfig.color}`}>
          {statusConfig.label}
        </Badge>
      )}

      {/* Progress (if running) */}
      {run && run.status !== 'completed' && run.status !== 'failed' && (
        <div onClick={(e) => e.stopPropagation()}>
          <AnalysisProgressCard run={run} />
        </div>
      )}

      {/* Summary metrics (if completed) */}
      {run?.status === 'completed' && (
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{competitor.total_channels} canais</span>
          <span>{competitor.total_products} produtos</span>
        </div>
      )}
    </div>
  );
}
