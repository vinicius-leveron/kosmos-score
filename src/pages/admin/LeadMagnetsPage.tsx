import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/design-system/primitives/card';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  Megaphone,
  Target,
  FileText,
  BarChart3,
  Users,
  Plus,
  ExternalLink,
  TrendingUp,
  Clock,
  Zap,
  Leaf,
  Award,
  FileCheck,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { EmbedCodeDialog } from '@/modules/kosmos-score/components/EmbedCodeDialog';
import { useLeadMagnetSummary } from '@/modules/kosmos-score/hooks/useLeadMagnetStats';

interface LeadMagnetConfig {
  id: 'kosmos_score' | 'application' | 'forms' | 'maturity_diagnostic' | 'ecosystem_calculator' | 'ht_readiness' | 'ht_template' | 'transition_calculator' | 'ecosystem_blueprint' | 'stop_launching';
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  href: string;
  analyticsHref: string;
  publicUrl?: string;
  status: 'active' | 'draft' | 'paused' | 'deprecated';
  deprecationNote?: string;
}

const leadMagnetsConfig: LeadMagnetConfig[] = [
  {
    id: 'kosmos_score',
    name: 'KOSMOS Score',
    description: 'Quiz de diagnóstico que calcula o potencial de monetização da comunidade do lead',
    icon: Target,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    href: '/admin/kosmos-score',
    analyticsHref: '/admin/lead-magnets/kosmos-score/analytics',
    publicUrl: '/quiz/kosmos-score',
    status: 'active',
  },
  {
    id: 'application',
    name: 'Aplicação KOSMOS',
    description: 'Formulário de aplicação para validar fit com potenciais clientes',
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    href: '/admin/toolkit/forms',
    analyticsHref: '/admin/lead-magnets/application/analytics',
    publicUrl: '/f/aplicacao-kosmos',
    status: 'active',
  },
  {
    id: 'forms',
    name: 'Formulários',
    description: 'Crie formulários personalizados para captura de leads com campos customizados',
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    href: '/admin/toolkit/forms',
    analyticsHref: '/admin/lead-magnets/forms/analytics',
    status: 'draft',
  },
  {
    id: 'maturity_diagnostic',
    name: 'Diagnóstico de Maturidade',
    description: 'Avalia o nível de maturidade do ecossistema em 5 níveis (Audiência → Legado)',
    icon: Layers,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    href: '/admin/lead-magnets/maturity-diagnostic',
    analyticsHref: '/admin/lead-magnets/maturity-diagnostic/analytics',
    publicUrl: '/quiz/maturity',
    status: 'active',
  },
  {
    id: 'ecosystem_calculator',
    name: 'Calculadora de Ecossistema',
    description: 'Mostra o potencial de faturamento com modelo de ecossistema vs. modelo atual',
    icon: Leaf,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    href: '/admin/lead-magnets/ecosystem-calculator',
    analyticsHref: '/admin/lead-magnets/ecosystem-calculator/analytics',
    publicUrl: '/quiz/maturity',
    status: 'deprecated',
    deprecationNote: 'Substituído pelo Diagnóstico de Maturidade',
  },
  {
    id: 'ht_readiness',
    name: 'Diagnóstico High Ticket',
    description: 'Avalia se o creator está pronto para ofertas high ticket e onde melhorar',
    icon: Award,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    href: '/admin/lead-magnets/ht-readiness',
    analyticsHref: '/admin/lead-magnets/ht-readiness/analytics',
    publicUrl: '/quiz/maturity',
    status: 'deprecated',
    deprecationNote: 'Substituído pelo Diagnóstico de Maturidade',
  },
  {
    id: 'ht_template',
    name: 'Blueprint de Ecossistema',
    description: 'Mapeie as 5 camadas do ecossistema: Raiz, Estrutura, Cultura, Crescimento e Autonomia',
    icon: Layers,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    href: '/admin/lead-magnets/ecosystem-blueprint',
    analyticsHref: '/admin/lead-magnets/ecosystem-blueprint/analytics',
    publicUrl: '/quiz/ht-template',
    status: 'active',
  },
  {
    id: 'transition_calculator',
    name: 'Simulador: E Se Parar de Lançar?',
    description: 'Compare seu modelo atual vs ecossistema: faturamento, horas, estresse e sustentabilidade',
    icon: RefreshCw,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    href: '/admin/lead-magnets/stop-launching',
    analyticsHref: '/admin/lead-magnets/stop-launching/analytics',
    publicUrl: '/quiz/transition-calculator',
    status: 'active',
  },
];

const statusConfig = {
  active: { label: 'Ativo', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
  draft: { label: 'Em breve', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  paused: { label: 'Pausado', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  deprecated: { label: 'Descontinuado', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

function StatsDisplay({ total, recent, avgScore, isLoading }: {
  total: number;
  recent: number;
  avgScore: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="p-2 rounded-lg bg-muted/50">
        <div className="text-lg font-semibold">{total}</div>
        <div className="text-xs text-muted-foreground">Total</div>
      </div>
      <div className="p-2 rounded-lg bg-muted/50">
        <div className="text-lg font-semibold flex items-center justify-center gap-1">
          {recent}
          {recent > 0 && <TrendingUp className="h-3 w-3 text-green-500" />}
        </div>
        <div className="text-xs text-muted-foreground">7 dias</div>
      </div>
      <div className="p-2 rounded-lg bg-muted/50">
        <div className="text-lg font-semibold">{avgScore}</div>
        <div className="text-xs text-muted-foreground">Score</div>
      </div>
    </div>
  );
}

export function LeadMagnetsPage() {
  const { data: summary, isLoading } = useLeadMagnetSummary();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Lead Magnets</h1>
            <p className="text-muted-foreground">
              Ferramentas de aquisição para capturar e qualificar leads
            </p>
          </div>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Novo Experimento
        </Button>
      </div>

      {/* Summary Stats */}
      {summary && summary.kosmos_score.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Users className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.kosmos_score.total}</div>
                <div className="text-sm text-muted-foreground">Total de Leads</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.kosmos_score.recent}</div>
                <div className="text-sm text-muted-foreground">Últimos 7 dias</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.kosmos_score.avgScore}</div>
                <div className="text-sm text-muted-foreground">Score Médio</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{leadMagnetsConfig.filter(lm => lm.status === 'active').length}</div>
                <div className="text-sm text-muted-foreground">Lead Magnets Ativos</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lead Magnets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leadMagnetsConfig.map((lm) => {
          const Icon = lm.icon;
          const status = statusConfig[lm.status];
          const stats = summary?.[lm.id];

          return (
            <Card key={lm.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${lm.bgColor} ${lm.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{lm.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {lm.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Live Stats */}
                {lm.status === 'active' && stats && (
                  <StatsDisplay
                    total={stats.total}
                    recent={stats.recent}
                    avgScore={stats.avgScore}
                    isLoading={isLoading}
                  />
                )}

                {/* Draft state placeholder */}
                {lm.status !== 'active' && (
                  <div className="p-4 rounded-lg bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">
                      Estatísticas disponíveis em breve
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {lm.status === 'active' ? (
                    <Button asChild className="flex-1">
                      <Link to={lm.analyticsHref}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Ver Analytics
                      </Link>
                    </Button>
                  ) : (
                    <Button className="flex-1" disabled>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Em breve
                    </Button>
                  )}
                  {lm.publicUrl && lm.status === 'active' && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={`#${lm.publicUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Abrir link publico">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {lm.publicUrl && lm.status === 'active' && (
                    <EmbedCodeDialog
                      quizUrl={`${window.location.origin}/#/embed${lm.publicUrl.replace('/quiz', '')}`}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add New Card */}
        <Card className="border-dashed hover:border-primary/50 transition-colors cursor-not-allowed opacity-60">
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px] text-center">
            <div className="p-3 rounded-full bg-muted mb-3">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">Criar Experimento</p>
            <p className="text-sm text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <h3 className="font-medium mb-2">O que são Lead Magnets?</h3>
          <p className="text-sm text-muted-foreground">
            Lead magnets são ferramentas de aquisição que oferecem valor gratuito em troca de informações de contato.
            Use-os para atrair leads qualificados, entender seu perfil e alimentar seu pipeline de vendas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
