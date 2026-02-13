import { AuditFlow } from '@/modules/kosmos-score/components/AuditFlow';
import { EmbedProvider } from '@/modules/kosmos-score/contexts/EmbedContext';

export function EmbedKosmosScore() {
  return (
    <EmbedProvider isEmbed={true}>
      <AuditFlow />
    </EmbedProvider>
  );
}
