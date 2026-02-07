import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen gradient-kosmos flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h2 className="text-primary font-semibold tracking-widest text-sm mb-2">
            KOSMOS
          </h2>
          <div className="w-16 h-0.5 bg-primary mx-auto" />
        </div>

        {/* Main Card */}
        <Card className="card-premium border-0 bg-card/50">
          <CardContent className="p-8 md:p-12">
            {/* Headline */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-center mb-4 leading-tight">
              Descubra quanto dinheiro está{' '}
              <span className="text-gradient-orange">dormindo</span>{' '}
              na sua base
            </h1>

            {/* Subheadline */}
            <p className="text-muted-foreground text-center text-lg mb-8 max-w-xl mx-auto">
              A Auditoria de Lucro Oculto revela o potencial financeiro não capturado do seu negócio e gera seu KOSMOS Asset Score personalizado.
            </p>

            {/* Time Indicator */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Tempo estimado: 3 minutos</span>
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
                  className="h-14 text-lg bg-secondary/50 border-border/50 focus:border-primary placeholder:text-muted-foreground/50"
                />
                {error && (
                  <p className="text-destructive text-sm mt-2">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg font-semibold glow-orange animate-pulse-glow"
              >
                Iniciar Auditoria
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            {/* Trust Indicator */}
            <p className="text-muted-foreground/60 text-xs text-center mt-6">
              Seus dados estão seguros. Não compartilhamos com terceiros.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-muted-foreground/40 text-xs text-center mt-8">
          © 2026 KOSMOS. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
