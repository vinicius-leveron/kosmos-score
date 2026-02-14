import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { PersonaBuilder } from '../empathy/PersonaBuilder';
import { EmpathyMapCanvas } from '../empathy/EmpathyMapCanvas';
import { usePersonas, useEmpathyMaps } from '../../hooks';

interface EmpathizeTabProps {
  projectId: string;
}

export function EmpathizeTab({ projectId }: EmpathizeTabProps) {
  const { data: personas } = usePersonas(projectId);
  const { data: empathyMaps } = useEmpathyMaps(projectId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personas</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonaBuilder projectId={projectId} personas={personas || []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mapa de Empatia</CardTitle>
        </CardHeader>
        <CardContent>
          <EmpathyMapCanvas
            projectId={projectId}
            empathyMaps={empathyMaps || []}
            personas={personas || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
