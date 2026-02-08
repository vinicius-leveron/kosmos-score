/**
 * NavigationButtons - Back/Next navigation for form runtime
 */

import { Button } from '@/design-system/primitives/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';

interface NavigationButtonsProps {
  /** Whether can go back */
  canGoBack: boolean;
  /** Whether this is the last question */
  isLastQuestion: boolean;
  /** Whether the next button should be enabled */
  canProceed: boolean;
  /** Callback to go to previous question */
  onPrevious: () => void;
  /** Submit button text override */
  submitText?: string;
}

/**
 * Navigation buttons for form questions
 */
export function NavigationButtons({
  canGoBack,
  isLastQuestion,
  canProceed,
  onPrevious,
  submitText,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
      <Button
        type="button"
        variant="ghost"
        onClick={onPrevious}
        disabled={!canGoBack}
        className="text-kosmos-gray hover:text-kosmos-white hover:bg-kosmos-black-light"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Button
        type="submit"
        disabled={!canProceed}
        className={cn(
          'min-w-[140px] font-display',
          'bg-kosmos-orange hover:bg-kosmos-orange-glow text-white',
          'transition-all duration-300',
          canProceed && 'glow-orange-subtle'
        )}
      >
        {submitText || (isLastQuestion ? 'Ver Resultado' : 'Proxima')}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
