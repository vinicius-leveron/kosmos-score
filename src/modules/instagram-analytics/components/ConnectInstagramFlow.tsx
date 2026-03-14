import { useState, useCallback } from 'react';
import { Instagram, RefreshCw, Unlink } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/design-system/primitives/avatar';
import { Badge } from '@/design-system/primitives/badge';
import { useToast } from '@/hooks/use-toast';
import { useInstagramAccounts, useConnectInstagram, useDisconnectInstagram } from '../hooks';
import { useInstagramSync } from '../hooks/useInstagramSync';
import { SyncStatusBadge } from './SyncStatusBadge';

const META_APP_ID = import.meta.env.VITE_META_APP_ID || '';
const REDIRECT_URI = import.meta.env.VITE_META_REDIRECT_URI || window.location.origin;

export function ConnectInstagramFlow() {
  const { toast } = useToast();
  const { data: accounts, isLoading } = useInstagramAccounts();
  const connectMutation = useConnectInstagram();
  const disconnectMutation = useDisconnectInstagram();
  const syncMutation = useInstagramSync();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = useCallback(() => {
    const scopes = [
      'instagram_basic',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement',
      'ads_read',
      'business_management',
    ].join(',');

    const authUrl = `https://www.facebook.com/${import.meta.env.VITE_META_API_VERSION || 'v22.0'}/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scopes}&response_type=code`;

    const popup = window.open(authUrl, 'facebook-auth', 'width=600,height=700');

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type !== 'facebook-oauth-callback') return;
      window.removeEventListener('message', handleMessage);
      popup?.close();

      const { code } = event.data;
      if (!code) {
        toast({ title: 'Erro', description: 'Autorizacao cancelada', variant: 'destructive' });
        return;
      }

      setIsConnecting(true);
      try {
        await connectMutation.mutateAsync({ code, redirectUri: REDIRECT_URI });
        toast({ title: 'Conta conectada!', description: 'Sua conta Instagram foi conectada com sucesso.' });
      } catch (error) {
        toast({ title: 'Erro ao conectar', description: (error as Error).message, variant: 'destructive' });
      } finally {
        setIsConnecting(false);
      }
    };

    window.addEventListener('message', handleMessage);
  }, [connectMutation, toast]);

  const handleSync = useCallback(async (accountId: string) => {
    try {
      await syncMutation.mutateAsync(accountId);
      toast({ title: 'Sincronizacao iniciada', description: 'Os dados estao sendo atualizados.' });
    } catch (error) {
      toast({ title: 'Erro na sincronizacao', description: (error as Error).message, variant: 'destructive' });
    }
  }, [syncMutation, toast]);

  const handleDisconnect = useCallback(async (accountId: string) => {
    try {
      await disconnectMutation.mutateAsync(accountId);
      toast({ title: 'Conta desconectada' });
    } catch (error) {
      toast({ title: 'Erro ao desconectar', description: (error as Error).message, variant: 'destructive' });
    }
  }, [disconnectMutation, toast]);

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-kosmos-gray/10 rounded-lg" />;
  }

  if (!accounts || accounts.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-tr from-[#833AB4] via-[#E1306C] to-[#F77737] flex items-center justify-center mb-4">
            <Instagram className="h-6 w-6 text-white" />
          </div>
          <CardTitle>Conecte sua conta Instagram</CardTitle>
          <CardDescription>
            Vincule sua conta profissional do Instagram para acessar metricas organicas e pagas em um unico dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            onClick={handleConnect}
            disabled={isConnecting || !META_APP_ID}
            className="bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] hover:opacity-90"
          >
            <Instagram className="h-4 w-4 mr-2" />
            {isConnecting ? 'Conectando...' : 'Conectar Instagram'}
          </Button>
          {!META_APP_ID && (
            <p className="text-sm text-red-400 mt-2">META_APP_ID nao configurado. Configure VITE_META_APP_ID no .env</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {accounts.map(account => (
        <Card key={account.id} className="flex-1 min-w-[280px]">
          <CardContent className="flex items-center gap-3 p-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={account.ig_profile_picture_url || undefined} />
              <AvatarFallback>{account.ig_username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">@{account.ig_username}</p>
              <SyncStatusBadge status={account.sync_status} lastSync={account.last_sync_at} />
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSync(account.id)}
                disabled={syncMutation.isPending}
                aria-label="Sincronizar dados"
              >
                <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDisconnect(account.id)}
                disabled={disconnectMutation.isPending}
                aria-label="Desconectar conta"
              >
                <Unlink className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={handleConnect} disabled={isConnecting} className="self-center">
        <Instagram className="h-4 w-4 mr-2" />
        Adicionar conta
      </Button>
    </div>
  );
}
