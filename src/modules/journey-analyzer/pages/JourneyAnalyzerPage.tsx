import { useState } from 'react';
import { ProjectList, ProjectDetail } from '../components';

// KOSMOS master org ID
const KOSMOS_ORG_ID = 'c0000000-0000-0000-0000-000000000001';

export function JourneyAnalyzerPage() {
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
      organizationId={KOSMOS_ORG_ID}
      onSelectProject={setSelectedProjectId}
    />
  );
}
