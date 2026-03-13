import { useState, useCallback, useEffect } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { QuestionScreen } from './QuestionScreen';
import { ProcessingScreen } from './ProcessingScreen';
import { ResultScreen } from './result/ResultScreen';
import { RAIO_X_QUESTIONS, TOTAL_QUESTIONS } from '../lib/questions';
import { calculateLeadScore } from '../lib/scoring';
import { useProcessRaioX } from '../hooks/useProcessRaioX';
import { useEmbedMessaging } from '../hooks/useEmbedMessaging';
import { useEmbed } from '../contexts/EmbedContext';
import type { RaioXAnswer, RaioXAnswers, RaioXProcessResponse } from '../lib/types';

type FlowStep = 'welcome' | 'questions' | 'processing' | 'result';

export function RaioXFlow() {
  const { isEmbed } = useEmbed();
  const { notifyStep, notifyResult } = useEmbedMessaging();
  const processRaioX = useProcessRaioX();

  const [step, setStep] = useState<FlowStep>('welcome');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<RaioXAnswers>({});
  const [result, setResult] = useState<RaioXProcessResponse | null>(null);

  const currentQuestion = RAIO_X_QUESTIONS[currentQuestionIndex];

  // Notify parent on step change
  useEffect(() => {
    notifyStep(step);
  }, [step, notifyStep]);

  const handleStart = useCallback(
    (userEmail: string, userName: string, userInstagram: string) => {
      setEmail(userEmail);
      setFullName(userName);
      setInstagram(userInstagram);
      setStep('questions');
    },
    []
  );

  const handleAnswer = useCallback(
    (answer: RaioXAnswer) => {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: answer,
      }));
    },
    [currentQuestion]
  );

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  }, [currentQuestionIndex]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      // Last question answered — move to processing
      setStep('processing');

      const score = calculateLeadScore(answers);

      processRaioX.mutate(
        { name: fullName, email, instagram, answers },
        {
          onSuccess: (data) => {
            setResult(data);
            setStep('result');
            notifyResult(data);
          },
          onError: () => {
            // Stay on processing; user can retry via browser refresh
            // A proper error state could be added later
          },
        }
      );
    }
  }, [
    currentQuestionIndex,
    answers,
    email,
    fullName,
    instagram,
    processRaioX,
    notifyResult,
  ]);

  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  return (
    <>
      {step === 'welcome' && <WelcomeScreen onStart={handleStart} />}

      {step === 'questions' && currentQuestion && (
        <QuestionScreen
          question={currentQuestion}
          currentIndex={currentQuestionIndex}
          totalQuestions={TOTAL_QUESTIONS}
          currentAnswer={currentAnswer}
          onAnswer={handleAnswer}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canGoBack={currentQuestionIndex > 0}
          isLastQuestion={currentQuestionIndex === TOTAL_QUESTIONS - 1}
        />
      )}

      {step === 'processing' && <ProcessingScreen />}

      {step === 'result' && result && (
        <ResultScreen
          outputs={result.outputs}
          score={result.score}
          respondentName={fullName}
          resultId={result.id}
        />
      )}
    </>
  );
}
