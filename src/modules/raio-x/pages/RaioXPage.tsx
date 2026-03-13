import { EmbedProvider } from '../contexts/EmbedContext';
import { RaioXFlow } from '../components/RaioXFlow';

interface RaioXPageProps {
  embed?: boolean;
}

export function RaioXPage({ embed = false }: RaioXPageProps) {
  return (
    <EmbedProvider isEmbed={embed}>
      <RaioXFlow />
    </EmbedProvider>
  );
}
