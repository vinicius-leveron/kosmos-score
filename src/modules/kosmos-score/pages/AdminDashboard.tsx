import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/tabs';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  BarChart3,
  PieChart,
  Lightbulb,
  RefreshCw,
  List,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/design-system/lib/utils';
import type { Tables } from '@/integrations/supabase/types';
import { useChartData } from '@/modules/kosmos-score/hooks/useChartData';
import {
  LeadTypePieChart,
  PillarRadarChart,
  ScoreDistributionBarChart,
  LeadsTimelineChart,
  BaseSizeRankingChart,
  AverageScoreGauge,
} from '@/modules/kosmos-score/components/charts';

type AuditResult = Tables<'audit_results'>;

const SCORE_RANGES = [
  { label: 'Crítico', min: 0, max: 25, color: 'bg-score-red', textColor: 'text-score-red' },
  { label: 'Baixo', min: 26, max: 50, color: 'bg-score-orange', textColor: 'text-score-orange' },
  { label: 'Médio', min: 51, max: 75, color: 'bg-score-yellow', textColor: 'text-score-yellow' },
  { label: 'Alto', min: 76, max: 100, color: 'bg-score-green', textColor: 'text-score-green' },
];

export function AdminDashboard() {
  const [results, setResults] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setResults(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const analytics = useMemo(() => {
    if (results.length === 0) return null;

    const total = results.length;
    const beginners = results.filter(r => r.is_beginner).length;
    const experienced = total - beginners;

    const avgScore = results.reduce((acc, r) => acc + r.kosmos_asset_score, 0) / total;
    const avgCausa = results.reduce((acc, r) => acc + r.score_causa, 0) / total;
    const avgCultura = results.reduce((acc, r) => acc + r.score_cultura, 0) / total;
    const avgEconomia = results.reduce((acc, r) => acc + r.score_economia, 0) / total;

    const totalLucroOculto = results.reduce((acc, r) => acc + r.lucro_oculto, 0);
    const avgLucroOculto = totalLucroOculto / total;

    const scoreDistribution = SCORE_RANGES.map(range => ({
      ...range,
      count: results.filter(r => r.kosmos_asset_score >= range.min && r.kosmos_asset_score <= range.max).length,
      percentage: (results.filter(r => r.kosmos_asset_score >= range.min && r.kosmos_asset_score <= range.max).length / total) * 100
    }));

    const weakestPillars = {
      causa: results.filter(r => r.score_causa <= r.score_cultura && r.score_causa <= r.score_economia).length,
      cultura: results.filter(r => r.score_cultura < r.score_causa && r.score_cultura <= r.score_economia).length,
      economia: results.filter(r => r.score_economia < r.score_causa && r.score_economia < r.score_cultura).length,
    };

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentResults = results.filter(r => new Date(r.created_at) >= last30Days);

    const baseSizes: Record<string, number> = {};
    results.forEach(r => {
      baseSizes[r.base_size] = (baseSizes[r.base_size] || 0) + 1;
    });
    const topBaseSizes = Object.entries(baseSizes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      total,
      beginners,
      experienced,
      beginnerPercentage: (beginners / total) * 100,
      avgScore,
      avgCausa,
      avgCultura,
      avgEconomia,
      totalLucroOculto,
      avgLucroOculto,
      scoreDistribution,
      weakestPillars,
      topBaseSizes,
      recentCount: recentResults.length,
    };
  }, [results]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Chart data hook
  const chartData = useChartData(results);

  const insights = useMemo(() => {
    if (!analytics) return [];

    const list: { icon: string; text: string; type: 'info' | 'warning' | 'success' }[] = [];

    if (analytics.beginnerPercentage > 50) {
      list.push({
        icon: '🌱',
        text: `${Math.round(analytics.beginnerPercentage)}% dos leads são iniciantes - oportunidade para produtos de entrada`,
        type: 'info'
      });
    }

    if (analytics.avgScore < 40) {
      list.push({
        icon: '⚠️',
        text: `Score médio baixo (${Math.round(analytics.avgScore)}) - leads precisam de muito suporte`,
        type: 'warning'
      });
    } else if (analytics.avgScore > 70) {
      list.push({
        icon: '🎯',
        text: `Score médio alto (${Math.round(analytics.avgScore)}) - leads qualificados para ofertas premium`,
        type: 'success'
      });
    }

    const weakest = Object.entries(analytics.weakestPillars).sort((a, b) => b[1] - a[1])[0];
    const pillarNames = { causa: 'Causa', cultura: 'Cultura', economia: 'Economia' };
    list.push({
      icon: '📊',
      text: `Pilar mais fraco: ${pillarNames[weakest[0] as keyof typeof pillarNames]} (${Math.round((weakest[1] / analytics.total) * 100)}% dos leads)`,
      type: 'info'
    });

    list.push({
      icon: '💰',
      text: `Lucro oculto médio de ${formatCurrency(analytics.avgLucroOculto)}/ano por lead`,
      type: 'success'
    });

    if (analytics.recentCount > 0) {
      list.push({
        icon: '📈',
        text: `${analytics.recentCount} leads nos últimos 30 dias`,
        type: 'info'
      });
    }

    return list;
  }, [analytics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-kosmos-black blueprint-grid flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-kosmos-orange" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-kosmos-black blueprint-grid p-8 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
        <div className="max-w-4xl mx-auto text-center pt-20">
          <h1 className="font-display text-2xl font-bold text-kosmos-white mb-4">Nenhum resultado ainda</h1>
          <p className="text-kosmos-gray mb-6">
            Quando os leads completarem a auditoria, os dados aparecerão aqui.
          </p>
          <Link to="/admin">
            <Button className="bg-kosmos-orange hover:bg-kosmos-orange-glow text-white font-display">
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kosmos-black blueprint-grid p-4 md:p-8 relative">
      {/* Structural Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="text-kosmos-gray hover:text-kosmos-white hover:bg-kosmos-black-light">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-px bg-kosmos-orange" />
                <span className="text-kosmos-orange font-display font-semibold tracking-[0.2em] text-xs">KOSMOS</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-kosmos-white">Dashboard de Analytics</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchResults}
              className="border-border hover:border-kosmos-orange/50 hover:bg-kosmos-black-light text-kosmos-gray"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
            <Link to="/admin/kosmos-score/results">
              <Button variant="outline" className="border-border hover:border-kosmos-orange/50 hover:bg-kosmos-black-light text-kosmos-gray-light font-display">
                <List className="h-4 w-4 mr-2" />
                Ver Lista
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-structural p-5">
            <div className="flex items-center gap-2 text-kosmos-gray text-xs font-display tracking-wider mb-3">
              <Users className="h-4 w-4 text-kosmos-orange" />
              TOTAL DE LEADS
            </div>
            <div className="font-display text-3xl font-bold text-kosmos-white">{analytics.total}</div>
            <p className="text-xs text-kosmos-gray mt-1">
              {analytics.beginners} iniciantes, {analytics.experienced} experientes
            </p>
          </div>

          <div className="card-structural p-5">
            <div className="flex items-center gap-2 text-kosmos-gray text-xs font-display tracking-wider mb-3">
              <Target className="h-4 w-4 text-kosmos-orange" />
              SCORE MÉDIO
            </div>
            <div className="font-display text-3xl font-bold text-kosmos-orange">
              {Math.round(analytics.avgScore)}
            </div>
            <p className="text-xs text-kosmos-gray mt-1">de 100 pontos</p>
          </div>

          <div className="card-structural p-5">
            <div className="flex items-center gap-2 text-kosmos-gray text-xs font-display tracking-wider mb-3">
              <DollarSign className="h-4 w-4 text-kosmos-orange" />
              LUCRO OCULTO
            </div>
            <div className="font-display text-2xl font-bold text-kosmos-orange">
              {formatCurrency(analytics.totalLucroOculto)}
            </div>
            <p className="text-xs text-kosmos-gray mt-1">potencial não capturado</p>
          </div>

          <div className="card-structural p-5">
            <div className="flex items-center gap-2 text-kosmos-gray text-xs font-display tracking-wider mb-3">
              <TrendingUp className="h-4 w-4 text-kosmos-orange" />
              ÚLTIMOS 30 DIAS
            </div>
            <div className="font-display text-3xl font-bold text-kosmos-white">{analytics.recentCount}</div>
            <p className="text-xs text-kosmos-gray mt-1">novos leads</p>
          </div>
        </div>

        {/* Insights */}
        <div className="card-structural p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
            <Lightbulb className="h-5 w-5 text-kosmos-orange" />
            <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider">INSIGHTS</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={cn(
                  "p-4 rounded-lg border",
                  insight.type === 'warning' && "bg-score-orange/10 border-score-orange/30",
                  insight.type === 'success' && "bg-score-green/10 border-score-green/30",
                  insight.type === 'info' && "bg-kosmos-black-light border-border"
                )}
              >
                <span className="text-lg mr-2">{insight.icon}</span>
                <span className="text-sm text-kosmos-gray-light">{insight.text}</span>
              </div>
            ))}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-kosmos-black-soft border border-border">
            <TabsTrigger value="overview" className="font-display text-xs data-[state=active]:bg-kosmos-orange data-[state=active]:text-white">
              <Activity className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="analytics" className="font-display text-xs data-[state=active]:bg-kosmos-orange data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Análises
            </TabsTrigger>
            <TabsTrigger value="leads" className="font-display text-xs data-[state=active]:bg-kosmos-orange data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Leads
            </TabsTrigger>
          </TabsList>

          {/* Overview - Main Charts */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <LeadTypePieChart data={chartData.leadTypeData} />
              <AverageScoreGauge score={chartData.averageScore} />
              <PillarRadarChart data={chartData.pillarAverages} />
            </div>
          </TabsContent>

          {/* Analytics - Distribution & Timeline */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ScoreDistributionBarChart data={chartData.scoreDistribution} />
              <LeadsTimelineChart data={chartData.timelineData} />
            </div>

            {/* Lucro Oculto Summary */}
            <div className="card-structural p-6 mt-4">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
                <DollarSign className="h-5 w-5 text-kosmos-orange" />
                <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider">LUCRO OCULTO</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-kosmos-black-light rounded-lg">
                  <div className="font-display text-2xl font-bold text-kosmos-orange">
                    {formatCurrency(analytics.totalLucroOculto)}
                  </div>
                  <div className="text-sm text-kosmos-gray">Total</div>
                </div>
                <div className="p-4 bg-kosmos-black-light rounded-lg">
                  <div className="font-display text-2xl font-bold text-kosmos-orange">
                    {formatCurrency(analytics.avgLucroOculto)}
                  </div>
                  <div className="text-sm text-kosmos-gray">Média por Lead</div>
                </div>
                <div className="p-4 bg-kosmos-black-light rounded-lg">
                  <div className="font-display text-2xl font-bold text-kosmos-orange">
                    {formatCurrency(Math.max(...results.map(r => r.lucro_oculto)))}
                  </div>
                  <div className="text-sm text-kosmos-gray">Maior Potencial</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Leads - Ranking & Profile */}
          <TabsContent value="leads">
            <BaseSizeRankingChart data={chartData.topBases} />

            {/* Tamanho de Base by Category */}
            <div className="card-structural p-6 mt-4">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
                <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider">DISTRIBUIÇÃO POR BASE</h3>
              </div>
              <div className="space-y-3">
                {analytics.topBaseSizes.map(([size, count], i) => (
                  <div key={size} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={i === 0 ? 'default' : 'secondary'} className={i === 0 ? 'bg-kosmos-orange text-white' : 'bg-kosmos-black-light text-kosmos-gray'}>
                        #{i + 1}
                      </Badge>
                      <span className="text-sm text-kosmos-gray-light">{size}</span>
                    </div>
                    <span className="font-display font-medium text-kosmos-white">{count} leads</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-kosmos-gray/40 text-xs">
            <div className="w-4 h-px bg-kosmos-gray/20" />
            <span>Dashboard atualizado em tempo real</span>
            <div className="w-4 h-px bg-kosmos-gray/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
