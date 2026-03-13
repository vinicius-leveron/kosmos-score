import { useState } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';

interface WelcomeScreenProps {
  onStart: (email: string, name: string, instagram: string) => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { isEmbed } = useEmbed();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Por favor, insira seu nome';
    }

    if (!email.trim()) {
      newErrors.email = 'Por favor, insira seu email';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Por favor, insira um email valido';
      }
    }

    if (!instagram.trim()) {
      newErrors.instagram = 'Por favor, insira seu Instagram';
    } else if (!instagram.trim().startsWith('@')) {
      newErrors.instagram = 'O Instagram deve comecar com @';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onStart(email.trim(), name.trim(), instagram.trim());
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div
      className={cn(
        'bg-kosmos-black blueprint-grid flex flex-col items-center justify-center px-4 relative overflow-hidden',
        isEmbed ? 'min-h-0 py-6' : 'min-h-screen py-12'
      )}
    >
      {/* Structural Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      {/* Corner Accents */}
      {!isEmbed && (
        <>
          <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-kosmos-orange/40" />
          <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-kosmos-orange/40" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-kosmos-orange/40" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-kosmos-orange/40" />
        </>
      )}

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
            Raio-X do Seu Negocio
          </p>
        </div>

        {/* Main Content */}
        <div className="relative">
          <div className="card-structural p-8 md:p-12">
            {/* Accent bar */}
            <div className="absolute left-0 top-8 bottom-8 w-1 bg-kosmos-orange rounded-r" />

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-kosmos-orange/10 border border-kosmos-orange/20 flex items-center justify-center">
                <Zap className="w-8 h-8 text-kosmos-orange" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-kosmos-white text-center mb-4 leading-tight">
              Descubra quanto sua base ja vale{' '}
              <span className="text-kosmos-orange">Raio-X</span>
            </h1>

            {/* Subheadline */}
            <p className="text-kosmos-gray text-center text-base md:text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Analise seu modelo de negocio em 5 minutos e receba um diagnostico
              personalizado com IA.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-kosmos-orange" />
                <span className="text-kosmos-gray-light">5 minutos</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-kosmos-orange" />
                <span className="text-kosmos-gray-light">13 perguntas</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError('name'); }}
                  className="h-12 text-base bg-kosmos-black border-border focus:border-kosmos-orange focus:ring-kosmos-orange/20 placeholder:text-kosmos-gray/50 text-kosmos-white"
                  aria-label="Nome"
                />
                {errors.name && (
                  <p className="text-destructive text-sm mt-2">{errors.name}</p>
                )}
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                  className="h-12 text-base bg-kosmos-black border-border focus:border-kosmos-orange focus:ring-kosmos-orange/20 placeholder:text-kosmos-gray/50 text-kosmos-white"
                  aria-label="Email"
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-2">{errors.email}</p>
                )}
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="@seu.instagram"
                  value={instagram}
                  onChange={(e) => { setInstagram(e.target.value); clearError('instagram'); }}
                  className="h-12 text-base bg-kosmos-black border-border focus:border-kosmos-orange focus:ring-kosmos-orange/20 placeholder:text-kosmos-gray/50 text-kosmos-white"
                  aria-label="Instagram"
                />
                {errors.instagram && (
                  <p className="text-destructive text-sm mt-2">{errors.instagram}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base font-display font-semibold bg-kosmos-orange hover:bg-kosmos-orange-glow glow-orange-subtle hover:glow-orange text-white transition-all duration-300"
              >
                Comecar Meu Raio-X
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            {/* Trust */}
            <p className="text-kosmos-gray/60 text-xs text-center mt-6">
              Seus dados estao seguros. Nao compartilhamos com terceiros.
            </p>
          </div>
        </div>

        {/* Footer */}
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

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
    </div>
  );
}
