import { useState } from 'react';
import { Plus, Loader2, MoreVertical, Trash2, ExternalLink, Sparkles } from 'lucide-react';
import { useJourneyProjects, useDeleteProject } from '../hooks';
import { Button } from '@/design-system/primitives/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/primitives/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/design-system/primitives/dropdown-menu';
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
import { Badge } from '@/design-system/primitives/badge';
import { CreateProjectDialog } from './CreateProjectDialog';
import { ScoreGauge } from './ScoreGauge';
import type { JourneyProject } from '../types';

interface ProjectListProps {
  organizationId: string;
  onSelectProject: (projectId: string) => void;
}

export function ProjectList({ organizationId, onSelectProject }: ProjectListProps) {
  const { data: projects, isLoading } = useJourneyProjects(organizationId);
  const deleteProject = useDeleteProject();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<JourneyProject | null>(null);

  const handleDelete = async () => {
    if (!projectToDelete) return;
    await deleteProject.mutateAsync(projectToDelete.id);
    setProjectToDelete(null);
  };

  const getStatusLabel = (status: JourneyProject['status']) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'in_progress':
        return 'Em andamento';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  const getStatusColor = (status: JourneyProject['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analisador de Jornadas</h1>
          <p className="text-muted-foreground">
            Analise a jornada de membros de comunidades
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Análise
        </Button>
      </div>

      {projects?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhuma análise criada ainda
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar primeira análise
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectProject(project.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription>{project.client_name}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(project.id);
                      }}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                    {(project as Record<string, unknown>).dt_mode === 'simplified' && (
                      <Badge variant="outline" className="text-xs">Simplificado</Badge>
                    )}
                  </div>
                  {project.overall_score !== null && (
                    <ScoreGauge score={project.overall_score} size="sm" />
                  )}
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        organizationId={organizationId}
      />

      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir análise?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{projectToDelete?.name}"? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
