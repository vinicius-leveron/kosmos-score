import { useState } from 'react';
import { ProjectList, ProjectDetail } from '../components';
import { useOrganization } from '@/core/auth';

export function JourneyAnalyzerPage() {
  const { organizationId } = useOrganization();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (selectedProjectId) {
    return (
      <ProjectDetail
        projectId={selectedProjectId}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  return (
    <ProjectList
      organizationId={organizationId}
      onSelectProject={setSelectedProjectId}
    />
  );
}
