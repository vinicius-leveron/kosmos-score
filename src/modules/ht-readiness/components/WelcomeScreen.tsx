import { useState } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { ArrowRight, Target } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';

interface WelcomeScreenProps {
  onStart: (email: string, name?: string) => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { isEmbed } = useEmbed();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Por favor, insira seu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email valido');
      return;
    }

    setError('');
    onStart(email.trim(), name.trim() || undefined);
  };

  return (
    <div className={cn(
      "bg-kosmos-black blueprint-grid flex flex-col items-center justify-center px-4 relative overflow-hidden",
      isEmbed ? "min-h-0 py-6" : "min-h-screen py-12"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      {!isEmbed && (
        <>
          <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-amber-500/40" />
          <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-amber-500/40" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-amber-500/40" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-amber-500/40" />
        </>
      )}

      <div className="w-full max-w-xl animate-fade-in relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-amber-500" />
            <span className="text-amber-500 font-display font-semibold tracking-[0.3em] text-xs uppercase">
              KOSMOS
            </span>
            <div className="w-8 h-px bg-amber-500" />
          </div>
          <p className="text-kosmos-gray text-sm tracking-wide">
            Diagnostico de Prontidao
          </p>
        </div>

        <div className="relative">
          <div className="card-structural p-8 md:p-12">
            <div className="absolute left-0 top-8 bottom-8 w-1 bg-amber-500 rounded-r" />

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Target className="w-8 h-8 text-amber-500" />
              </div>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-kosmos-white text-center mb-4 leading-tight">
              Voce esta{' '}
              <span className="text-amber-500">pronto</span>{' '}
              para High Ticket?
            </h1>

            <p className="text-kosmos-gray text-center text-base md:text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Descubra seu nivel de prontidao e receba um plano personalizado
              para lancar ou escalar sua oferta high ticket.
            </p>

            <div className="flex items-center justify-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-kosmos-gray-light">3 minutos</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-kosmos-gray-light">13 perguntas</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Seu nome (opcional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-base bg-kosmos-black border-border focus:border-amber-500 focus:ring-amber-500/20 placeholder:text-kosmos-gray/50 text-kosmos-white"
              />

              <div>
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="h-12 text-base bg-kosmos-black border-border focus:border-amber-500 focus:ring-amber-500/20 placeholder:text-kosmos-gray/50 text-kosmos-white"
                />
                {error && (
                  <p className="text-destructive text-sm mt-2">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base font-display font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-all duration-300"
              >
                Iniciar Diagnostico
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            <p className="text-kosmos-gray/60 text-xs text-center mt-6">
              Seus dados estao seguros. Nao compartilhamos com terceiros.
            </p>
          </div>
        </div>

        {!isEmbed && (
          <div className="text-center mt-12">
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
