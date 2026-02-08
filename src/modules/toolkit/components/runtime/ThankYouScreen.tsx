/**
 * ThankYouScreen - Completion screen for form runtime
 */

import { Button } from '@/design-system/primitives/button';
import { ArrowRight, Download, Share2 } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import type {
  FormWithRelations,
  FormSubmission,
  FormClassification,
} from '../../types/form.types';
import { ScoreDisplay, ClassificationBadge } from './ScoreDisplay';

interface ThankYouScreenProps {
  /** Form configuration */
  form: FormWithRelations;
  /** Completed submission */
  submission: FormSubmission;
  /** Classification result (if scoring enabled) */
  classification?: FormClassification | null;
  /** Callback for CTA button click */
  onCtaClick?: () => void;
  /** Callback for share button click */
  onShare?: () => void;
  /** Callback for download button click */
  onDownload?: () => void;
}

/**
 * Thank you screen with optional score display
 */
export function ThankYouScreen({
  form,
  submission,
  classification,
  onCtaClick,
  onShare,
  onDownload,
}: ThankYouScreenProps) {
  const { thank_you_screen, scoring_enabled, scoring_config } = form;
  const showScore = scoring_enabled && scoring_config.showScoreToRespondent && thank_you_screen.showScore;
  const showClassification = scoring_enabled && scoring_config.showClassificationToRespondent && thank_you_screen.showClassification;
  const score = submission.score || 0;

  return (
    <div className="min-h-screen bg-kosmos-black blueprint-grid flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Structural Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      {/* Corner Accents */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-kosmos-orange/40" />
      <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-kosmos-orange/40" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-kosmos-orange/40" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-kosmos-orange/40" />

      <div className="w-full max-w-xl animate-fade-in relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-kosmos-orange" />
            <span className="text-kosmos-orange font-display font-semibold tracking-[0.3em] text-xs uppercase">
              KOSMOS
            </span>
            <div className="w-8 h-px bg-kosmos-orange" />
          </div>
        </div>

        {/* Main Content */}
        <div className="card-structural p-8 md:p-12">
          <div className="absolute left-0 top-8 bottom-8 w-1 bg-kosmos-orange rounded-r" />

          {showScore && (
            <ScoreDisplay score={score} classification={classification} />
          )}

          {showClassification && classification && (
            <ClassificationBadge classification={classification} />
          )}

          <h1 className="font-display text-2xl md:text-3xl font-bold text-kosmos-white text-center mb-4 leading-tight">
            {thank_you_screen.title}
          </h1>

          <p className="text-kosmos-gray text-center text-base mb-8 max-w-md mx-auto leading-relaxed">
            {classification?.message || thank_you_screen.description}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {thank_you_screen.ctaButton && (
              <Button
                size="lg"
                onClick={onCtaClick}
                className={cn(
                  'w-full h-14 text-base font-display font-semibold',
                  'bg-kosmos-orange hover:bg-kosmos-orange-glow text-white',
                  'transition-all duration-300 glow-orange-subtle hover:glow-orange'
                )}
              >
                {thank_you_screen.ctaButton.text}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}

            <div className="flex gap-3">
              {onShare && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onShare}
                  className="flex-1 h-12 border-border text-kosmos-gray hover:text-kosmos-white hover:bg-kosmos-black-light"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              )}
              {onDownload && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onDownload}
                  className="flex-1 h-12 border-border text-kosmos-gray hover:text-kosmos-white hover:bg-kosmos-black-light"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-kosmos-gray/40 text-xs">
            <div className="w-4 h-px bg-kosmos-gray/20" />
            <span>Powered by KOSMOS</span>
            <div className="w-4 h-px bg-kosmos-gray/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
