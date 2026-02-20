import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DiagnosticResult } from '../lib/scoring';
import { DiagnosticAnswers } from '../lib/questions';

export function useSaveDiagnostic() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveDiagnostic = async (
    result: DiagnosticResult,
    answers: DiagnosticAnswers
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Get UTM params from URL
      const urlParams = new URLSearchParams(window.location.search);

      const insertData = {
        respondent_name: result.name,
        respondent_email: result.email.toLowerCase().trim(),
        lead_magnet_type: 'ht-readiness',
        inputs: answers,
        outputs: {
          level: result.level,
          level_label: result.levelLabel,
          category_scores: result.categoryScores.map((cs) => ({
            category: cs.category,
            name: cs.name,
            percentage: cs.percentage,
            level: cs.level,
          })),
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          recommendations: result.recommendations,
        },
        total_score: result.totalScore,
        score_level: result.level,
        score_breakdown: {
          autoridade: result.categoryScores.find((c) => c.category === 'autoridade')?.percentage,
          oferta: result.categoryScores.find((c) => c.category === 'oferta')?.percentage,
          entrega: result.categoryScores.find((c) => c.category === 'entrega')?.percentage,
          mindset: result.categoryScores.find((c) => c.category === 'mindset')?.percentage,
        },
        source: urlParams.get('utm_source'),
        medium: urlParams.get('utm_medium'),
        campaign: urlParams.get('utm_campaign'),
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      };

      const { error } = await supabase
        .from('lead_magnet_results')
        .insert(insertData);

      if (error) {
        console.error('Error saving diagnostic:', error);
        toast({
          title: 'Erro ao salvar',
          description: 'Não foi possível salvar seu resultado, mas você ainda pode visualizá-lo.',
          variant: 'destructive',
        });
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error saving diagnostic:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveDiagnostic, isSaving };
}
