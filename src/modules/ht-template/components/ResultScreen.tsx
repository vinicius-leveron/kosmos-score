import { Button } from '@/design-system/primitives/button';
import { ArrowRight, Share2, Download, Copy, Layers } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';
import { BlueprintData, calculateOverallScore } from '../lib/layers';
import {
  generateBlueprintPreview,
  calculateBlueprintCompleteness,
  getOverallRecommendations,
} from '../lib/generateBlueprint';
import { BlueprintVisualization, LayerSummary } from './BlueprintVisualization';
import { useToast } from '@/hooks/use-toast';

interface ResultScreenProps {
  data: BlueprintData;
  onShare: () => void;
  onCTA: () => void;
}

export function ResultScreen({ data, onShare, onCTA }: ResultScreenProps) {
  const { isEmbed } = useEmbed();
  const { toast } = useToast();

  const preview = generateBlueprintPreview(data);
  const completeness = calculateBlueprintCompleteness(data);
  const { layerScores, overallStatus, averageScore, totalScore } = calculateOverallScore(data);
  const recommendations = getOverallRecommendations(overallStatus);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(preview).then(() => {
      toast({
        title: 'Copiado!',
        description: 'Seu blueprint foi copiado para a area de transferencia.',
      });
    });
  };

  const handleDownload = () => {
    const blob = new Blob([preview], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blueprint-ecossistema.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download iniciado!',
      description: 'Seu blueprint foi baixado como arquivo Markdown.',
    });
  };

  return (
    <div
      className={cn(
        'bg-kosmos-black blueprint-grid flex flex-col items-center px-4 relative overflow-hidden',
        isEmbed ? 'min-h-0 py-6' : 'min-h-screen py-8'
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      <div className="w-full max-w-3xl animate-fade-in relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-kosmos-orange/10 border border-kosmos-orange/20 rounded-full mb-4">
            <Layers className="w-4 h-4 text-kosmos-orange" />
            <span className="text-kosmos-orange text-sm font-medium">Blueprint Completo</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-kosmos-white mb-2">
            Seu Ecossistema: <span className="text-kosmos-orange">{overallStatus}</span>
          </h1>
          <p className="text-kosmos-gray">
            Score geral: {averageScore.toFixed(1)}/5 | {completeness}% mapeado
          </p>
        </div>

        {/* Visual Map */}
        <div className="card-structural p-6 mb-6">
          <h3 className="font-medium text-kosmos-white mb-4 text-center">Mapa das 5 Camadas</h3>
          <BlueprintVisualization data={data} layerScores={layerScores} />
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="card-structural p-6 mb-6 border-l-4 border-l-kosmos-orange">
            <h3 className="font-medium text-kosmos-white mb-3">
              Seu Ecossistema Hoje: {overallStatus}
            </h3>
            <ul className="space-y-2 text-sm text-kosmos-gray-light">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-kosmos-orange mt-0.5">{i === 0 ? '→' : '•'}</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Layer Summary */}
        <div className="card-structural p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-kosmos-white">Detalhes por Camada</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyToClipboard}
                aria-label="Copiar blueprint"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copiar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                aria-label="Baixar blueprint"
              >
                <Download className="w-4 h-4 mr-1" />
                Baixar
              </Button>
            </div>
          </div>

          <LayerSummary data={data} />
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={onCTA}
            size="lg"
            className="w-full h-14 text-base font-display font-semibold bg-kosmos-orange hover:bg-kosmos-orange-glow glow-orange-subtle hover:glow-orange text-white"
          >
            Quero Ajuda para Completar Meu Ecossistema
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button onClick={onShare} variant="outline" size="lg" className="w-full h-12">
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
