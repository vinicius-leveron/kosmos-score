/**
 * CompetitorDetailPage - Full dashboard for a single competitor
 */

import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useOrganization } from '@/core/auth/hooks';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/design-system/primitives/button';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { CompetitorOverview } from '../components/CompetitorOverview';
import { ChannelCard } from '../components/ChannelCard';
import { ProductsList } from '../components/ProductsList';
import { InsightsSection } from '../components/InsightsSection';
import { AnalysisProgressCard } from '../components/AnalysisProgressCard';
import { useCompetitorDetail, useRerunAnalysis } from '../hooks/useCompetitorAnalysis';
import type { CompetitorInsights } from '../lib/competitorTypes';

export function CompetitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isKosmosMaster } = useOrganization();
  const { data: competitor, isLoading, error } = useCompetitorDetail(id);
  const rerunAnalysis = useRerunAnalysis();

  const basePath = isKosmosMaster ? '/admin/competitors' : '/app/competitors';

  const handleRerun = async () => {
    if (!id) return;
    try {
      await rerunAnalysis.mutateAsync(id);
      toast({ title: 'Reanálise iniciada' });
    } catch {
      toast({ title: 'Erro ao iniciar reanálise', variant: 'destructive' });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !competitor) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(basePath)}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Voltar
        </Button>
        <div className="flex items-center gap-2 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
          <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
          <p className="text-sm text-destructive">
            {error ? 'Erro ao carregar concorrente' : 'Concorrente não encontrado'}
          </p>
        </div>
      </div>
    );
  }

  const isRunning = competitor.latest_run
    && competitor.latest_run.status !== 'completed'
    && competitor.latest_run.status !== 'failed';

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(basePath)}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Voltar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRerun}
          disabled={rerunAnalysis.isPending || !!isRunning}
        >
          {rerunAnalysis.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          Reanalisar
        </Button>
      </div>

      {/* Pipeline progress (if running) */}
      {competitor.latest_run && isRunning && (
        <AnalysisProgressCard run={competitor.latest_run} />
      )}

      {/* Overview card */}
      <CompetitorOverview competitor={competitor} />

      {/* Channels section */}
      <section aria-labelledby="channels-heading">
        <h3 id="channels-heading" className="text-lg font-semibold mb-4">
          Canais ({competitor.channels.length})
        </h3>
        {competitor.channels.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {competitor.channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            Nenhum canal descoberto ainda.
          </p>
        )}
      </section>

      {/* Products section */}
      <section aria-labelledby="products-heading">
        <h3 id="products-heading" className="text-lg font-semibold mb-4">
          Produtos ({competitor.products.length})
        </h3>
        <ProductsList products={competitor.products} />
      </section>

      {/* Insights section */}
      <section aria-labelledby="insights-heading">
        <h3 id="insights-heading" className="text-lg font-semibold mb-4">
          Análise estratégica
        </h3>
        <InsightsSection
          insights={(competitor.latest_run?.insights ?? {}) as CompetitorInsights}
        />
      </section>
    </div>
  );
}
