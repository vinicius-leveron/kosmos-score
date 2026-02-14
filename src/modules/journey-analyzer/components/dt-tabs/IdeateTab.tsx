import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { IdeationBoard } from '../ideate/IdeationBoard';
import { ImpactEffortMatrix } from '../ideate/ImpactEffortMatrix';
import { useIdeas } from '../../hooks';

interface IdeateTabProps {
  projectId: string;
}

export function IdeateTab({ projectId }: IdeateTabProps) {
  const { data: ideas } = useIdeas(projectId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quadro de Ideias</CardTitle>
        </CardHeader>
        <CardContent>
          <IdeationBoard projectId={projectId} ideas={ideas || []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Matriz Impacto x Esforco</CardTitle>
        </CardHeader>
        <CardContent>
          <ImpactEffortMatrix ideas={ideas || []} />
        </CardContent>
      </Card>
    </div>
  );
}
