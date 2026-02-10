import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth';
import { Button } from '@/design-system/primitives/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/design-system/primitives/card';
import { Alert, AlertDescription } from '@/design-system/primitives/alert';
import { Loader2, CheckCircle, XCircle, Building2, UserPlus } from 'lucide-react';
import { ROLE_LABELS } from '../types';

interface InvitationInfo {
  found: boolean;
  id?: string;
  email?: string;
  role?: string;
  status?: string;
  expires_at?: string;
  organization_name?: string;
  organization_slug?: string;
  invited_by_name?: string | null;
  is_valid?: boolean;
}

type PageState = 'loading' | 'invalid' | 'expired' | 'already_accepted' | 'valid' | 'accepting' | 'success' | 'error';

export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch invitation details
  useEffect(() => {
    async function fetchInvitation() {
      if (!token) {
        setPageState('invalid');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_invitation_by_token', {
          invitation_token: token,
        });

        if (error) throw error;

        const info = data as InvitationInfo;
        setInvitation(info);

        if (!info.found) {
          setPageState('invalid');
        } else if (info.status === 'accepted') {
          setPageState('already_accepted');
        } else if (info.status === 'expired' || !info.is_valid) {
          setPageState('expired');
        } else {
          setPageState('valid');
        }
      } catch (err) {
        console.error('Error fetching invitation:', err);
        setPageState('invalid');
      }
    }

    if (!authLoading) {
      fetchInvitation();
    }
  }, [token, authLoading]);

  // Accept invitation
  async function handleAccept() {
    if (!token) return;

    setPageState('accepting');
    setError(null);

    try {
      const { data, error } = await supabase.rpc('accept_invitation', {
        invitation_token: token,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };

      if (!result.success) {
        setError(result.error || 'Erro ao aceitar convite');
        setPageState('error');
        return;
      }

      setPageState('success');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Erro ao aceitar convite. Tente novamente.');
      setPageState('error');
    }
  }

  // Show loading while checking auth
  if (authLoading || pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando convite...</p>
        </div>
      </div>
    );
  }

  // Invalid invitation
  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Convite Inválido</CardTitle>
            <CardDescription>
              Este link de convite não existe ou já foi utilizado.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild variant="outline">
              <Link to="/">Voltar ao início</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Expired invitation
  if (pageState === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle>Convite Expirado</CardTitle>
            <CardDescription>
              Este convite expirou. Solicite um novo convite ao administrador.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild variant="outline">
              <Link to="/">Voltar ao início</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Already accepted
  if (pageState === 'already_accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Convite Já Aceito</CardTitle>
            <CardDescription>
              Este convite já foi aceito anteriormente.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link to="/admin">Ir para o Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Success state
  if (pageState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Convite Aceito!</CardTitle>
            <CardDescription>
              Você agora faz parte da equipe {invitation?.organization_name}.
              <br />
              Redirecionando...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Valid invitation - show details and accept button
  const roleLabel = invitation?.role ? ROLE_LABELS[invitation.role as keyof typeof ROLE_LABELS] : invitation?.role;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle>Convite para Equipe</CardTitle>
          <CardDescription>
            Você foi convidado para fazer parte de uma organização
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">{invitation?.organization_name}</p>
                <p className="text-sm text-muted-foreground">
                  Papel: {roleLabel}
                </p>
              </div>
            </div>

            {invitation?.invited_by_name && (
              <p className="text-sm text-muted-foreground">
                Convidado por: {invitation.invited_by_name}
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isAuthenticated && (
            <Alert>
              <AlertDescription>
                Você precisa estar logado para aceitar este convite.
                {invitation?.email && (
                  <span className="block mt-1">
                    Use o email: <strong>{invitation.email}</strong>
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {isAuthenticated ? (
            <Button
              className="w-full"
              onClick={handleAccept}
              disabled={pageState === 'accepting'}
            >
              {pageState === 'accepting' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aceitando...
                </>
              ) : (
                'Aceitar Convite'
              )}
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link to={`/login?returnUrl=${encodeURIComponent(`/invite/${token}`)}`}>
                Fazer Login para Aceitar
              </Link>
            </Button>
          )}

          <Button asChild variant="ghost" className="w-full">
            <Link to="/">Cancelar</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
