import { useState, useEffect } from 'react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';

const MESSAGES = [
  'Analisando seu modelo de negócio...',
  'Mapeando oportunidades na sua base...',
  'Calculando receita potencial...',
  'Gerando seu Raio-X personalizado...',
];

const MESSAGE_INTERVAL = 3000;

export function ProcessingScreen() {
  const { isEmbed } = useEmbed();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, MESSAGE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        'bg-kosmos-black flex flex-col items-center justify-center px-4',
        isEmbed ? 'min-h-0 py-12' : 'min-h-screen'
      )}
    >
      <div className="w-full max-w-md text-center animate-fade-in">
        {/* Pulse animation */}
        <div className="relative mx-auto mb-10 w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-kosmos-orange/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-kosmos-orange/30 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-kosmos-orange/50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        </div>

        {/* Brand */}
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-6 h-px bg-kosmos-orange" />
          <span className="text-kosmos-orange font-display font-semibold tracking-[0.3em] text-xs uppercase">
            RAIO-X KOSMOS
          </span>
          <div className="w-6 h-px bg-kosmos-orange" />
        </div>

        {/* Rotating message */}
        <p
          key={messageIndex}
          className="text-kosmos-white font-display text-lg md:text-xl animate-fade-in"
        >
          {MESSAGES[messageIndex]}
        </p>

        <p className="text-kosmos-gray text-sm mt-4">
          Isso leva alguns segundos...
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {MESSAGES.map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-colors duration-300',
                i <= messageIndex ? 'bg-kosmos-orange' : 'bg-kosmos-gray/30'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
