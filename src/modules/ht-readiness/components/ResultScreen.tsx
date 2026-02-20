import { Button } from '@/design-system/primitives/button';
import {
  Trophy,
  ArrowRight,
  Share2,
  CheckCircle,
  AlertCircle,
  Crown,
  Package,
  Brain,
} from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';
import { DiagnosticResult, DiagnosticLevel } from '../lib/scoring';
import { CATEGORIES, DiagnosticCategory } from '../lib/questions';

interface ResultScreenProps {
  result: DiagnosticResult;
  onShare: () => void;
  onCTA: () => void;
}

const LEVEL_COLORS: Record<DiagnosticLevel, string> = {
  fundacao: 'text-red-500 bg-red-500/10 border-red-500/20',
  preparacao: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  pronto: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  avancado: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
};

const LEVEL_LABELS: Record<DiagnosticLevel, string> = {
  fundacao: 'Fundacao',
  preparacao: 'Preparacao',
  pronto: 'Pronto',
  avancado: 'Avancado',
};

const CATEGORY_ICONS: Record<DiagnosticCategory, React.ReactNode> = {
  autoridade: <Crown className="w-5 h-5" />,
  oferta: <Package className="w-5 h-5" />,
  entrega: <Trophy className="w-5 h-5" />,
  mindset: <Brain className="w-5 h-5" />,
};

export function ResultScreen({ result, onShare, onCTA }: ResultScreenProps) {
  const { isEmbed } = useEmbed();

  const levelColor = LEVEL_COLORS[result.level];
  const levelLabel = LEVEL_LABELS[result.level];

  return (
    <div className={cn(
      "bg-kosmos-black blueprint-grid flex flex-col items-center px-4 relative overflow-hidden",
      isEmbed ? "min-h-0 py-6" : "min-h-screen py-12"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="w-full max-w-2xl animate-fade-in relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 border rounded-full mb-4",
            levelColor
          )}>
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">Nivel: {levelLabel}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-kosmos-white mb-2">
            {result.levelLabel}
          </h1>
        </div>

        {/* Score Card */}
        <div className="card-structural p-8 mb-6">
          <div className="text-center mb-8">
            <p className="text-kosmos-gray text-sm uppercase tracking-wider mb-2">
              Seu Score de Prontidao
            </p>
            <div className="text-6xl font-display font-bold text-amber-500 mb-2">
              {result.totalScore}
              <span className="text-2xl text-kosmos-gray">/100</span>
            </div>
          </div>

          {/* Category Scores */}
          <div className="space-y-4">
            {result.categoryScores.map((cs) => {
              const categoryInfo = CATEGORIES.find((c) => c.id === cs.category);
              const levelClass =
                cs.level === 'critico'
                  ? 'bg-red-500'
                  : cs.level === 'atencao'
                  ? 'bg-yellow-500'
                  : cs.level === 'bom'
                  ? 'bg-blue-500'
                  : 'bg-emerald-500';

              return (
                <div key={cs.category}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">
                        {CATEGORY_ICONS[cs.category]}
                      </span>
                      <span className="text-kosmos-white text-sm">
                        {categoryInfo?.name}
                      </span>
                    </div>
                    <span className="text-kosmos-white font-medium">
                      {cs.percentage}%
                    </span>
                  </div>
                  <div className="h-3 bg-kosmos-black-light rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-1000", levelClass)}
                      style={{ width: `${cs.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {result.strengths.length > 0 && (
            <div className="card-structural p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <h3 className="font-medium text-kosmos-white">Pontos Fortes</h3>
              </div>
              <ul className="space-y-2">
                {result.strengths.map((strength, i) => (
                  <li key={i} className="text-sm text-kosmos-gray flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">+</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.weaknesses.length > 0 && (
            <div className="card-structural p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="font-medium text-kosmos-white">Pontos de Atencao</h3>
              </div>
              <ul className="space-y-2">
                {result.weaknesses.map((weakness, i) => (
                  <li key={i} className="text-sm text-kosmos-gray flex items-start gap-2">
                    <span className="text-amber-500 mt-1">!</span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="card-structural p-6 mb-6">
          <h3 className="font-display font-bold text-kosmos-white mb-4">
            Proximos Passos Recomendados
          </h3>
          <ol className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-sm font-medium">
                  {i + 1}
                </span>
                <span className="text-kosmos-gray-light text-sm leading-relaxed pt-0.5">
                  {rec}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={onCTA}
            size="lg"
            className="w-full h-14 text-base font-display font-semibold bg-amber-500 hover:bg-amber-600 text-white"
          >
            Quero Estruturar Meu High Ticket
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button
            onClick={onShare}
            variant="outline"
            size="lg"
            className="w-full h-12"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar Resultado
          </Button>
        </div>

        {!isEmbed && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 text-kosmos-gray/40 text-xs">
              <div className="w-4 h-px bg-kosmos-gray/20" />
              <span>Powered by KOSMOS</span>
              <div className="w-4 h-px bg-kosmos-gray/20" />
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
    </div>
  );
}
