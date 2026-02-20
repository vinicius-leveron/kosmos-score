import { useState } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { InputsScreen } from './InputsScreen';
import { ResultScreen } from './ResultScreen';
import {
  TransitionInputs,
  TransitionOutputs,
  calculateTransition,
} from '../lib/calculateTransition';
import { useSaveCalculation } from '../hooks/useSaveCalculation';
import { useToast } from '@/hooks/use-toast';

type CalculatorStep = 'welcome' | 'inputs' | 'result';

function useIsEmbed(): boolean {
  return typeof window !== 'undefined' && window !== window.parent;
}

export function CalculatorFlow() {
  const [step, setStep] = useState<CalculatorStep>('welcome');
  const [leadData, setLeadData] = useState<{ email: string; name?: string } | null>(null);
  const [inputs, setInputs] = useState<TransitionInputs | null>(null);
  const [outputs, setOutputs] = useState<TransitionOutputs | null>(null);
  const { saveCalculation, isSaving } = useSaveCalculation();
  const { toast } = useToast();
  const isEmbed = useIsEmbed();

  const handleStart = (email: string, name?: string) => {
    setLeadData({ email, name });
    setStep('inputs');
  };

  const handleBack = () => {
    setStep('welcome');
  };

  const handleCalculate = async (calculatorInputs: TransitionInputs) => {
    setInputs(calculatorInputs);

    // Calculate results
    const calculatedOutputs = calculateTransition(calculatorInputs);
    setOutputs(calculatedOutputs);

    // Save to database
    if (leadData) {
      await saveCalculation(leadData, calculatorInputs, calculatedOutputs);
    }

    setStep('result');
  };

  const handleShare = () => {
    if (outputs) {
      const shareText = `Calculei minha transicao de lancamentos para recorrencia! Breakeven em ${outputs.mesesParaBreakeven} meses. Faca o seu:`;
      const shareUrl = isEmbed
        ? `${window.location.origin}/#/quiz/transition-calculator`
        : window.location.href;

      if (!isEmbed && navigator.share) {
        navigator.share({
          title: 'Calculadora de Transicao',
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
    const url = 'https://kosmostoolkit.com/recorrencia';
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
