import { EmbedProvider } from '../contexts/EmbedContext';
import { DiagnosticFlow } from '../components/DiagnosticFlow';

interface MaturityDiagnosticPageProps {
  embed?: boolean;
}

export function MaturityDiagnosticPage({
  embed = false,
}: MaturityDiagnosticPageProps) {
  return (
    <EmbedProvider isEmbed={embed}>
      <DiagnosticFlow />
    </EmbedProvider>
  );
}
