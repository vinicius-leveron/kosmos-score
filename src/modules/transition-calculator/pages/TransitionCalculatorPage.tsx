import { CalculatorFlow } from '../components/CalculatorFlow';
import { EmbedProvider } from '../contexts/EmbedContext';

interface TransitionCalculatorPageProps {
  embed?: boolean;
}

export function TransitionCalculatorPage({ embed = false }: TransitionCalculatorPageProps) {
  return (
    <EmbedProvider isEmbed={embed}>
      <CalculatorFlow />
    </EmbedProvider>
  );
}
