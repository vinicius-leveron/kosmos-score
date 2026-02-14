import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useJourneyProject, useUpdateProject } from '../hooks';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/tabs';
import { OverviewTab } from './dt-tabs/OverviewTab';
import { EmpathizeTab } from './dt-tabs/EmpathizeTab';
import { DefineTab } from './dt-tabs/DefineTab';
import { IdeateTab } from './dt-tabs/IdeateTab';
import { PrototypeTab } from './dt-tabs/PrototypeTab';
import { TestTab } from './dt-tabs/TestTab';
import type { JourneyProjectWithStages, DTMode } from '../types';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const { data: project, isLoading } = useJourneyProject(projectId);
  const updateProject = useUpdateProject();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Projeto nao encontrado</p>
        <Button variant="link" onClick={onBack}>Voltar</Button>
      </div>
    );
  }

  const handleStatusChange = async (status: JourneyProjectWithStages['status']) => {
    await updateProject.mutateAsync({ id: project.id, status });
  };

  const getStatusLabel = (status: JourneyProjectWithStages['status']) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'in_progress': return 'Em andamento';
      case 'completed': return 'Concluido';
      default: return status;
    }
  };

  const dtMode = ((project as Record<string, unknown>).dt_mode as DTMode) || 'full';
  const isSimplified = dtMode === 'simplified';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Voltar">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">
              Cliente: {project.client_name}
              {project.client_email && ` (${project.client_email})`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSimplified && (
            <Badge variant="outline">Simplificado</Badge>
          )}
          <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
            {getStatusLabel(project.status)}
          </Badge>
          {project.status === 'draft' && (
            <Button variant="outline" size="sm" onClick={() => handleStatusChange('in_progress')}>
              Iniciar Analise
            </Button>
          )}
          {project.status === 'in_progress' && (
            <Button size="sm" onClick={() => handleStatusChange('completed')}>
              Concluir
            </Button>
          )}
        </div>
      </div>

      {/* DT Phase Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Visao Geral</TabsTrigger>
          {!isSimplified && <TabsTrigger value="empathize">Empatia</TabsTrigger>}
          <TabsTrigger value="define">{isSimplified ? 'Mapear' : 'Definir'}</TabsTrigger>
          <TabsTrigger value="ideate">Idear</TabsTrigger>
          {!isSimplified && <TabsTrigger value="prototype">Prototipar</TabsTrigger>}
          {!isSimplified && <TabsTrigger value="test">Testar</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab project={project} />
        </TabsContent>
        {!isSimplified && (
          <TabsContent value="empathize">
            <EmpathizeTab projectId={project.id} />
          </TabsContent>
        )}
        <TabsContent value="define">
          <DefineTab project={project} />
        </TabsContent>
        <TabsContent value="ideate">
          <IdeateTab projectId={project.id} />
        </TabsContent>
        {!isSimplified && (
          <TabsContent value="prototype">
            <PrototypeTab projectId={project.id} />
          </TabsContent>
        )}
        {!isSimplified && (
          <TabsContent value="test">
            <TestTab projectId={project.id} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
