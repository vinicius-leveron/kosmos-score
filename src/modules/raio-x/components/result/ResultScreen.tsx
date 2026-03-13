import { Button } from '@/design-system/primitives/button';
import { Share2, Link2 } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../../contexts/EmbedContext';
import { ModelMapSection } from './ModelMapSection';
import { RevenueSection } from './RevenueSection';
import { OpportunitiesSection } from './OpportunitiesSection';
import { CTASection } from './CTASection';
import type { RaioXOutputs, RaioXScoreBreakdown } from '../../lib/types';
import { CLASSIFICATION_LABELS, CLASSIFICATION_COLORS } from '../../lib/scoring';

interface ResultScreenProps {
  outputs: RaioXOutputs;
  score: RaioXScoreBreakdown;
  respondentName: string;
  resultId: string;
}

export function ResultScreen({ outputs, score, respondentName, resultId }: ResultScreenProps) {
  const { isEmbed } = useEmbed();

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#/raio-x/${resultId}`;
    navigator.clipboard.writeText(url);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/#/raio-x/${resultId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Raio-X KOSMOS',
          text: `Meu diagnóstico de modelo de negócio: ${CLASSIFICATION_LABELS[score.classification]}`,
          url,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div
      className={cn(
        'bg-kosmos-black blueprint-grid px-4 relative',
        isEmbed ? 'min-h-0 py-4' : 'min-h-screen py-8 md:py-12'
      )}
    >
      <div className="w-full max-w-3xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-kosmos-orange" />
            <span className="text-kosmos-orange font-display font-semibold tracking-[0.3em] text-xs uppercase">
              RAIO-X KOSMOS
            </span>
            <div className="w-8 h-px bg-kosmos-orange" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-kosmos-white mb-3">
            {respondentName}, aqui está seu <span className="text-kosmos-orange">Raio-X</span>
          </h1>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
            style={{
              borderColor: `${CLASSIFICATION_COLORS[score.classification]}33`,
              backgroundColor: `${CLASSIFICATION_COLORS[score.classification]}0D`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: CLASSIFICATION_COLORS[score.classification] }}
            />
            <span
              className="text-sm font-display font-semibold"
              style={{ color: CLASSIFICATION_COLORS[score.classification] }}
            >
              Score: {score.total}/20 · {CLASSIFICATION_LABELS[score.classification]}
            </span>
          </div>
        </div>

        {/* Share bar */}
        <div className="flex items-center justify-end gap-2 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="text-kosmos-gray hover:text-kosmos-white"
            aria-label="Copiar link do resultado"
          >
            <Link2 className="w-4 h-4 mr-1" />
            Copiar link
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-kosmos-gray hover:text-kosmos-white"
            aria-label="Compartilhar resultado"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Compartilhar
          </Button>
        </div>

        {/* Section 1: Model Map */}
        <ModelMapSection data={outputs.prompt4_model} />

        {/* Section 2: Revenue Contrast */}
        <RevenueSection
          revenue={outputs.prompt1_opportunities}
          transformation={outputs.prompt2_transformation}
          narrative={outputs.prompt3_narrative}
        />

        {/* Section 3: Opportunities */}
        <OpportunitiesSection
          opportunities={outputs.prompt1_opportunities.oportunidades}
          total={outputs.prompt1_opportunities.total_oportunidades}
        />

        {/* Section 4: CTA */}
        <CTASection
          classification={score.classification}
          total={outputs.prompt1_opportunities.total_oportunidades}
        />

        {/* Footer */}
        {!isEmbed && (
          <div className="text-center mt-12 pb-4">
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
