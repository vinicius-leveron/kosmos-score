import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/core/auth';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { useToast } from '@/hooks/use-toast';

// Only allow redirects to internal platform paths
const ALLOWED_RETURN_PREFIXES = ['/admin', '/app', '/invite/'];

function getSafeReturnUrl(returnUrl: string | null): string | null {
  if (!returnUrl) return null;
  if (ALLOWED_RETURN_PREFIXES.some(prefix => returnUrl.startsWith(prefix))) {
    return returnUrl;
  }
  return null;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, isAuthenticated, isLoading: authLoading, canAccessAdmin } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated and done loading, redirect
  if (!authLoading && isAuthenticated) {
    const returnUrl = getSafeReturnUrl(searchParams.get('returnUrl'));
    if (returnUrl) {
      navigate(returnUrl, { replace: true });
    } else {
      navigate(canAccessAdmin() ? '/admin' : '/app', { replace: true });
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha email e senha.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    console.log('[Login] Attempting sign in for:', email);

    const { error } = await signIn(email, password);
    console.log('[Login] Sign in result:', error ? error.message : 'success');

    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: 'Email ou senha incorretos.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    // Redirect will happen automatically via auth state change
    const returnUrl = getSafeReturnUrl(searchParams.get('returnUrl'));
    navigate(returnUrl || (canAccessAdmin() ? '/admin' : '/app'), { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      {/* Background pattern - subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-[0.3em] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            K<span className="text-[#FF4500]">O</span>SMOS
          </h1>
          <div className="mt-3 h-px w-16 mx-auto bg-gradient-to-r from-transparent via-[#FF4500] to-transparent" />
        </div>

        {/* Login Card */}
        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white uppercase tracking-wider">
              Acesso à Plataforma
            </h2>
            <p className="text-[#666] text-sm mt-2">
              Entre com suas credenciais
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#999] text-xs uppercase tracking-wider">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
                className="bg-black border-[#333] text-white placeholder:text-[#444] focus:border-[#FF4500] focus:ring-[#FF4500]/20 h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#999] text-xs uppercase tracking-wider">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                autoComplete="current-password"
                className="bg-black border-[#333] text-white placeholder:text-[#444] focus:border-[#FF4500] focus:ring-[#FF4500]/20 h-12"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#FF4500] hover:bg-[#E03D00] text-white font-semibold uppercase tracking-wider transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[#444] text-xs mt-8 uppercase tracking-wider">
          Arquitetura de Comunidades
        </p>
      </div>

      {/* Decorative element - orange circle */}
      <div className="absolute bottom-8 left-8 w-2 h-2 rounded-full bg-[#FF4500] opacity-60" />
      <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-[#FF4500] opacity-40" />
    </div>
  );
}
