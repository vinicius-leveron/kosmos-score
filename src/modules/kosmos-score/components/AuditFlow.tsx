import { useState, useEffect } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { QuestionScreen } from './QuestionScreen';
import { ResultScreen } from './ResultScreen';
import {
  questions,
  AuditAnswers,
  AuditAnswer,
  AuditResult,
  calculateAuditResult,
  getAnswerValue,
  getAnswerNumericValue,
} from '@/modules/kosmos-score/lib/auditQuestionsV2';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generatePDF } from '@/modules/kosmos-score/lib/pdfGenerator';
import { useEmbedMessaging } from '../hooks/useEmbedMessaging';

type AuditStep = 'welcome' | 'questions' | 'result';

export function AuditFlow() {
  const [step, setStep] = useState<AuditStep>('welcome');
  const [email, setEmail] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AuditAnswers>({});
  const [result, setResult] = useState<AuditResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { isEmbed, notifyStep, notifyComplete } = useEmbedMessaging();

  // Notify parent of initial step
  useEffect(() => {
    notifyStep('welcome');
  }, [notifyStep]);

  const handleStart = (userEmail: string) => {
    setEmail(userEmail);
    setStep('questions');
    notifyStep('questions');
  };

  const handleAnswer = (answer: AuditAnswer) => {
    const questionId = questions[currentQuestionIndex].id;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
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
      notifyStep('result');
      notifyComplete({
        email: auditResult.email,
        score: Math.round(auditResult.kosmosAssetScore),
        profile: auditResult.resultProfile,
      });
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
      // Build insert data for V2
      const insertData = {
        email: auditResult.email,
        version: 2,

        // BLOCO 1: Perfil
        business_category: auditResult.businessCategory,
        stage: auditResult.stage,
        niche: auditResult.niche,
        instagram_handle: auditResult.instagramHandle,
        time_selling: auditResult.timeSelling,

        // BLOCO 2: Quantitativo
        base_size: getAnswerValue(answers[6]),
        base_value: auditResult.baseValue,
        ticket_medio: getAnswerValue(answers[7]),
        ticket_value: auditResult.ticketValue,
        num_ofertas: getAnswerValue(answers[8]),
        ofertas_multiplier: getAnswerNumericValue(answers[8]) / 100, // Normalize
        monthly_revenue: getAnswerValue(answers[9]),
        monthly_revenue_value: auditResult.monthlyRevenue,

        // BLOCO 3: Movimento (antigo Causa)
        referral_perception: getAnswerValue(answers[10]),
        referral_perception_score: getAnswerNumericValue(answers[10]),
        mission_identification: getAnswerValue(answers[11]),
        mission_identification_score: getAnswerNumericValue(answers[11]),

        // BLOCO 4: Estrutura (antigo Cultura)
        frequencia_comunicacao: getAnswerValue(answers[12]),
        comunicacao_multiplier: getAnswerNumericValue(answers[12]) / 100,
        member_interactions: getAnswerValue(answers[13]),
        member_interactions_score: getAnswerNumericValue(answers[13]),
        rituals_multi: answers[14]?.type === 'multi' ? answers[14].values : [],
        rituals_multi_score: getAnswerNumericValue(answers[14]),

        // BLOCO 5: Economia
        oferta_ascensao: getAnswerValue(answers[15]),
        ascensao_score: getAnswerNumericValue(answers[15]),
        recorrencia: getAnswerValue(answers[16]),
        recorrencia_score: getAnswerNumericValue(answers[16]),

        // BLOCO 6: Voz do Cliente
        main_obstacle: auditResult.mainObstacle,
        workshop_motivation: auditResult.workshopMotivation,

        // Scores calculados
        score_movimento: auditResult.scoreMovimento,
        score_estrutura: auditResult.scoreEstrutura,
        score_economia: auditResult.scoreEconomia,
        kosmos_asset_score: auditResult.kosmosAssetScore,

        // V1 compatibility (map to old columns)
        score_causa: auditResult.scoreMovimento,
        score_cultura: auditResult.scoreEstrutura,

        // Resultado
        result_profile: auditResult.resultProfile,
        lucro_oculto_min: auditResult.lucroOcultoMin,
        lucro_oculto_max: auditResult.lucroOcultoMax,
        lucro_oculto_display: auditResult.lucroOcultoDisplay,
        lucro_oculto: auditResult.lucroOcultoMax, // V1 compatibility

        // Flags
        is_beginner: auditResult.stage === 'construindo',
      };

      const { error } = await supabase.from('audit_results').insert(insertData);

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
      const shareUrl = isEmbed
        ? `${window.location.origin}/#/quiz/kosmos-score`
        : window.location.href;

      if (!isEmbed && navigator.share) {
        navigator.share({
          title: 'KOSMOS Asset Score',
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

  const handleJoinGroup = () => {
    const url = 'https://chat.whatsapp.com/YOUR_GROUP_LINK';
    window.open(url, isEmbed ? '_top' : '_blank');
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
