/**
 * SchedulingScreen - Cal.com inline embed for scheduling
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { Button } from '@/design-system/primitives/button';
import { ArrowLeft } from 'lucide-react';
import type { FormWithRelations, FormSubmission } from '../../types/form.types';
import '../../types/cal.d.ts';

interface SchedulingScreenProps {
  /** Form configuration */
  form: FormWithRelations;
  /** Completed submission */
  submission: FormSubmission;
  /** Callback for back button */
  onBack?: () => void;
  /** Callback when booking is completed */
  onScheduled?: () => void;
}

/**
 * Scheduling screen with Cal.com embed
 */
export function SchedulingScreen({
  form,
  submission,
  onBack,
  onScheduled,
}: SchedulingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scheduling_screen = form?.scheduling_screen;
  const crm_config = form?.crm_config;

  // Build prefill params from submission
  const prefillParams = useMemo(() => {
    const params = new URLSearchParams();

    if (submission?.respondent_email) {
      params.set('email', submission.respondent_email);
    }

    // Try to extract name from answers (with defensive checks)
    if (
      crm_config?.nameFieldKey &&
      submission?.answers &&
      submission.answers[crm_config.nameFieldKey]
    ) {
      const nameValue = submission.answers[crm_config.nameFieldKey].value;
      if (typeof nameValue === 'string') {
        params.set('name', nameValue);
      }
    }

    return params.toString();
  }, [submission, crm_config]);

  // Initialize Cal.com embed
  useEffect(() => {
    if (!scheduling_screen?.calLink) {
      setError('Cal.com link not configured');
      setIsLoading(false);
      return;
    }

    const initCal = () => {
      if (typeof window.Cal === 'undefined') {
        setError('Failed to load scheduling widget');
        setIsLoading(false);
        return;
      }

      try {
        const calLink = scheduling_screen.eventType
          ? `${scheduling_screen.calLink}/${scheduling_screen.eventType}`
          : scheduling_screen.calLink;

        const fullCalLink = prefillParams ? `${calLink}?${prefillParams}` : calLink;

        window.Cal('init', { origin: 'https://app.cal.com' });
        window.Cal('inline', {
          elementOrSelector: '#kosmos-cal-embed',
          calLink: fullCalLink,
          layout: scheduling_screen.layout || 'month_view',
        });
        window.Cal('ui', {
          theme: scheduling_screen.theme === 'auto' ? 'dark' : scheduling_screen.theme,
          styles: { branding: { brandColor: scheduling_screen.brandColor || '#FF6B35' } },
          hideEventTypeDetails: scheduling_screen.hideEventTypeDetails || false,
          layout: scheduling_screen.layout || 'month_view',
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Cal.com:', err);
        setError('Failed to initialize scheduling widget');
        setIsLoading(false);
      }
    };

    // Load Cal.com script if not already loaded
    if (typeof window.Cal === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://app.cal.com/embed/embed.js';
      script.async = true;
      script.onload = initCal;
      script.onerror = () => {
        setError('Failed to load scheduling widget');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    } else {
      initCal();
    }

    // Listen for booking completion
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://app.cal.com') return;
      if (e.data?.type === 'booking-confirmed' || e.data?.type === 'booking_successful') {
        onScheduled?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [scheduling_screen, prefillParams, onScheduled]);

  return (
    <div className="min-h-screen bg-kosmos-black blueprint-grid flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label="Voltar aos resultados"
              className="text-kosmos-gray hover:text-kosmos-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-display font-bold text-kosmos-white">
              {scheduling_screen?.title || 'Agende uma conversa'}
            </h1>
            {scheduling_screen?.description && (
              <p className="text-kosmos-gray text-sm mt-1">
                {scheduling_screen.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cal.com Embed Container */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto h-full">
          {isLoading && (
            <div className="flex items-center justify-center h-96">
              <div className="animate-pulse text-kosmos-gray">
                Carregando calendario...
              </div>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  Voltar aos resultados
                </Button>
              )}
            </div>
          )}
          <div
            id="kosmos-cal-embed"
            ref={containerRef}
            className="w-full min-h-[600px] rounded-lg overflow-hidden"
            style={{ display: isLoading || error ? 'none' : 'block' }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <div className="inline-flex items-center gap-2 text-kosmos-gray/40 text-xs">
          <div className="w-4 h-px bg-kosmos-gray/20" />
          <span>Powered by KOSMOS</span>
          <div className="w-4 h-px bg-kosmos-gray/20" />
        </div>
      </div>
    </div>
  );
}
