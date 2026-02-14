import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useCreateProject } from '../hooks';
import { createProjectSchema } from '../schemas';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Textarea } from '@/design-system/primitives/textarea';
import { Label } from '@/design-system/primitives/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/primitives/dialog';
import { useToast } from '@/hooks/use-toast';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
}

export function CreateProjectDialog({ open, onOpenChange, organizationId }: CreateProjectDialogProps) {
  const createProject = useCreateProject();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_name: '',
    client_email: '',
    dt_mode: 'full' as 'full' | 'simplified',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = createProjectSchema.safeParse({
      ...formData,
      name: formData.name.trim(),
      client_name: formData.client_name.trim(),
      client_email: formData.client_email.trim() || undefined,
      description: formData.description.trim() || undefined,
    });
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || 'Dados invalidos';
      toast({ title: firstError, variant: 'destructive' });
      return;
    }

    try {
      await createProject.mutateAsync({
        organization_id: organizationId,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        client_name: formData.client_name.trim(),
        client_email: formData.client_email.trim() || null,
        dt_mode: formData.dt_mode,
      });

      toast({
        title: 'Projeto criado',
        description: 'A análise foi criada com as etapas padrão.',
      });

      setFormData({ name: '', description: '', client_name: '', client_email: '', dt_mode: 'full' });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao criar projeto',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Análise de Jornada</DialogTitle>
            <DialogDescription>
              Crie um projeto de análise para mapear a jornada do cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                placeholder="Ex: Análise Comunidade XYZ"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_name">Nome do Cliente *</Label>
              <Input
                id="client_name"
                placeholder="Ex: João Silva"
                value={formData.client_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, client_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_email">E-mail do Cliente</Label>
              <Input
                id="client_email"
                type="email"
                placeholder="cliente@email.com"
                value={formData.client_email}
                onChange={(e) => setFormData((prev) => ({ ...prev, client_email: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                O cliente poderá acessar os resultados via link
              </p>
            </div>

            <div className="space-y-2">
              <Label>Modo de Analise</Label>
              <div className="flex gap-3">
                <label className={`flex-1 cursor-pointer rounded-lg border-2 p-3 text-center transition-colors ${formData.dt_mode === 'full' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                  <input
                    type="radio"
                    name="dt_mode"
                    value="full"
                    checked={formData.dt_mode === 'full'}
                    onChange={() => setFormData((prev) => ({ ...prev, dt_mode: 'full' }))}
                    className="sr-only"
                  />
                  <p className="font-medium text-sm">Completa</p>
                  <p className="text-xs text-muted-foreground">5 fases do Design Thinking</p>
                </label>
                <label className={`flex-1 cursor-pointer rounded-lg border-2 p-3 text-center transition-colors ${formData.dt_mode === 'simplified' ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                  <input
                    type="radio"
                    name="dt_mode"
                    value="simplified"
                    checked={formData.dt_mode === 'simplified'}
                    onChange={() => setFormData((prev) => ({ ...prev, dt_mode: 'simplified' }))}
                    className="sr-only"
                  />
                  <p className="font-medium text-sm">Simplificada</p>
                  <p className="text-xs text-muted-foreground">Analise rapida e guiada</p>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                placeholder="Descreva o objetivo desta análise..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Projeto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
