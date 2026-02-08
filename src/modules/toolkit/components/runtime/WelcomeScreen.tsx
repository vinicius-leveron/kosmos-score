/**
 * WelcomeScreen - Initial screen of form runtime
 */

import { useState } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { ArrowRight } from 'lucide-react';
import type { FormWithRelations } from '../../types/form.types';
import { cn } from '@/design-system/lib/utils';

interface WelcomeScreenProps {
  /** Form configuration */
  form: FormWithRelations;
  /** Callback when user starts the form */
  onStart: (email?: string) => void;
  /** Whether the start action is loading */
  isLoading?: boolean;
}

/**
 * Welcome screen with optional email capture
 */
export function WelcomeScreen({
  form,
  onStart,
  isLoading = false,
}: WelcomeScreenProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const { welcome_screen } = form;
  const collectEmail = welcome_screen.collectEmail;
  const emailRequired = welcome_screen.emailRequired;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email if required
    if (collectEmail && emailRequired) {
      if (!email.trim()) {
        setError('Por favor, insira seu email');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Por favor, insira um email valido');
        return;
      }
    }

    setError('');
    onStart(collectEmail ? email.trim() : undefined);
  };

  return (
    <div className="min-h-screen bg-kosmos-black blueprint-grid flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Structural Lines - Top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      {/* Corner Accents */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-kosmos-orange/40" />
      <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-kosmos-orange/40" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-kosmos-orange/40" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-kosmos-orange/40" />

      <div className="w-full max-w-xl animate-fade-in relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-kosmos-orange" />
            <span className="text-kosmos-orange font-display font-semibold tracking-[0.3em] text-xs uppercase">
              KOSMOS
            </span>
            <div className="w-8 h-px bg-kosmos-orange" />
          </div>
          {form.name && (
            <p className="text-kosmos-gray text-sm tracking-wide">{form.name}</p>
          )}
        </div>

        {/* Main Content */}
        <div className="relative">
          <div className="card-structural p-8 md:p-12">
            {/* Accent bar on left */}
            <div className="absolute left-0 top-8 bottom-8 w-1 bg-kosmos-orange rounded-r" />

            {/* Headline */}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-kosmos-white text-center mb-4 leading-tight">
              {welcome_screen.title || form.name}
            </h1>

            {/* Description */}
            {welcome_screen.description && (
              <p className="text-kosmos-gray text-center text-base md:text-lg mb-8 max-w-md mx-auto leading-relaxed">
                {welcome_screen.description}
              </p>
            )}

            {/* Email Form or Start Button */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {collectEmail && (
                <div>
                  <Input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className={cn(
                      'h-14 text-base bg-kosmos-black border-border',
                      'focus:border-kosmos-orange focus:ring-kosmos-orange/20',
                      'placeholder:text-kosmos-gray/50 text-kosmos-white',
                      error && 'border-destructive'
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'email-error' : undefined}
                    required={emailRequired}
                  />
                  {error && (
                    <p id="email-error" className="text-destructive text-sm mt-2">
                      {error}
                    </p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className={cn(
                  'w-full h-14 text-base font-display font-semibold',
                  'bg-kosmos-orange hover:bg-kosmos-orange-glow text-white',
                  'transition-all duration-300 glow-orange-subtle hover:glow-orange'
                )}
              >
                {isLoading ? (
                  <span className="animate-pulse">Carregando...</span>
                ) : (
                  <>
                    {welcome_screen.buttonText || 'Comecar'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Privacy Note */}
            {collectEmail && (
              <p className="text-kosmos-gray/60 text-xs text-center mt-6">
                Seus dados estao seguros. Nao compartilhamos com terceiros.
              </p>
            )}
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

      {/* Structural Lines - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
    </div>
  );
}
