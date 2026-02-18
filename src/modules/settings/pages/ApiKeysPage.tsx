import { useState } from 'react';
import { Loader2, Plus, Copy, Check, Trash2, Key, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Badge } from '@/design-system/primitives/badge';
import { Switch } from '@/design-system/primitives/switch';
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
import { useApiKeys, type CreateApiKeyInput } from '../hooks/useApiKeys';

export function ApiKeysPage() {
  const { toast } = useToast();
  const { apiKeys, isLoading, createApiKey, updateApiKey, deleteApiKey } = useApiKeys();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast({ title: 'Digite um nome para a API key', variant: 'destructive' });
      return;
    }

    setIsCreating(true);
    try {
      const result = await createApiKey({
        name: newKeyName.trim(),
        description: newKeyDescription.trim() || undefined,
      });

      if (result) {
        setCreatedKey(result.key);
        toast({ title: 'API Key criada com sucesso!' });
      }
    } catch (err) {
      toast({ title: 'Erro ao criar API key', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyKey = async () => {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
      toast({ title: 'API Key copiada!' });
    }
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setNewKeyName('');
    setNewKeyDescription('');
    setCreatedKey(null);
    setCopiedKey(false);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateApiKey(id, { is_active: !isActive });
      toast({ title: `API Key ${!isActive ? 'ativada' : 'desativada'}` });
    } catch (err) {
      toast({ title: 'Erro ao atualizar API key', variant: 'destructive' });
    }
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;

    setIsDeleting(true);
    try {
      await deleteApiKey(keyToDelete);
      toast({ title: 'API Key excluída com sucesso!' });
    } catch (err) {
      toast({ title: 'Erro ao excluir API key', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setKeyToDelete(null);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Gerencie as chaves de API para integrações externas
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar nova API Key</DialogTitle>
              <DialogDescription>
                Crie uma chave para integrar sistemas externos com o CRM
              </DialogDescription>
            </DialogHeader>

            {createdKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-2">
                    Guarde esta chave em um local seguro!
                  </p>
                  <p className="text-xs text-yellow-700">
                    Esta é a única vez que você verá a chave completa.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Sua API Key</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={createdKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button size="icon" variant="outline" onClick={handleCopyKey}>
                      {copiedKey ? (
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
                    placeholder="Ex: Zapier Integration"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Usado para sincronizar leads do Typeform"
                    value={newKeyDescription}
                    onChange={(e) => setNewKeyDescription(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseCreateDialog}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateKey} disabled={isCreating}>
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Criar API Key
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {apiKeys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma API Key</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie uma API Key para integrar sistemas externos com o CRM
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar primeira API Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Suas API Keys ({apiKeys.length})</CardTitle>
            <CardDescription>
              Use estas chaves para autenticar requisições à API do CRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Key className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{key.name}</span>
                        <Badge variant={key.is_active ? 'default' : 'secondary'}>
                          {key.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded">
                          {key.key_prefix}...
                        </code>
                        {key.last_used_at && (
                          <span className="text-xs text-muted-foreground">
                            Último uso: {new Date(key.last_used_at).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {key.usage_count} requisições
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Ativa</span>
                      <Switch
                        checked={key.is_active}
                        onCheckedChange={() => handleToggleActive(key.id, key.is_active)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setKeyToDelete(key.id)}
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

      {/* Documentation Card */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar a API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Autenticação</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Inclua sua API Key no header Authorization de todas as requisições:
            </p>
            <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
              {`curl -X GET "https://[supabase-url]/functions/v1/crm-api/v1/contacts" \\
  -H "Authorization: Bearer ks_live_sua_api_key"`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">Endpoints disponíveis</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><code className="bg-muted px-1">GET /v1/contacts</code> - Listar contatos</li>
              <li><code className="bg-muted px-1">POST /v1/contacts</code> - Criar contato</li>
              <li><code className="bg-muted px-1">GET /v1/companies</code> - Listar empresas</li>
              <li><code className="bg-muted px-1">POST /v1/companies</code> - Criar empresa</li>
              <li><code className="bg-muted px-1">GET /v1/deals</code> - Listar deals</li>
              <li><code className="bg-muted px-1">POST /v1/deals</code> - Criar deal</li>
              <li><code className="bg-muted px-1">GET /v1/tags</code> - Listar tags</li>
              <li><code className="bg-muted px-1">GET /v1/pipelines</code> - Listar pipelines</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as integrações que usam esta chave
              deixarão de funcionar imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteKey}
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
