import { useState, useEffect } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { QuestionScreen } from './QuestionScreen';
import { ResultScreen } from './ResultScreen';
import { QUESTIONS, DiagnosticAnswers } from '../lib/questions';
import { DiagnosticResult, calculateDiagnosticResult } from '../lib/scoring';
import { useSaveDiagnostic } from '../hooks/useSaveDiagnostic';
import { useEmbedMessaging } from '../hooks/useEmbedMessaging';
import { useToast } from '@/hooks/use-toast';

type DiagnosticStep = 'welcome' | 'questions' | 'result';

export function DiagnosticFlow() {
  const [step, setStep] = useState<DiagnosticStep>('welcome');
  const [leadData, setLeadData] = useState<{ email: string; name?: string } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<DiagnosticAnswers>({});
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const { saveDiagnostic, isSaving } = useSaveDiagnostic();
  const { isEmbed, notifyStep, notifyComplete } = useEmbedMessaging();
  const { toast } = useToast();

  useEffect(() => {
    notifyStep('welcome');
  }, [notifyStep]);

  const handleStart = (email: string, name?: string) => {
    setLeadData({ email, name });
    setStep('questions');
    notifyStep('questions');
  };

  const handleAnswer = (value: string) => {
    const questionId = QUESTIONS[currentQuestionIndex].id;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = async () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate result
      const diagnosticResult = calculateDiagnosticResult(
        leadData?.email || '',
        answers,
        leadData?.name
      );
      setResult(diagnosticResult);

      // Save to database
      await saveDiagnostic(diagnosticResult, answers);

      // Update step
      setStep('result');
      notifyStep('result');
      notifyComplete({
        email: diagnosticResult.email,
        score: diagnosticResult.totalScore,
        level: diagnosticResult.level,
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleShare = () => {
    if (result) {
      const shareText = `Meu Score de Prontidão para High Ticket é ${result.totalScore}/100 (${result.level}). Descubra o seu:`;
      const shareUrl = isEmbed
        ? `${window.location.origin}/#/quiz/ht-readiness`
        : window.location.href;

      if (!isEmbed && navigator.share) {
        navigator.share({
          title: 'Diagnóstico de Prontidão para High Ticket',
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
    const url = 'https://kosmostoolkit.com/high-ticket';
    window.open(url, isEmbed ? '_top' : '_blank');
  };

  if (step === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (step === 'questions') {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    return (
      <QuestionScreen
        question={currentQuestion}
        currentIndex={currentQuestionIndex}
        totalQuestions={QUESTIONS.length}
        selectedAnswer={answers[currentQuestion.id]}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canGoBack={currentQuestionIndex > 0}
      />
    );
  }

  if (step === 'result' && result) {
    return (
      <ResultScreen
        result={result}
        onShare={handleShare}
        onCTA={handleCTA}
      />
    );
  }

  return null;
}
