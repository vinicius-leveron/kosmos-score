import { useState } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { LayerStep } from './LayerStep';
import { ResultScreen } from './ResultScreen';
import { ECOSYSTEM_LAYERS, BlueprintData } from '../lib/layers';
import { useSaveTemplate } from '../hooks/useSaveTemplate';
import { useToast } from '@/hooks/use-toast';

type TemplateStep = 'welcome' | 'layers' | 'result';

// Simple hook to detect embed (avoiding circular import)
function useIsEmbed(): boolean {
  return typeof window !== 'undefined' && window !== window.parent;
}

export function TemplateFlow() {
  const [step, setStep] = useState<TemplateStep>('welcome');
  const [leadData, setLeadData] = useState<{ email: string; name?: string } | null>(null);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [blueprintData, setBlueprintData] = useState<BlueprintData>({});
  const { saveTemplate, isSaving } = useSaveTemplate();
  const { toast } = useToast();
  const isEmbed = useIsEmbed();

  const handleStart = (email: string, name?: string) => {
    setLeadData({ email, name });
    setStep('layers');
  };

  const handleUpdate = (layerId: string, questionId: string, value: string | string[] | number) => {
    setBlueprintData((prev) => ({
      ...prev,
      [layerId]: {
        ...(prev[layerId] || {}),
        [questionId]: value,
      },
    }));
  };

  const handleNext = async () => {
    if (currentLayerIndex < ECOSYSTEM_LAYERS.length - 1) {
      setCurrentLayerIndex((prev) => prev + 1);
    } else {
      // Save and show result
      if (leadData) {
        await saveTemplate(leadData, blueprintData);
      }
      setStep('result');
    }
  };

  const handlePrevious = () => {
    if (currentLayerIndex > 0) {
      setCurrentLayerIndex((prev) => prev - 1);
    } else {
      setStep('welcome');
    }
  };

  const handleShare = () => {
    const shareText =
      'Acabei de mapear as 5 camadas do meu ecossistema com o Blueprint KOSMOS! Mapeie o seu:';
    const shareUrl = isEmbed
      ? `${window.location.origin}/#/quiz/ht-template`
      : window.location.href;

    if (!isEmbed && navigator.share) {
      navigator.share({
        title: 'Blueprint de Ecossistema',
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        copyToClipboard(shareText, shareUrl);
      });
    } else {
      copyToClipboard(shareText, shareUrl);
    }
  };

  const copyToClipboard = (text: string, url: string) => {
    navigator.clipboard.writeText(`${text} ${url}`).then(() => {
      toast({
        title: 'Link copiado!',
        description: 'Compartilhe com seus amigos.',
      });
    });
  };

  const handleCTA = () => {
    const url = 'https://kosmostoolkit.com/ecossistema';
    window.open(url, isEmbed ? '_top' : '_blank');
  };

  if (step === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (step === 'layers') {
    const currentLayer = ECOSYSTEM_LAYERS[currentLayerIndex];
    return (
      <LayerStep
        layer={currentLayer}
        layerIndex={currentLayerIndex}
        totalLayers={ECOSYSTEM_LAYERS.length}
        data={blueprintData}
        onUpdate={handleUpdate}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canGoBack={currentLayerIndex > 0}
      />
    );
  }

  if (step === 'result') {
    return <ResultScreen data={blueprintData} onShare={handleShare} onCTA={handleCTA} />;
  }

  return null;
}
