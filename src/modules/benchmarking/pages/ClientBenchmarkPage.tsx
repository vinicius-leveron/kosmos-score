/**
 * ClientBenchmarkPage - Dashboard for clients to view their benchmarks
 */

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Download, BarChart3, Heart, Users, Coins } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/tabs';
import { useBenchmark, useOrganizationBenchmarks } from '../hooks/useBenchmarks';
import { useAuth } from '@/core/auth/hooks';
import { PillarComparisonChart } from '../components/shared/PillarComparisonChart';
import { PercentileBar } from '../components/shared/PercentileBar';
import { ScoreComparisonCard } from '../components/client/ScoreComparisonCard';
import { FinancialMetricsCard } from '../components/client/FinancialMetricsCard';
import { InsightsSection } from '../components/client/InsightsSection';
import type { BenchmarkInsights, BenchmarkWithRelations } from '../types';

function BenchmarkDashboard({ benchmark }: { benchmark: BenchmarkWithRelations }) {
  const insights = (benchmark.insights as BenchmarkInsights) || {};

  const pillars = [
    {
      key: 'causa',
      label: 'Causa',
      color: 'text-blue-400',
      icon: <Heart className="h-5 w-5" />,
      score: benchmark.score_causa,
      marketAvg: benchmark.market_avg_causa,
      top10: benchmark.top10_causa,
      percentile: benchmark.percentile_causa,
    },
    {
      key: 'cultura',
      label: 'Cultura',
      color: 'text-purple-400',
      icon: <Users className="h-5 w-5" />,
      score: benchmark.score_cultura,
      marketAvg: benchmark.market_avg_cultura,
      top10: benchmark.top10_cultura,
      percentile: benchmark.percentile_cultura,
    },
    {
      key: 'economia',
      label: 'Economia',
      color: 'text-green-400',
      icon: <Coins className="h-5 w-5" />,
      score: benchmark.score_economia,
      marketAvg: benchmark.market_avg_economia,
      top10: benchmark.top10_economia,
      percentile: benchmark.percentile_economia,
    },
  ];

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="scores">Scores</TabsTrigger>
        <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        <TabsTrigger value="insights">Insights</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        {/* Score Total Card */}
        <Card className="bg-gradient-to-br from-kosmos-orange/20 to-kosmos-orange/5 border-kosmos-orange/30">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-lg text-kosmos-gray-300 mb-1">Score Total</h3>
                <div className="text-5xl font-bold text-kosmos-white">
                  {benchmark.score_total?.toFixed(1) || '-'}
                </div>
                {benchmark.percentile_total !== null && (
                  <p className="text-kosmos-orange mt-2">
                    Você está no top {100 - benchmark.percentile_total}% do mercado
                  </p>
                )}
              </div>
              <div className="flex-1 max-w-md w-full">
                <PercentileBar
                  percentile={benchmark.percentile_total}
                  label="Posição no Mercado"
                  color="bg-kosmos-orange"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="bg-kosmos-gray-900 border-kosmos-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-kosmos-orange" />
              Comparativo por Pilar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PillarComparisonChart benchmark={benchmark} />
          </CardContent>
        </Card>

        {/* Quick Highlights */}
        {(insights.pontos_fortes?.length || insights.oportunidades?.length) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.pontos_fortes && insights.pontos_fortes.length > 0 && (
              <Card className="bg-green-500/10 border-green-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-400 text-base">Destaque Positivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-kosmos-gray-300">{insights.pontos_fortes[0]}</p>
                </CardContent>
              </Card>
            )}
            {insights.oportunidades && insights.oportunidades.length > 0 && (
              <Card className="bg-yellow-500/10 border-yellow-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-yellow-400 text-base">Principal Oportunidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-kosmos-gray-300">{insights.oportunidades[0]}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </TabsContent>

      {/* Scores Tab */}
      <TabsContent value="scores" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pillars.map((pilar) => (
            <ScoreComparisonCard
              key={pilar.key}
              pilar={pilar.label}
              score={pilar.score}
              marketAvg={pilar.marketAvg}
              top10={pilar.top10}
              percentile={pilar.percentile}
              color={pilar.color}
              icon={pilar.icon}
            />
          ))}
        </div>

        {/* Percentile Bars */}
        <Card className="bg-kosmos-gray-900 border-kosmos-gray-800">
          <CardHeader>
            <CardTitle>Posição por Pilar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {pillars.map((pilar) => (
              <PercentileBar
                key={pilar.key}
                percentile={pilar.percentile}
                label={pilar.label}
                color={pilar.color.replace('text-', 'bg-')}
              />
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Financial Tab */}
      <TabsContent value="financeiro">
        <FinancialMetricsCard benchmark={benchmark} />
      </TabsContent>

      {/* Insights Tab */}
      <TabsContent value="insights">
        <InsightsSection insights={insights} />
      </TabsContent>
    </Tabs>
  );
}

export function ClientBenchmarkPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrg } = useAuth();

  // If ID provided, show single benchmark
  const { data: benchmark, isLoading: loadingBenchmark } = useBenchmark(id);

  // Otherwise show list of benchmarks for the org
  const { data: benchmarks, isLoading: loadingList } = useOrganizationBenchmarks(
    id ? undefined : currentOrg?.organization_id
  );

  const isLoading = id ? loadingBenchmark : loadingList;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-kosmos-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kosmos-orange" />
      </div>
    );
  }

  // Single benchmark view
  if (id && benchmark) {
    return (
      <div className="min-h-screen bg-kosmos-black">
        {/* Header */}
        <header className="border-b border-kosmos-gray-800 bg-kosmos-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/app/benchmark')}
                  aria-label="Voltar"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-kosmos-white">
                    {benchmark.title}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-kosmos-gray-400">
                    <Calendar className="h-4 w-4" />
                    {new Date(benchmark.analysis_date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-6xl mx-auto px-6 mx-auto px-4 py-8">
          <BenchmarkDashboard benchmark={benchmark} />
        </main>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-kosmos-black">
      <div className="max-w-6xl mx-auto px-6 mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-kosmos-white">Meus Benchmarks</h1>
          <p className="text-kosmos-gray-400 mt-1">
            Visualize suas análises de benchmark
          </p>
        </div>

        {benchmarks && benchmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benchmarks.map((b) => (
              <Card
                key={b.id}
                className="bg-kosmos-gray-900 border-kosmos-gray-800 hover:border-kosmos-orange/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/app/benchmark/${b.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{b.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-kosmos-gray-400">
                    <Calendar className="h-4 w-4" />
                    {new Date(b.analysis_date).toLocaleDateString('pt-BR')}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-kosmos-orange">
                        {b.score_total?.toFixed(1) || '-'}
                      </div>
                      <div className="text-xs text-kosmos-gray-500">Score Total</div>
                    </div>
                    {b.percentile_total !== null && (
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-400">
                          Top {100 - b.percentile_total}%
                        </div>
                        <div className="text-xs text-kosmos-gray-500">do mercado</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-kosmos-gray-900 border-kosmos-gray-800 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-kosmos-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-kosmos-white mb-2">
                Nenhum benchmark disponível
              </h3>
              <p className="text-kosmos-gray-400 text-center">
                Quando sua análise de benchmark estiver pronta, ela aparecerá aqui.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
