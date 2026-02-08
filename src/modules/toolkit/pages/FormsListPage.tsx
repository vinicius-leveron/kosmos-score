/**
 * FormsListPage - List all forms in the toolkit
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, MoreVertical, Eye, Edit, Trash2, Copy, BarChart } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/design-system/primitives/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/primitives/dialog';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Textarea } from '@/design-system/primitives/textarea';
import { useForms, useCreateForm, useDeleteForm } from '../hooks/useForms';
import type { Form } from '../types/form.types';

const KOSMOS_ORG_ID = 'c0000000-0000-0000-0000-000000000001';

export function FormsListPage() {
  const navigate = useNavigate();
  const { data: forms, isLoading } = useForms(KOSMOS_ORG_ID);
  const createForm = useCreateForm();
  const deleteForm = useDeleteForm();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [newFormName, setNewFormName] = useState('');
  const [newFormDescription, setNewFormDescription] = useState('');

  const handleCreateForm = async () => {
    if (!newFormName.trim()) return;

    const slug = newFormName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      const form = await createForm.mutateAsync({
        name: newFormName,
        slug,
        description: newFormDescription || undefined,
        organization_id: KOSMOS_ORG_ID,
      });

      setIsCreateDialogOpen(false);
      setNewFormName('');
      setNewFormDescription('');
      navigate(`/toolkit/forms/${form.id}/edit`);
    } catch (error) {
      console.error('Error creating form:', error);
    }
  };

  const handleDeleteForm = async () => {
    if (!formToDelete) return;

    try {
      await deleteForm.mutateAsync({
        id: formToDelete.id,
        organizationId: formToDelete.organization_id,
      });
      setIsDeleteDialogOpen(false);
      setFormToDelete(null);
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  const getStatusBadge = (status: Form['status']) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-600">Publicado</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'archived':
        return <Badge variant="outline">Arquivado</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kosmos-orange" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-kosmos-white">Formulários</h1>
          <p className="text-kosmos-gray-400 mt-1">Crie e gerencie seus formulários</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Formulário
        </Button>
      </div>

      {forms && forms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <Card
              key={form.id}
              className="bg-kosmos-gray-900 border-kosmos-gray-800 hover:border-kosmos-orange/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/toolkit/forms/${form.id}/edit`)}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-kosmos-orange" />
                  <CardTitle className="text-lg font-medium">{form.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Menu">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/toolkit/forms/${form.id}/edit`); }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    {form.status === 'published' && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/f/${form.slug}`, '_blank'); }}>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/toolkit/forms/${form.id}/analytics`); }}>
                      <BarChart className="h-4 w-4 mr-2" />
                      Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormToDelete(form);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-kosmos-gray-400 mb-4 line-clamp-2">
                  {form.description || 'Sem descrição'}
                </p>
                <div className="flex items-center justify-between">
                  {getStatusBadge(form.status)}
                  <span className="text-xs text-kosmos-gray-500">
                    {new Date(form.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-kosmos-gray-900 border-kosmos-gray-800 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-kosmos-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-kosmos-white mb-2">Nenhum formulário ainda</h3>
            <p className="text-kosmos-gray-400 text-center mb-4">
              Crie seu primeiro formulário para começar a capturar leads
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Formulário
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Formulário</DialogTitle>
            <DialogDescription>Crie um novo formulário para capturar leads</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do formulário</Label>
              <Input
                id="name"
                placeholder="Ex: Quiz de Qualificação"
                value={newFormName}
                onChange={(e) => setNewFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva o objetivo deste formulário"
                value={newFormDescription}
                onChange={(e) => setNewFormDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateForm} disabled={!newFormName.trim() || createForm.isPending}>
              {createForm.isPending ? 'Criando...' : 'Criar Formulário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Formulário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o formulário "{formToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteForm} disabled={deleteForm.isPending}>
              {deleteForm.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
