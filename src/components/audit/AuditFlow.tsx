import { useState } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { QuestionScreen } from './QuestionScreen';
import { ResultScreen } from './ResultScreen';
import { questions, AuditAnswers, calculateAuditResult, AuditResult } from '@/lib/auditQuestions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generatePDF } from '@/lib/pdfGenerator';

type AuditStep = 'welcome' | 'questions' | 'result';

export function AuditFlow() {
  const [step, setStep] = useState<AuditStep>('welcome');
  const [email, setEmail] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AuditAnswers>({});
  const [result, setResult] = useState<AuditResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleStart = (userEmail: string) => {
    setEmail(userEmail);
    setStep('questions');
  };

  const handleAnswer = (value: string, numericValue: number) => {
    const questionId = questions[currentQuestionIndex].id;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { value, numericValue },
    }));
  };

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate result and save to database
      const auditResult = calculateAuditResult(email, answers);
      setResult(auditResult);
      await saveAuditResult(auditResult);
      setStep('result');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const saveAuditResult = async (auditResult: AuditResult) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('audit_results').insert({
        email: auditResult.email,
        // Quantitative data
        base_size: answers[1]?.value || '',
        base_value: answers[1]?.numericValue || 0,
        ticket_medio: answers[2]?.value || '',
        ticket_value: answers[2]?.numericValue || 0,
        num_ofertas: answers[3]?.value || '',
        ofertas_multiplier: answers[3]?.numericValue || 1,
        frequencia_comunicacao: answers[4]?.value || '',
        comunicacao_multiplier: answers[4]?.numericValue || 0.5,
        // Causa
        razao_compra: answers[5]?.value || '',
        razao_compra_score: answers[5]?.numericValue || 0,
        identidade_comunidade: answers[6]?.value || '',
        identidade_score: answers[6]?.numericValue || 0,
        // Cultura
        autonomia_comunidade: answers[7]?.value || '',
        autonomia_score: answers[7]?.numericValue || 0,
        rituais_jornada: answers[8]?.value || '',
        rituais_score: answers[8]?.numericValue || 0,
        // Economia
        oferta_ascensao: answers[9]?.value || '',
        ascensao_score: answers[9]?.numericValue || 0,
        recorrencia: answers[10]?.value || '',
        recorrencia_score: answers[10]?.numericValue || 0,
        // Calculated scores
        score_causa: auditResult.scoreCausa,
        score_cultura: auditResult.scoreCultura,
        score_economia: auditResult.scoreEconomia,
        kosmos_asset_score: auditResult.kosmosAssetScore,
        lucro_oculto: auditResult.lucroOculto,
        is_beginner: auditResult.isBeginner,
      });

      if (error) {
        console.error('Error saving audit result:', error);
        toast({
          title: 'Erro ao salvar',
          description: 'Não foi possível salvar seu resultado, mas você ainda pode visualizá-lo.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error saving audit:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (result) {
      generatePDF(result);
      toast({
        title: 'PDF Gerado!',
        description: 'Seu relatório foi baixado com sucesso.',
      });
    }
  };

  const handleShare = () => {
    if (result) {
      const shareText = `Meu KOSMOS Asset Score é ${Math.round(result.kosmosAssetScore)}/100. E o seu? Faça sua Auditoria de Lucro Oculto:`;
      const shareUrl = window.location.href;

      if (navigator.share) {
        navigator.share({
          title: 'KOSMOS Asset Score',
          text: shareText,
          url: shareUrl,
        }).catch(() => {
          // Fallback to clipboard
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

  const handleJoinGroup = () => {
    // Replace with actual WhatsApp group link
    window.open('https://chat.whatsapp.com/YOUR_GROUP_LINK', '_blank');
  };

  if (step === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (step === 'questions') {
    const currentQuestion = questions[currentQuestionIndex];
    return (
      <QuestionScreen
        question={currentQuestion}
        currentIndex={currentQuestionIndex}
        totalQuestions={questions.length}
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
        onDownloadPDF={handleDownloadPDF}
        onShare={handleShare}
        onJoinGroup={handleJoinGroup}
      />
    );
  }

  return null;
}
