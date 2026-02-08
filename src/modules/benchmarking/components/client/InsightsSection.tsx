/**
 * InsightsSection - Display insights and action plan
 */

import { CheckCircle, Lightbulb, AlertTriangle, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import type { BenchmarkInsights } from '../../types';

interface InsightsSectionProps {
  insights: BenchmarkInsights;
}

function InsightList({
  title,
  items,
  icon,
  color,
  emptyMessage,
}: {
  title: string;
  items: string[] | undefined;
  icon: React.ReactNode;
  color: string;
  emptyMessage: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <Card className="bg-kosmos-gray-900 border-kosmos-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className={`text-base flex items-center gap-2 ${color}`}>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.replace('text-', 'bg-')}`} />
              <span className="text-sm text-kosmos-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ActionPlan({ actions }: { actions: BenchmarkInsights['plano_acao'] }) {
  if (!actions || actions.length === 0) return null;

  const getImpactBadge = (impacto: string) => {
    switch (impacto) {
      case 'alto':
        return <Badge className="bg-red-600/20 text-red-400 border-red-600/30">Alto Impacto</Badge>;
      case 'medio':
        return <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">Médio Impacto</Badge>;
      case 'baixo':
        return <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">Baixo Impacto</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-kosmos-gray-900 border-kosmos-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-kosmos-orange">
          <Target className="h-5 w-5" />
          Plano de Ação Recomendado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {actions.map((action, index) => (
            <li key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-kosmos-orange/20 text-kosmos-orange flex items-center justify-center font-bold text-sm">
                {action.prioridade}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-kosmos-white">{action.acao}</p>
                {getImpactBadge(action.impacto)}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InsightList
          title="Pontos Fortes"
          items={insights.pontos_fortes}
          icon={<CheckCircle className="h-5 w-5" />}
          color="text-green-400"
          emptyMessage="Nenhum ponto forte identificado"
        />

        <InsightList
          title="Oportunidades"
          items={insights.oportunidades}
          icon={<Lightbulb className="h-5 w-5" />}
          color="text-yellow-400"
          emptyMessage="Nenhuma oportunidade identificada"
        />

        <InsightList
          title="Riscos"
          items={insights.riscos}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="text-red-400"
          emptyMessage="Nenhum risco identificado"
        />
      </div>

      <ActionPlan actions={insights.plano_acao} />

      {/* Qualitative Analysis */}
      {insights.analise_qualitativa && (
        <Card className="bg-kosmos-gray-900 border-kosmos-gray-800">
          <CardHeader>
            <CardTitle>Análise Detalhada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-kosmos-gray-300 whitespace-pre-wrap leading-relaxed">
                {insights.analise_qualitativa}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
