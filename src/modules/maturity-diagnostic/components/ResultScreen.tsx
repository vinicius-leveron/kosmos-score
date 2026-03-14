import { Button } from '@/design-system/primitives/button';
import { Share2, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';
import {
  DiagnosticResult,
  generatePersonalizedNarrative,
  generateQuickInsights,
  getStatusColor,
} from '../lib/scoring';
import { ShareableCard } from './ShareableCard';
import { MaturityPyramid, MaturityJourney } from './MaturityPyramid';
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
  const narrative = generatePersonalizedNarrative(result);
  const insights = generateQuickInsights(result);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Diagnostico de Maturidade - KOSMOS',
          text: result.shareText,
          url: window.location.href,
        });
      } catch {
        onShare();
      }
    } else {
      onShare();
    }
  };

  const levelConfig = MATURITY_LEVELS[result.level];

  return (
    <div
      className={cn(
        'bg-kosmos-black blueprint-grid px-4 relative overflow-hidden',
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

      <div className="w-full max-w-3xl mx-auto space-y-8 relative z-10">
        {/* ============================================ */}
        {/* HERO SECTION - Nivel + Emoji + Headline */}
        {/* ============================================ */}
        <div className="text-center animate-fade-in">
          {/* KOSMOS Badge */}
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-6 h-px bg-kosmos-orange" />
            <span className="text-kosmos-orange font-display font-semibold tracking-[0.3em] text-xs">
              SEU RESULTADO
            </span>
            <div className="w-6 h-px bg-kosmos-orange" />
          </div>

          {/* Level Badge */}
          <div
            className={cn(
              'inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6',
              levelConfig.bgColor,
              'animate-scale-in'
            )}
          >
            <span className="text-5xl">{levelConfig.emoji}</span>
          </div>

          {/* Level Name */}
          <div className="mb-4">
            <span
              className={cn(
                'text-xs font-semibold tracking-[0.2em] uppercase',
                levelConfig.color
              )}
            >
              NIVEL {result.level}
            </span>
            <h1
              className={cn(
                'font-display text-3xl md:text-4xl font-bold mt-2',
                levelConfig.color
              )}
            >
              {levelConfig.name}
            </h1>
          </div>

          {/* Emotional Headline */}
          <h2 className="text-kosmos-white text-xl md:text-2xl font-medium max-w-xl mx-auto leading-relaxed">
            {narrative.headline}
          </h2>
        </div>

        {/* ============================================ */}
        {/* PIRAMIDE VISUAL - Onde voce esta */}
        {/* ============================================ */}
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="card-structural p-6 md:p-8">
            <h3 className="text-kosmos-white font-display font-semibold text-lg mb-6 text-center">
              Sua Posicao na Piramide de Maturidade
            </h3>
            <MaturityPyramid currentLevel={result.level} size="lg" animated />
          </div>
        </div>

        {/* ============================================ */}
        {/* NARRATIVA - Historia do nivel atual */}
        {/* ============================================ */}
        <div
          className="animate-fade-in"
          style={{ animationDelay: '400ms' }}
        >
          <div className="card-structural p-6 md:p-8 relative overflow-hidden">
            {/* Accent bar */}
            <div
              className={cn(
                'absolute left-0 top-0 bottom-0 w-1 rounded-r',
                result.level <= 2 && 'bg-orange-500',
                result.level === 3 && 'bg-yellow-500',
                result.level >= 4 && 'bg-emerald-500'
              )}
            />

            <div className="pl-4">
              <h3 className="text-kosmos-white font-display font-semibold text-lg mb-4">
                O Que Isso Significa
              </h3>

              {/* Story */}
              <p className="text-kosmos-gray-light text-base leading-relaxed mb-4">
                {narrative.story}
              </p>

              {/* Emotion/Context */}
              <p className="text-kosmos-gray text-sm leading-relaxed italic">
                {narrative.emotion}
              </p>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* QUICK INSIGHTS - Destaques rapidos */}
        {/* ============================================ */}
        <div
          className="animate-fade-in"
          style={{ animationDelay: '500ms' }}
        >
          <div className="grid gap-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="card-structural p-4 flex items-start gap-3"
              >
                <Sparkles className="w-5 h-5 text-kosmos-orange flex-shrink-0 mt-0.5" />
                <p className="text-kosmos-gray-light text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================ */}
        {/* GAP ANALYSIS - O que falta para evoluir */}
        {/* ============================================ */}
        {result.level < 5 && (
          <div
            className="animate-fade-in"
            style={{ animationDelay: '600ms' }}
          >
            <div className="card-structural p-6 md:p-8 border-kosmos-orange/30">
              <h3 className="text-kosmos-orange font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                O Que Falta Para o Proximo Nivel
              </h3>

              <p className="text-kosmos-gray-light text-base leading-relaxed mb-6">
                {narrative.gapAnalysis}
              </p>

              {/* Visual Journey */}
              <div className="bg-kosmos-black/50 rounded-lg p-4">
                <MaturityJourney
                  currentLevel={result.level}
                  showLabels
                  animated
                />
              </div>

              {/* Next Level Preview */}
              {result.level < 5 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                        MATURITY_LEVELS[(result.level + 1) as 1 | 2 | 3 | 4 | 5]
                          .bgColor
                      )}
                    >
                      <span className="text-2xl">
                        {
                          MATURITY_LEVELS[(result.level + 1) as 1 | 2 | 3 | 4 | 5]
                            .emoji
                        }
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-kosmos-gray text-xs mb-1">
                        Proximo Nivel
                      </p>
                      <h4
                        className={cn(
                          'font-display font-bold text-lg',
                          MATURITY_LEVELS[(result.level + 1) as 1 | 2 | 3 | 4 | 5]
                            .color
                        )}
                      >
                        {
                          MATURITY_LEVELS[(result.level + 1) as 1 | 2 | 3 | 4 | 5]
                            .name
                        }
                      </h4>
                      <p className="text-kosmos-gray text-sm">
                        {
                          MATURITY_LEVELS[(result.level + 1) as 1 | 2 | 3 | 4 | 5]
                            .headline
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* DIMENSOES - Breakdown visual compacto */}
        {/* ============================================ */}
        <div
          className="animate-fade-in"
          style={{ animationDelay: '700ms' }}
        >
          <div className="card-structural p-6">
            <h3 className="text-kosmos-white font-display font-semibold text-base mb-4">
              Suas Dimensoes
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {result.pillarScores.slice(0, 4).map((pillar) => (
                <div
                  key={pillar.pillar}
                  className="bg-kosmos-black/50 rounded-lg p-3 text-center"
                >
                  <div
                    className={cn(
                      'text-2xl font-bold mb-1',
                      getStatusColor(pillar.status)
                    )}
                  >
                    {pillar.score.toFixed(1)}
                  </div>
                  <div className="text-kosmos-gray text-xs truncate">
                    {pillar.label}
                  </div>
                </div>
              ))}
            </div>

            {result.pillarScores.length > 4 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {result.pillarScores.slice(4).map((pillar) => (
                  <div
                    key={pillar.pillar}
                    className="bg-kosmos-black/50 rounded-lg p-3 text-center"
                  >
                    <div
                      className={cn(
                        'text-2xl font-bold mb-1',
                        getStatusColor(pillar.status)
                      )}
                    >
                      {pillar.score.toFixed(1)}
                    </div>
                    <div className="text-kosmos-gray text-xs truncate">
                      {pillar.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* SHAREABLE CARD */}
        {/* ============================================ */}
        <div
          className="animate-fade-in"
          style={{ animationDelay: '800ms' }}
        >
          <p className="text-kosmos-gray text-sm text-center mb-4">
            Compartilhe seu resultado
          </p>
          <ShareableCard
            level={result.level}
            levelInfo={result.levelInfo}
            averageScore={result.averageScore}
            className="max-w-sm mx-auto"
          />
        </div>

        {/* ============================================ */}
        {/* CTAs */}
        {/* ============================================ */}
        <div
          className="space-y-3 animate-fade-in"
          style={{ animationDelay: '900ms' }}
        >
          <Button
            onClick={onScheduleCall}
            size="lg"
            className="w-full h-14 text-base font-display font-semibold bg-kosmos-orange hover:bg-kosmos-orange-glow glow-orange-subtle hover:glow-orange text-white transition-all duration-300"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Quero Evoluir Meu Ecossistema
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
