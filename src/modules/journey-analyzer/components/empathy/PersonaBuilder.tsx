import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { useToast } from '@/hooks/use-toast';
import { useDeletePersona } from '../../hooks';
import { PersonaCard } from './PersonaCard';
import { PersonaForm } from './PersonaForm';
import type { JourneyPersona } from '../../types';

interface PersonaBuilderProps {
  /** The project ID to associate personas with */
  projectId: string;
  /** List of existing personas for this project */
  personas: JourneyPersona[];
}

/**
 * PersonaBuilder - Manages the list of personas for a project.
 * Displays PersonaCards, handles creation/editing via PersonaForm dialog,
 * and deletion with toast feedback.
 */
export function PersonaBuilder({ projectId, personas }: PersonaBuilderProps) {
  const { toast } = useToast();
  const deletePersona = useDeletePersona();
  const [formOpen, setFormOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<JourneyPersona | undefined>();

  const handleEdit = (persona: JourneyPersona) => {
    setEditingPersona(persona);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePersona.mutateAsync({ id, projectId });
      toast({ title: 'Persona excluida', description: 'A persona foi removida do projeto.' });
    } catch {
      toast({ title: 'Erro', description: 'Nao foi possivel excluir a persona.', variant: 'destructive' });
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingPersona(undefined);
  };

  // Empty state
  if (personas.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Nenhuma persona criada</h3>
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">
            Crie personas para representar os membros da sua comunidade e entender suas necessidades.
          </p>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Persona
          </Button>
        </div>
        <PersonaForm open={formOpen} onOpenChange={handleFormClose} projectId={projectId} persona={editingPersona} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {personas.length} persona{personas.length !== 1 ? 's' : ''} criada{personas.length !== 1 ? 's' : ''}
          </p>
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Persona
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {personas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      <PersonaForm
        open={formOpen}
        onOpenChange={handleFormClose}
        projectId={projectId}
        persona={editingPersona}
      />
    </>
  );
}
