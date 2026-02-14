import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { TestPlanList } from '../test/TestPlanList';
import { ScoreComparison } from '../test/ScoreComparison';
import { useTests, useIdeas } from '../../hooks';

interface TestTabProps {
  projectId: string;
}

export function TestTab({ projectId }: TestTabProps) {
  const { data: tests } = useTests(projectId);
  const { data: ideas } = useIdeas(projectId);
  const selectedIdeas = ideas?.filter((i) => i.status === 'selected') || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Planos de Teste</CardTitle>
        </CardHeader>
        <CardContent>
          <TestPlanList projectId={projectId} tests={tests || []} ideas={selectedIdeas} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparacao de Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreComparison projectId={projectId} />
        </CardContent>
      </Card>
    </div>
  );
}
