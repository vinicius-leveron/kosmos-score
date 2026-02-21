import { Button } from '@/design-system/primitives/button';
import {
  Share2,
  Calendar,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';
import { DiagnosticResult, getStatusColor, getStatusBgColor } from '../lib/scoring';
import { ShareableCard } from './ShareableCard';
import { MATURITY_LEVELS } from '../lib/maturityLevels';

interface ResultScreenProps {
  result: DiagnosticResult;
  onScheduleCall: () => void;
  onShare: () => void;
}

export function ResultScreen({
  result,
  onScheduleCall,
  onShare,
}: ResultScreenProps) {
  const { isEmbed } = useEmbed();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Diagnóstico de Maturidade - KOSMOS',
          text: result.shareText,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
        onShare();
      }
    } else {
      onShare();
    }
  };

  return (
    <div
      className={cn(
        'bg-kosmos-black blueprint-grid px-4 relative',
        isEmbed ? 'min-h-0 py-4' : 'min-h-screen py-8 md:py-12'
      )}
    >
      {/* Structural Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      {/* Corner Accents */}
      {!isEmbed && (
        <>
          <div className="absolute top-6 left-6 w-8 h-8 border-l border-t border-kosmos-orange/20 hidden md:block" />
          <div className="absolute top-6 right-6 w-8 h-8 border-r border-t border-kosmos-orange/20 hidden md:block" />
        </>
      )}

      <div className="w-full max-w-3xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-kosmos-orange" />
            <span className="text-kosmos-orange font-display font-semibold tracking-[0.3em] text-xs">
              KOSMOS
            </span>
            <div className="w-6 h-px bg-kosmos-orange" />
          </div>
          <p className="text-kosmos-gray text-sm">
            Resultado do seu Diagnóstico de Maturidade
          </p>
        </div>

        {/* Shareable Card */}
        <div className="animate-scale-in">
          <ShareableCard
            level={result.level}
            levelInfo={result.levelInfo}
            averageScore={result.averageScore}
            className="max-w-md mx-auto shadow-2xl"
          />
        </div>

        {/* Description */}
        <div className="card-structural p-6 animate-fade-in">
          <h3 className="text-kosmos-white font-display font-semibold text-lg mb-3">
            O que isso significa?
          </h3>
          <p className="text-kosmos-gray leading-relaxed">
            {result.levelInfo.description}
          </p>
        </div>

        {/* Pillar Breakdown */}
        <div className="card-structural p-6 animate-fade-in">
          <h3 className="text-kosmos-white font-display font-semibold text-lg mb-4">
            Análise por Dimensão
          </h3>
          <div className="space-y-3">
            {result.pillarScores.map((pillar) => (
              <div
                key={pillar.pillar}
                className="flex items-center justify-between p-3 rounded-lg bg-kosmos-black/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      getStatusBgColor(pillar.status)
                    )}
                  >
                    {pillar.status === 'critical' || pillar.status === 'weak' ? (
                      <TrendingDown
                        className={cn('w-4 h-4', getStatusColor(pillar.status))}
                      />
                    ) : (
                      <TrendingUp
                        className={cn('w-4 h-4', getStatusColor(pillar.status))}
                      />
                    )}
                  </div>
                  <span className="text-kosmos-white text-sm font-medium">
                    {pillar.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-500',
                        pillar.status === 'critical' && 'bg-red-500',
                        pillar.status === 'weak' && 'bg-orange-500',
                        pillar.status === 'moderate' && 'bg-yellow-500',
                        pillar.status === 'strong' && 'bg-emerald-500',
                        pillar.status === 'excellent' && 'bg-cyan-500'
                      )}
                      style={{ width: `${(pillar.score / 5) * 100}%` }}
                    />
                  </div>
                  <span
                    className={cn('text-sm font-medium w-8', getStatusColor(pillar.status))}
                  >
                    {pillar.score.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
          {/* Strengths */}
          {result.strengths.length > 0 && (
            <div className="card-structural p-6">
              <h3 className="text-emerald-400 font-display font-semibold text-base mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Seus Pontos Fortes
              </h3>
              <ul className="space-y-2">
                {result.strengths.map((s) => (
                  <li
                    key={s.pillar}
                    className="text-kosmos-gray text-sm flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {s.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {result.weaknesses.length > 0 && (
            <div className="card-structural p-6">
              <h3 className="text-orange-400 font-display font-semibold text-base mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Pontos de Atenção
              </h3>
              <ul className="space-y-2">
                {result.weaknesses.map((w) => (
                  <li
                    key={w.pillar}
                    className="text-kosmos-gray text-sm flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    {w.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* What's Missing */}
        <div className="card-structural p-6 animate-fade-in">
          <h3 className="text-kosmos-white font-display font-semibold text-lg mb-3">
            O que está faltando para o próximo nível?
          </h3>
          <ul className="space-y-3">
            {result.levelInfo.whatsMissing.slice(0, 4).map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-kosmos-gray"
              >
                <ChevronRight className="w-4 h-4 text-kosmos-orange flex-shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        {result.recommendations.length > 0 && (
          <div className="card-structural p-6 border-kosmos-orange/30 animate-fade-in">
            <h3 className="text-kosmos-orange font-display font-semibold text-lg mb-3">
              Recomendações Personalizadas
            </h3>
            <ul className="space-y-3">
              {result.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-kosmos-gray"
                >
                  <span className="text-kosmos-orange font-bold text-sm">
                    {index + 1}.
                  </span>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Level Preview */}
        {result.level < 5 && (
          <div className="card-structural p-6 bg-gradient-to-r from-kosmos-orange/5 to-transparent animate-fade-in">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                  MATURITY_LEVELS[(result.level + 1) as 1 | 2 | 3 | 4 | 5].bgColor
                )}
              >
                <span className="text-2xl">
                  {MATURITY_LEVELS[(result.level + 1) as 1 | 2 | 3 | 4 | 5].emoji}
                </span>
              </div>
              <div>
                <p className="text-kosmos-gray text-xs mb-1">Próximo Nível</p>
                <h4
                  className={cn(
                    'font-display font-bold text-lg mb-1',
                    MATURITY_LEVELS[(result.level + 1) as 1 | 2 | 3 | 4 | 5].color
                  )}
                >
                  Nível {result.level + 1} ·{' '}
                  {MATURITY_LEVELS[(result.level + 1) as 1 | 2 | 3 | 4 | 5].name}
                </h4>
                <p className="text-kosmos-gray text-sm">
                  {MATURITY_LEVELS[(result.level + 1) as 1 | 2 | 3 | 4 | 5].headline}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="space-y-3 animate-fade-in">
          <Button
            onClick={onScheduleCall}
            size="lg"
            className="w-full h-14 text-base font-display font-semibold bg-kosmos-orange hover:bg-kosmos-orange-glow glow-orange-subtle hover:glow-orange text-white transition-all duration-300"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Agendar Diagnóstico Profundo
          </Button>

          <Button
            onClick={handleShare}
            variant="outline"
            size="lg"
            className="w-full h-12 text-base border-border hover:border-kosmos-orange/50 text-kosmos-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar Resultado
          </Button>
        </div>

        {/* Footer */}
        {!isEmbed && (
          <div className="text-center pt-8">
            <div className="inline-flex items-center gap-2 text-kosmos-gray/40 text-xs">
              <div className="w-4 h-px bg-kosmos-gray/20" />
              <span>Powered by KOSMOS</span>
              <div className="w-4 h-px bg-kosmos-gray/20" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
