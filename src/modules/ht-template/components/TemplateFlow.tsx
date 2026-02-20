import { useState } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { SectionStep } from './SectionStep';
import { ResultScreen } from './ResultScreen';
import { TEMPLATE_SECTIONS, TemplateData } from '../lib/sections';
import { useSaveTemplate } from '../hooks/useSaveTemplate';
import { useToast } from '@/hooks/use-toast';

type TemplateStep = 'welcome' | 'sections' | 'result';

interface EmbedContextValue {
  isEmbed: boolean;
}

// Simple hook to detect embed (avoiding circular import)
function useIsEmbed(): boolean {
  return typeof window !== 'undefined' && window !== window.parent;
}

export function TemplateFlow() {
  const [step, setStep] = useState<TemplateStep>('welcome');
  const [leadData, setLeadData] = useState<{ email: string; name?: string } | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [templateData, setTemplateData] = useState<TemplateData>({});
  const { saveTemplate, isSaving } = useSaveTemplate();
  const { toast } = useToast();
  const isEmbed = useIsEmbed();

  const handleStart = (email: string, name?: string) => {
    setLeadData({ email, name });
    setStep('sections');
  };

  const handleUpdate = (sectionId: string, fieldId: string, value: string | string[] | number) => {
    setTemplateData((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [fieldId]: value,
      },
    }));
  };

  const handleNext = async () => {
    if (currentSectionIndex < TEMPLATE_SECTIONS.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
    } else {
      // Save and show result
      if (leadData) {
        await saveTemplate(leadData, templateData);
      }
      setStep('result');
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
    } else {
      setStep('welcome');
    }
  };

  const handleShare = () => {
    const shareText = 'Acabei de estruturar minha oferta high ticket com o Template KOSMOS! Crie a sua:';
    const shareUrl = isEmbed
      ? `${window.location.origin}/#/quiz/ht-template`
      : window.location.href;

    if (!isEmbed && navigator.share) {
      navigator.share({
        title: 'Template de Oferta High Ticket',
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
    const url = 'https://kosmostoolkit.com/high-ticket';
    window.open(url, isEmbed ? '_top' : '_blank');
  };

  if (step === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (step === 'sections') {
    const currentSection = TEMPLATE_SECTIONS[currentSectionIndex];
    return (
      <SectionStep
        section={currentSection}
        sectionIndex={currentSectionIndex}
        totalSections={TEMPLATE_SECTIONS.length}
        data={templateData}
        onUpdate={handleUpdate}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canGoBack={currentSectionIndex > 0}
      />
    );
  }

  if (step === 'result') {
    return (
      <ResultScreen
        data={templateData}
        onShare={handleShare}
        onCTA={handleCTA}
      />
    );
  }

  return null;
}
