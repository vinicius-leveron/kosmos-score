import { useParams } from 'react-router-dom';
import { Loader2, FileX, BarChart3, Map, Lightbulb, FlaskConical, ListChecks } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/tabs';
import { useJourneyProjectByToken } from '../hooks';
import { ClientAccessProvider, useClientContext } from '../contexts/ClientAccessContext';
import {
  ClientOverviewPanel,
  ClientJourneyPanel,
  ClientIdeasPanel,
  ClientExperimentsPanel,
  ClientActionPlanPanel,
} from '../components/client';

export function JourneyClientPage() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error } = useJourneyProjectByToken(token);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md px-4">
          <FileX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Projeto nao encontrado</h1>
          <p className="text-muted-foreground">
            O link de acesso e invalido ou o projeto nao esta mais disponivel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClientAccessProvider token={token} data={data}>
      <ClientPageContent />
    </ClientAccessProvider>
  );
}

function ClientPageContent() {
  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="overview">
          <TabsList className="w-full justify-start overflow-x-auto mb-6">
            <TabsTrigger value="overview" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Visao Geral</span>
            </TabsTrigger>
            <TabsTrigger value="journey" className="gap-1.5">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Jornada</span>
            </TabsTrigger>
            <TabsTrigger value="ideas" className="gap-1.5">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Ideias</span>
            </TabsTrigger>
            <TabsTrigger value="experiments" className="gap-1.5">
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">Experimentos</span>
            </TabsTrigger>
            <TabsTrigger value="action-plan" className="gap-1.5">
              <ListChecks className="h-4 w-4" />
              <span className="hidden sm:inline">Plano de Acao</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ClientOverviewPanel />
          </TabsContent>
          <TabsContent value="journey">
            <ClientJourneyPanel />
          </TabsContent>
          <TabsContent value="ideas">
            <ClientIdeasPanel />
          </TabsContent>
          <TabsContent value="experiments">
            <ClientExperimentsPanel />
          </TabsContent>
          <TabsContent value="action-plan">
            <ClientActionPlanPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ClientHeader() {
  const { data } = useClientContext();
  const { project } = data;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-sm text-muted-foreground">
              Analise de Jornada — {project.client_name}
            </p>
          </div>
          {project.overall_score !== null && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Score Geral</p>
              <p className="text-2xl font-bold">{Number(project.overall_score).toFixed(1)}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
