import { Button } from '@/design-system/primitives/button';
import { ArrowRight, Share2, Download, CheckCircle, Copy } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';
import { TemplateData, TEMPLATE_SECTIONS } from '../lib/sections';
import { generatePreview, calculateCompleteness } from '../lib/generatePreview';
import { useToast } from '@/hooks/use-toast';

interface ResultScreenProps {
  data: TemplateData;
  onShare: () => void;
  onCTA: () => void;
}

export function ResultScreen({ data, onShare, onCTA }: ResultScreenProps) {
  const { isEmbed } = useEmbed();
  const { toast } = useToast();

  const preview = generatePreview(data);
  const completeness = calculateCompleteness(data);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(preview).then(() => {
      toast({
        title: 'Copiado!',
        description: 'Seu template foi copiado para a area de transferencia.',
      });
    });
  };

  const handleDownload = () => {
    const blob = new Blob([preview], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'oferta-high-ticket.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download iniciado!',
      description: 'Seu template foi baixado como arquivo Markdown.',
    });
  };

  return (
    <div className={cn(
      "bg-kosmos-black blueprint-grid flex flex-col items-center px-4 relative overflow-hidden",
      isEmbed ? "min-h-0 py-6" : "min-h-screen py-8"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      <div className="w-full max-w-3xl animate-fade-in relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-kosmos-orange/10 border border-kosmos-orange/20 rounded-full mb-4">
            <CheckCircle className="w-4 h-4 text-kosmos-orange" />
            <span className="text-kosmos-orange text-sm font-medium">
              Template Completo
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-kosmos-white mb-2">
            Sua Oferta High Ticket
          </h1>
          <p className="text-kosmos-gray">
            {completeness}% completo - Revise e ajuste conforme necessario
          </p>
        </div>

        {/* Completeness by section */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {TEMPLATE_SECTIONS.map((section) => {
            const sectionData = data[section.id];
            const hasData = sectionData && Object.keys(sectionData).length > 0;
            return (
              <div
                key={section.id}
                className={cn(
                  "p-2 rounded-lg text-center text-xs",
                  hasData
                    ? "bg-kosmos-orange/10 border border-kosmos-orange/20 text-kosmos-orange"
                    : "bg-kosmos-black-light text-kosmos-gray"
                )}
              >
                {section.name.split(' ')[0]}
                {hasData && <CheckCircle className="w-3 h-3 mx-auto mt-1" />}
              </div>
            );
          })}
        </div>

        {/* Preview Card */}
        <div className="card-structural p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-kosmos-white">Preview da Oferta</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyToClipboard}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copiar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-1" />
                Baixar
              </Button>
            </div>
          </div>

          <div className="bg-kosmos-black rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-kosmos-gray-light text-sm whitespace-pre-wrap font-mono">
              {preview}
            </pre>
          </div>
        </div>

        {/* Tips */}
        <div className="card-structural p-6 mb-6 border-l-4 border-l-kosmos-orange">
          <h3 className="font-medium text-kosmos-white mb-3">Proximos Passos</h3>
          <ul className="space-y-2 text-sm text-kosmos-gray-light">
            <li className="flex items-start gap-2">
              <span className="text-kosmos-orange mt-0.5">1.</span>
              Revise cada secao e ajuste a linguagem para seu publico
            </li>
            <li className="flex items-start gap-2">
              <span className="text-kosmos-orange mt-0.5">2.</span>
              Crie uma pagina de vendas ou apresentacao baseada neste template
            </li>
            <li className="flex items-start gap-2">
              <span className="text-kosmos-orange mt-0.5">3.</span>
              Teste sua oferta com 5-10 pessoas do seu publico ideal
            </li>
            <li className="flex items-start gap-2">
              <span className="text-kosmos-orange mt-0.5">4.</span>
              Itere com base no feedback antes de lancar oficialmente
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={onCTA}
            size="lg"
            className="w-full h-14 text-base font-display font-semibold bg-kosmos-orange hover:bg-kosmos-orange-glow glow-orange-subtle hover:glow-orange text-white"
          >
            Quero Ajuda para Implementar
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button
            onClick={onShare}
            variant="outline"
            size="lg"
            className="w-full h-12"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar Ferramenta
          </Button>
        </div>

        {!isEmbed && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 text-kosmos-gray/40 text-xs">
              <div className="w-4 h-px bg-kosmos-gray/20" />
              <span>Powered by KOSMOS</span>
              <div className="w-4 h-px bg-kosmos-gray/20" />
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
    </div>
  );
}
