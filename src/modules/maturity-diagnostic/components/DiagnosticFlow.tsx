import { useState, useCallback, useEffect } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { QuestionScreen } from './QuestionScreen';
import { ResultScreen } from './ResultScreen';
import { MATURITY_QUESTIONS, getTotalQuestions } from '../lib/questions';
import {
  calculateDiagnosticResult,
  DiagnosticAnswer,
  DiagnosticResult,
} from '../lib/scoring';
import { useSaveDiagnostic } from '../hooks/useSaveDiagnostic';
import { useEmbedMessaging } from '../hooks/useEmbedMessaging';
import { useEmbed } from '../contexts/EmbedContext';

type FlowStep = 'welcome' | 'questions' | 'result';

const SCHEDULE_CALL_URL = 'https://calendly.com/kosmos/diagnostico';

export function DiagnosticFlow() {
  const { isEmbed } = useEmbed();
  const { notifyStep, notifyResult } = useEmbedMessaging();
  const saveDiagnostic = useSaveDiagnostic();

  const [step, setStep] = useState<FlowStep>('welcome');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState<string | undefined>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, DiagnosticAnswer>>(
    new Map()
  );
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const totalQuestions = getTotalQuestions();
  const currentQuestion = MATURITY_QUESTIONS[currentQuestionIndex];

  // Notify parent on step change
  useEffect(() => {
    notifyStep(step);
  }, [step, notifyStep]);

  const handleStart = useCallback((userEmail: string, userName?: string) => {
    setEmail(userEmail);
    setFullName(userName);
    setStep('questions');
  }, []);

  const handleAnswer = useCallback(
    (value: string, score: number) => {
      const newAnswers = new Map(answers);
      newAnswers.set(currentQuestion.id, {
        questionId: currentQuestion.id,
        value,
        score,
      });
      setAnswers(newAnswers);
    },
    [answers, currentQuestion]
  );

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate result
      const answersArray = Array.from(answers.values());
      const diagnosticResult = calculateDiagnosticResult(
        email,
        answersArray,
        fullName
      );

      setResult(diagnosticResult);
      setStep('result');

      // Save to database
      saveDiagnostic.mutate({ result: diagnosticResult });

      // Notify parent
      notifyResult(diagnosticResult);
    }
  }, [
    currentQuestionIndex,
    totalQuestions,
    answers,
    email,
    fullName,
    saveDiagnostic,
    notifyResult,
  ]);

  const handleScheduleCall = useCallback(() => {
    const url = new URL(SCHEDULE_CALL_URL);
    url.searchParams.set('email', email);
    if (fullName) {
      url.searchParams.set('name', fullName);
    }
    if (result) {
      url.searchParams.set('level', result.level.toString());
    }

    if (isEmbed) {
      window.open(url.toString(), '_blank');
    } else {
      window.location.href = url.toString();
    }
  }, [email, fullName, result, isEmbed]);

  const handleShare = useCallback(() => {
    if (!result) return;

    const text = result.shareText;
    const url = window.location.href;

    // Copy to clipboard
    navigator.clipboard.writeText(`${text}\n\n${url}`).then(() => {
      // Could add a toast notification here
      alert('Texto copiado para a área de transferência!');
    });
  }, [result]);

  const selectedValue = currentQuestion
    ? answers.get(currentQuestion.id)?.value
    : undefined;

  return (
    <>
      {step === 'welcome' && <WelcomeScreen onStart={handleStart} />}

      {step === 'questions' && currentQuestion && (
        <QuestionScreen
          question={currentQuestion}
          currentIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          selectedValue={selectedValue}
          onAnswer={handleAnswer}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canGoBack={currentQuestionIndex > 0}
          isLastQuestion={currentQuestionIndex === totalQuestions - 1}
        />
      )}

      {step === 'result' && result && (
        <ResultScreen
          result={result}
          onScheduleCall={handleScheduleCall}
          onShare={handleShare}
        />
      )}
    </>
  );
}
