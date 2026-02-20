import { useState, useEffect } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { InputsScreen } from './InputsScreen';
import { ResultScreen } from './ResultScreen';
import {
  CalculatorInputs,
  CalculatorOutputs,
  calculatePotential,
} from '../lib/calculatePotential';
import { useSaveCalculation } from '../hooks/useSaveCalculation';
import { useEmbedMessaging } from '../hooks/useEmbedMessaging';
import { useToast } from '@/hooks/use-toast';

type CalculatorStep = 'welcome' | 'inputs' | 'result';

export function CalculatorFlow() {
  const [step, setStep] = useState<CalculatorStep>('welcome');
  const [leadData, setLeadData] = useState<{ email: string; name?: string } | null>(null);
  const [inputs, setInputs] = useState<CalculatorInputs | null>(null);
  const [outputs, setOutputs] = useState<CalculatorOutputs | null>(null);
  const { saveCalculation, isSaving } = useSaveCalculation();
  const { isEmbed, notifyStep, notifyComplete } = useEmbedMessaging();
  const { toast } = useToast();

  // Notify parent of initial step
  useEffect(() => {
    notifyStep('welcome');
  }, [notifyStep]);

  const handleStart = (email: string, name?: string) => {
    setLeadData({ email, name });
    setStep('inputs');
    notifyStep('inputs');
  };

  const handleBack = () => {
    setStep('welcome');
    notifyStep('welcome');
  };

  const handleCalculate = async (calculatorInputs: CalculatorInputs) => {
    setInputs(calculatorInputs);

    // Calculate results
    const calculatedOutputs = calculatePotential(calculatorInputs);
    setOutputs(calculatedOutputs);

    // Save to database
    if (leadData) {
      await saveCalculation(leadData, calculatorInputs, calculatedOutputs);
    }

    // Update step and notify
    setStep('result');
    notifyStep('result');
    notifyComplete({
      email: leadData?.email || '',
      potencial: calculatedOutputs.potencialMensal,
      gap: calculatedOutputs.gapAtual,
      nivel: calculatedOutputs.nivelGap,
    });
  };

  const handleShare = () => {
    if (outputs) {
      const shareText = `Descobri que posso aumentar meu faturamento em ${outputs.gapPercentual}% com um modelo de ecossistema! Faça o seu cálculo:`;
      const shareUrl = isEmbed
        ? `${window.location.origin}/#/quiz/ecosystem-calculator`
        : window.location.href;

      if (!isEmbed && navigator.share) {
        navigator.share({
          title: 'Calculadora de Potencial de Ecossistema',
          text: shareText,
          url: shareUrl,
        }).catch(() => {
          copyToClipboard(shareText, shareUrl);
        });
      } else {
        copyToClipboard(shareText, shareUrl);
      }
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
    // Open scheduling or contact page
    const url = 'https://kosmostoolkit.com/agendar';
    window.open(url, isEmbed ? '_top' : '_blank');
  };

  if (step === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (step === 'inputs') {
    return <InputsScreen onCalculate={handleCalculate} onBack={handleBack} />;
  }

  if (step === 'result' && inputs && outputs) {
    return (
      <ResultScreen
        inputs={inputs}
        outputs={outputs}
        onShare={handleShare}
        onCTA={handleCTA}
      />
    );
  }

  return null;
}
