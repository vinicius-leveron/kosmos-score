import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { SolutionsList } from '../prototype/SolutionsList';
import { ActionPlanBoard } from '../prototype/ActionPlanBoard';
import { useIdeas } from '../../hooks';

interface PrototypeTabProps {
  projectId: string;
}

export function PrototypeTab({ projectId }: PrototypeTabProps) {
  const { data: ideas } = useIdeas(projectId);
  const selectedIdeas = ideas?.filter((i) => i.status === 'selected') || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Solucoes Selecionadas</CardTitle>
        </CardHeader>
        <CardContent>
          <SolutionsList ideas={selectedIdeas} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plano de Acao</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionPlanBoard projectId={projectId} ideas={selectedIdeas} />
        </CardContent>
      </Card>
    </div>
  );
}
