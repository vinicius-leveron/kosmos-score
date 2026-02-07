import { useState } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (email: string) => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Por favor, insira seu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido');
      return;
    }

    setError('');
    onStart(email.trim());
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
          <p className="text-kosmos-gray text-sm tracking-wide">
            Arquitetura de Comunidade
          </p>
        </div>

        {/* Main Content */}
        <div className="relative">
          {/* Card with blueprint styling */}
          <div className="card-structural p-8 md:p-12">
            {/* Accent bar on left */}
            <div className="absolute left-0 top-8 bottom-8 w-1 bg-kosmos-orange rounded-r" />

            {/* Headline */}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-kosmos-white text-center mb-4 leading-tight">
              Descubra quanto dinheiro está{' '}
              <span className="text-kosmos-orange">dormindo</span>{' '}
              na sua base
            </h1>

            {/* Subheadline */}
            <p className="text-kosmos-gray text-center text-base md:text-lg mb-8 max-w-md mx-auto leading-relaxed">
              A Auditoria de Lucro Oculto revela o potencial financeiro não capturado do seu negócio.
            </p>

            {/* Stats/Proof */}
            <div className="flex items-center justify-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-kosmos-orange" />
                <span className="text-kosmos-gray-light">3 minutos</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-kosmos-orange" />
                <span className="text-kosmos-gray-light">100% gratuito</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="h-14 text-base bg-kosmos-black border-border focus:border-kosmos-orange focus:ring-kosmos-orange/20 placeholder:text-kosmos-gray/50 text-kosmos-white"
                />
                {error && (
                  <p className="text-destructive text-sm mt-2">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base font-display font-semibold bg-kosmos-orange hover:bg-kosmos-orange-glow text-white transition-all duration-300 glow-orange-subtle hover:glow-orange"
              >
                Iniciar Auditoria Gratuita
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            {/* Trust Indicator */}
            <p className="text-kosmos-gray/60 text-xs text-center mt-6">
              Seus dados estão seguros. Não compartilhamos com terceiros.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-kosmos-gray/40 text-xs">
            <div className="w-4 h-px bg-kosmos-gray/20" />
            <span>© 2026 KOSMOS</span>
            <div className="w-4 h-px bg-kosmos-gray/20" />
          </div>
        </div>
      </div>

      {/* Structural Lines - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
    </div>
  );
}
