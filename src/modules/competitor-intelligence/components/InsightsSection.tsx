/**
 * InsightsSection - SWOT analysis and strategic recommendations from LLM
 */

import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { CompetitorInsights } from '../lib/competitorTypes';

interface InsightsSectionProps {
  insights: CompetitorInsights;
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  const hasContent = insights.resumo_executivo
    || (insights.pontos_fortes && insights.pontos_fortes.length > 0)
    || (insights.pontos_fracos && insights.pontos_fracos.length > 0);

  if (!hasContent) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
        <p className="text-sm">Insights não disponíveis</p>
        <p className="text-xs mt-1">A análise automática será gerada quando o pipeline estiver totalmente configurado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Executive summary */}
      {insights.resumo_executivo && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" aria-hidden="true" />
              Resumo Executivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insights.resumo_executivo}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Positioning */}
      {insights.posicionamento && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400" aria-hidden="true" />
              Posicionamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insights.posicionamento}
            </p>
          </CardContent>
        </Card>
      )}

      {/* SWOT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InsightList
          icon={<CheckCircle2 className="h-4 w-4 text-green-400" />}
          title="Pontos fortes"
          items={insights.pontos_fortes}
          emptyText="Nenhum ponto forte identificado"
        />
        <InsightList
          icon={<AlertTriangle className="h-4 w-4 text-red-400" />}
          title="Pontos fracos"
          items={insights.pontos_fracos}
          emptyText="Nenhum ponto fraco identificado"
        />
        <InsightList
          icon={<Lightbulb className="h-4 w-4 text-amber-400" />}
          title="Oportunidades"
          items={insights.oportunidades}
          emptyText="Nenhuma oportunidade identificada"
        />
        <InsightList
          icon={<TrendingDown className="h-4 w-4 text-orange-400" />}
          title="Ameaças"
          items={insights.ameacas}
          emptyText="Nenhuma ameaça identificada"
        />
      </div>

      {/* Recommendations */}
      {insights.recomendacoes && insights.recomendacoes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              Recomendações estratégicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {insights.recomendacoes.map((rec, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-foreground font-medium flex-shrink-0">{i + 1}.</span>
                  {rec}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InsightList({
  icon,
  title,
  items,
  emptyText,
}: {
  icon: React.ReactNode;
  title: string;
  items?: string[];
  emptyText: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <span aria-hidden="true">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items && items.length > 0 ? (
          <ul className="space-y-1.5">
            {items.map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                <span className="text-muted-foreground/50 mt-1" aria-hidden="true">-</span>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground/50">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  );
}
