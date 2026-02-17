import { useState } from 'react';
import { Loader2, Plus, Copy, Check, Trash2, Webhook, ExternalLink } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Badge } from '@/design-system/primitives/badge';
import { Switch } from '@/design-system/primitives/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/design-system/primitives/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/design-system/primitives/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useWebhooks, type CreateWebhookInput } from '../hooks/useWebhooks';

const SOURCE_OPTIONS = [
  { value: 'zapier', label: 'Zapier' },
  { value: 'typeform', label: 'Typeform' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'n8n', label: 'N8N' },
  { value: 'make', label: 'Make (Integromat)' },
  { value: 'custom', label: 'Personalizado' },
];

export function WebhooksPage() {
  const { toast } = useToast();
  const { webhooks, isLoading, createWebhook, updateWebhook, deleteWebhook, getWebhookUrl } = useWebhooks();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookSource, setNewWebhookSource] = useState('zapier');
  const [isCreating, setIsCreating] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateWebhook = async () => {
    if (!newWebhookName.trim()) {
      toast({ title: 'Digite um nome para o webhook', variant: 'destructive' });
      return;
    }

    setIsCreating(true);
    try {
      const defaultMapping: Record<string, string> = {
        email: 'email',
        full_name: 'name',
        phone: 'phone',
      };

      const result = await createWebhook({
        name: newWebhookName.trim(),
        source: newWebhookSource,
        field_mapping: defaultMapping,
      });

      setCreatedUrl(result.url);
      toast({ title: 'Webhook criado com sucesso!' });
    } catch (err) {
      toast({ title: 'Erro ao criar webhook', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    toast({ title: 'URL copiada!' });
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setNewWebhookName('');
    setNewWebhookSource('zapier');
    setCreatedUrl(null);
    setCopiedUrl(false);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateWebhook(id, { is_active: !isActive });
      toast({ title: `Webhook ${!isActive ? 'ativado' : 'desativado'}` });
    } catch (err) {
      toast({ title: 'Erro ao atualizar webhook', variant: 'destructive' });
    }
  };

  const handleDeleteWebhook = async () => {
    if (!webhookToDelete) return;

    setIsDeleting(true);
    try {
      await deleteWebhook(webhookToDelete);
      toast({ title: 'Webhook excluído com sucesso!' });
    } catch (err) {
      toast({ title: 'Erro ao excluir webhook', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setWebhookToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">
            Receba dados de sistemas externos automaticamente
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar novo Webhook</DialogTitle>
              <DialogDescription>
                Configure um endpoint para receber dados externos
              </DialogDescription>
            </DialogHeader>

            {createdUrl ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    Webhook criado com sucesso!
                  </p>
                  <p className="text-xs text-green-700">
                    Use a URL abaixo na sua integração.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>URL do Webhook</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={createdUrl}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleCopyUrl(createdUrl)}
                    >
                      {copiedUrl ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={handleCloseCreateDialog}>Fechar</Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Typeform Leads"
                    value={newWebhookName}
                    onChange={(e) => setNewWebhookName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Fonte</Label>
                  <Select value={newWebhookSource} onValueChange={setNewWebhookSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    O webhook vai mapear automaticamente os campos <code>email</code>,{' '}
                    <code>name</code> e <code>phone</code> dos dados recebidos.
                  </p>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseCreateDialog}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateWebhook} disabled={isCreating}>
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Criar Webhook
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum Webhook</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie um webhook para receber leads de formulários e integrações
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar primeiro Webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Seus Webhooks ({webhooks.length})</CardTitle>
            <CardDescription>
              Endpoints para receber dados de sistemas externos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Webhook className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{webhook.name}</span>
                        <Badge variant="outline">{webhook.source}</Badge>
                        <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                          {webhook.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {webhook.total_received} recebidos
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {webhook.total_processed} processados
                        </span>
                        {webhook.total_errors > 0 && (
                          <span className="text-xs text-destructive">
                            {webhook.total_errors} erros
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyUrl(getWebhookUrl(webhook))}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar URL
                    </Button>
                    <Switch
                      checked={webhook.is_active}
                      onCheckedChange={() => handleToggleActive(webhook.id, webhook.is_active)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setWebhookToDelete(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How to use */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar Webhooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Copie a URL do webhook</h4>
            <p className="text-sm text-muted-foreground">
              Cada webhook tem uma URL única. Copie e cole na configuração do seu sistema.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">2. Configure no sistema de origem</h4>
            <p className="text-sm text-muted-foreground">
              No Zapier, Typeform, ou outro sistema, configure para enviar dados via POST
              para a URL do webhook.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">3. Formato dos dados</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Envie um JSON com os campos do contato:
            </p>
            <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
              {`{
  "email": "lead@exemplo.com",
  "name": "Nome do Lead",
  "phone": "+5511999999999"
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!webhookToDelete} onOpenChange={() => setWebhookToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as integrações que enviam dados
              para este webhook deixarão de funcionar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWebhook}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
