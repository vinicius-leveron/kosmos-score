import { useState } from 'react';
import { Plus, Trash2, Star } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Textarea } from '@/design-system/primitives/textarea';
import { Badge } from '@/design-system/primitives/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/primitives/select';
import { useCreateProblemStatement, useUpdateProblemStatement, useDeleteProblemStatement } from '../../hooks';
import { useToast } from '@/hooks/use-toast';
import type { JourneyProblemStatement, JourneyPersona } from '../../types';

interface ProblemStatementBuilderProps {
  projectId: string;
  problemStatements: JourneyProblemStatement[];
  personas: JourneyPersona[];
}

export function ProblemStatementBuilder({
  projectId,
  problemStatements,
  personas,
}: ProblemStatementBuilderProps) {
  const createStatement = useCreateProblemStatement();
  const updateStatement = useUpdateProblemStatement();
  const deleteStatement = useDeleteProblemStatement();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [statement, setStatement] = useState('');
  const [context, setContext] = useState('');
  const [personaId, setPersonaId] = useState<string>('');

  const handleCreate = async () => {
    if (!statement.trim()) return;
    try {
      await createStatement.mutateAsync({
        project_id: projectId,
        statement: statement.trim(),
        context: context.trim() || undefined,
        persona_id: personaId || undefined,
      });
      setStatement('');
      setContext('');
      setPersonaId('');
      setShowForm(false);
      toast({ title: 'HMW criado' });
    } catch {
      toast({ title: 'Erro ao criar HMW', variant: 'destructive' });
    }
  };

  const handleTogglePrimary = async (ps: JourneyProblemStatement) => {
    await updateStatement.mutateAsync({ id: ps.id, is_primary: !ps.is_primary });
  };

  const handleDelete = async (id: string) => {
    await deleteStatement.mutateAsync({ id, projectId });
  };

  return (
    <div className="space-y-3">
      {problemStatements.map((ps) => (
        <div key={ps.id} className="flex items-start gap-3 p-3 rounded-lg border">
          <button
            onClick={() => handleTogglePrimary(ps)}
            className={`mt-1 shrink-0 ${ps.is_primary ? 'text-yellow-500' : 'text-gray-300'}`}
            aria-label={ps.is_primary ? 'Remover destaque' : 'Marcar como principal'}
          >
            <Star className="h-4 w-4" fill={ps.is_primary ? 'currentColor' : 'none'} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{ps.statement}</p>
            {ps.context && (
              <p className="text-xs text-muted-foreground mt-1">{ps.context}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {ps.is_primary && <Badge className="text-xs">Principal</Badge>}
              {ps.persona_id && (
                <Badge variant="outline" className="text-xs">
                  {personas.find((p) => p.id === ps.persona_id)?.name || 'Persona'}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => handleDelete(ps.id)}
            aria-label="Excluir HMW"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {showForm ? (
        <div className="space-y-3 p-4 rounded-lg border border-dashed">
          {personas.length > 0 && (
            <Select value={personaId} onValueChange={setPersonaId}>
              <SelectTrigger>
                <SelectValue placeholder="Vincular a persona (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {personas.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input
            placeholder="How might we... (Como poderiamos...)"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
          />
          <Textarea
            placeholder="Contexto ou evidencia (opcional)"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={createStatement.isPending}>
              Criar
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo HMW
        </Button>
      )}
    </div>
  );
}
