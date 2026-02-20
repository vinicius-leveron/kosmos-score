import { DiagnosticFlow } from '../components/DiagnosticFlow';
import { EmbedProvider } from '../contexts/EmbedContext';

interface HTReadinessPageProps {
  embed?: boolean;
}

export function HTReadinessPage({ embed = false }: HTReadinessPageProps) {
  return (
    <EmbedProvider isEmbed={embed}>
      <DiagnosticFlow />
    </EmbedProvider>
  );
}
