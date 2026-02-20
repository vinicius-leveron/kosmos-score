import { TemplateFlow } from '../components/TemplateFlow';
import { EmbedProvider } from '../contexts/EmbedContext';

interface HTTemplatePageProps {
  embed?: boolean;
}

export function HTTemplatePage({ embed = false }: HTTemplatePageProps) {
  return (
    <EmbedProvider isEmbed={embed}>
      <TemplateFlow />
    </EmbedProvider>
  );
}
