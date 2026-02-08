import { Button } from '@/design-system/primitives/button';
import { Kanban, Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PipelineBoard } from '../components/pipeline/PipelineBoard';
import { usePipeline } from '../hooks/usePipeline';

export function PipelinePage() {
  const { data } = usePipeline();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Kanban className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Pipeline</h1>
                <p className="text-muted-foreground">
                  {data?.totalContacts ?? 0} contatos na jornada
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/crm/contacts">
                  <Users className="h-4 w-4 mr-2" />
                  Lista
                </Link>
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Contato
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <PipelineBoard />
    </div>
  );
}
