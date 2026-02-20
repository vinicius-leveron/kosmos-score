import { CalculatorFlow } from '../components/CalculatorFlow';
import { EmbedProvider } from '../contexts/EmbedContext';

interface EcosystemCalculatorPageProps {
  embed?: boolean;
}

export function EcosystemCalculatorPage({ embed = false }: EcosystemCalculatorPageProps) {
  return (
    <EmbedProvider isEmbed={embed}>
      <CalculatorFlow />
    </EmbedProvider>
  );
}
