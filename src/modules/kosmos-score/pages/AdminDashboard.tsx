import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/design-system/primitives/card';
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
  Calendar,
  Lightbulb,
  RefreshCw,
  List
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/design-system/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

type AuditResult = Tables<'audit_results'>;

// Score distribution ranges
const SCORE_RANGES = [
  { label: 'Crítico', min: 0, max: 25, color: 'bg-red-500', textColor: 'text-red-500' },
  { label: 'Baixo', min: 26, max: 50, color: 'bg-orange-500', textColor: 'text-orange-500' },
  { label: 'Médio', min: 51, max: 75, color: 'bg-yellow-500', textColor: 'text-yellow-500' },
  { label: 'Alto', min: 76, max: 100, color: 'bg-green-500', textColor: 'text-green-500' },
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

  // Computed analytics
  const analytics = useMemo(() => {
    if (results.length === 0) return null;

    const total = results.length;
    const beginners = results.filter(r => r.is_beginner).length;
    const experienced = total - beginners;

    // Average scores
    const avgScore = results.reduce((acc, r) => acc + r.kosmos_asset_score, 0) / total;
    const avgCausa = results.reduce((acc, r) => acc + r.score_causa, 0) / total;
    const avgCultura = results.reduce((acc, r) => acc + r.score_cultura, 0) / total;
    const avgEconomia = results.reduce((acc, r) => acc + r.score_economia, 0) / total;

    // Total hidden profit
    const totalLucroOculto = results.reduce((acc, r) => acc + r.lucro_oculto, 0);
    const avgLucroOculto = totalLucroOculto / total;

    // Score distribution
    const scoreDistribution = SCORE_RANGES.map(range => ({
      ...range,
      count: results.filter(r => r.kosmos_asset_score >= range.min && r.kosmos_asset_score <= range.max).length,
      percentage: (results.filter(r => r.kosmos_asset_score >= range.min && r.kosmos_asset_score <= range.max).length / total) * 100
    }));

    // Pillar distribution (which is the weakest)
    const weakestPillars = {
      causa: results.filter(r => r.score_causa <= r.score_cultura && r.score_causa <= r.score_economia).length,
      cultura: results.filter(r => r.score_cultura < r.score_causa && r.score_cultura <= r.score_economia).length,
      economia: results.filter(r => r.score_economia < r.score_causa && r.score_economia < r.score_cultura).length,
    };

    // Results by day (last 30 days)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentResults = results.filter(r => new Date(r.created_at) >= last30Days);

    const resultsByDay: Record<string, number> = {};
    recentResults.forEach(r => {
      const day = new Date(r.created_at).toLocaleDateString('pt-BR');
      resultsByDay[day] = (resultsByDay[day] || 0) + 1;
    });

    // Top base sizes
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
      resultsByDay,
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

  // Generate insights
  const insights = useMemo(() => {
    if (!analytics) return [];

    const list: { icon: string; text: string; type: 'info' | 'warning' | 'success' }[] = [];

    // Beginner insight
    if (analytics.beginnerPercentage > 50) {
      list.push({
        icon: '🌱',
        text: `${Math.round(analytics.beginnerPercentage)}% dos leads são iniciantes - oportunidade para produtos de entrada`,
        type: 'info'
      });
    }

    // Score insight
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

    // Weakest pillar insight
    const weakest = Object.entries(analytics.weakestPillars).sort((a, b) => b[1] - a[1])[0];
    const pillarNames = { causa: 'Causa', cultura: 'Cultura', economia: 'Economia' };
    list.push({
      icon: '📊',
      text: `Pilar mais fraco: ${pillarNames[weakest[0] as keyof typeof pillarNames]} (${Math.round((weakest[1] / analytics.total) * 100)}% dos leads)`,
      type: 'info'
    });

    // Hidden profit insight
    list.push({
      icon: '💰',
      text: `Lucro oculto médio de ${formatCurrency(analytics.avgLucroOculto)}/ano por lead`,
      type: 'success'
    });

    // Recent activity
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Nenhum resultado ainda</h1>
          <p className="text-muted-foreground mb-6">
            Quando os leads completarem a auditoria, os dados aparecerão aqui.
          </p>
          <Link to="/">
            <Button>Voltar ao KOSMOS Score</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard de Analytics</h1>
              <p className="text-muted-foreground text-sm">
                Visão geral dos resultados do KOSMOS Score
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={fetchResults}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
            <Link to="/admin/resultados">
              <Button variant="outline">
                <List className="h-4 w-4 mr-2" />
                Ver Lista
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total de Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.beginners} iniciantes, {analytics.experienced} experientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Score Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {Math.round(analytics.avgScore)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                de 100 pontos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Lucro Oculto Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(analytics.totalLucroOculto)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                potencial não capturado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Últimos 30 dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.recentCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                novos leads
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Insights Automáticos
            </CardTitle>
            <CardDescription>
              Análises baseadas nos dados coletados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-4 rounded-lg border",
                    insight.type === 'warning' && "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800",
                    insight.type === 'success' && "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
                    insight.type === 'info' && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                  )}
                >
                  <span className="text-lg mr-2">{insight.icon}</span>
                  <span className="text-sm">{insight.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="distribution" className="space-y-4">
          <TabsList>
            <TabsTrigger value="distribution" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Distribuição
            </TabsTrigger>
            <TabsTrigger value="pillars" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Pilares
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Perfil
            </TabsTrigger>
          </TabsList>

          {/* Score Distribution */}
          <TabsContent value="distribution">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Scores</CardTitle>
                <CardDescription>
                  Como os leads estão distribuídos por faixa de score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.scoreDistribution.map((range) => (
                    <div key={range.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded-full", range.color)} />
                          <span className="font-medium">{range.label}</span>
                          <span className="text-muted-foreground text-sm">
                            ({range.min}-{range.max})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{range.count}</span>
                          <span className="text-muted-foreground text-sm">
                            ({Math.round(range.percentage)}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-4 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", range.color)}
                          style={{ width: `${range.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pillars Analysis */}
          <TabsContent value="pillars">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Scores Médios por Pilar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Causa */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Causa (Identidade)</span>
                      <span className="font-bold text-primary">{Math.round(analytics.avgCausa)}/100</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${analytics.avgCausa}%` }}
                      />
                    </div>
                  </div>

                  {/* Cultura */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Cultura (Retenção)</span>
                      <span className="font-bold text-primary">{Math.round(analytics.avgCultura)}/100</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${analytics.avgCultura}%` }}
                      />
                    </div>
                  </div>

                  {/* Economia */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Economia (Lucro)</span>
                      <span className="font-bold text-primary">{Math.round(analytics.avgEconomia)}/100</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${analytics.avgEconomia}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pilar Mais Fraco</CardTitle>
                  <CardDescription>
                    Em qual pilar os leads têm mais dificuldade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.weakestPillars)
                      .sort((a, b) => b[1] - a[1])
                      .map(([pillar, count]) => {
                        const percentage = (count / analytics.total) * 100;
                        const names = { causa: 'Causa', cultura: 'Cultura', economia: 'Economia' };
                        const colors = { causa: 'bg-blue-500', cultura: 'bg-purple-500', economia: 'bg-green-500' };
                        return (
                          <div key={pillar} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{names[pillar as keyof typeof names]}</span>
                              <span className="text-muted-foreground">
                                {count} leads ({Math.round(percentage)}%)
                              </span>
                            </div>
                            <div className="h-3 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={cn("h-full rounded-full", colors[pillar as keyof typeof colors])}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Lead Profile */}
          <TabsContent value="profile">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tipo de Lead</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-8 py-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-500">{analytics.beginners}</div>
                      <div className="text-sm text-muted-foreground">Iniciantes</div>
                      <div className="text-xs text-muted-foreground">
                        ({Math.round(analytics.beginnerPercentage)}%)
                      </div>
                    </div>
                    <div className="h-16 w-px bg-border" />
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-500">{analytics.experienced}</div>
                      <div className="text-sm text-muted-foreground">Experientes</div>
                      <div className="text-xs text-muted-foreground">
                        ({Math.round(100 - analytics.beginnerPercentage)}%)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tamanho de Base Mais Comum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topBaseSizes.map(([size, count], i) => (
                      <div key={size} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={i === 0 ? 'default' : 'secondary'}>
                            #{i + 1}
                          </Badge>
                          <span className="text-sm">{size}</span>
                        </div>
                        <span className="font-medium">{count} leads</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Lucro Oculto</CardTitle>
                  <CardDescription>
                    Potencial financeiro não capturado pelos leads
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(analytics.totalLucroOculto)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(analytics.avgLucroOculto)}
                      </div>
                      <div className="text-sm text-muted-foreground">Média por Lead</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(Math.max(...results.map(r => r.lucro_oculto)))}
                      </div>
                      <div className="text-sm text-muted-foreground">Maior Potencial</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <p className="text-muted-foreground/40 text-xs text-center py-4">
          Dashboard atualizado em tempo real • KOSMOS Score Analytics
        </p>
      </div>
    </div>
  );
}
