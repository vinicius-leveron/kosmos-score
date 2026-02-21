import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BlueprintData, calculateOverallScore } from '../lib/layers';
import { calculateBlueprintCompleteness } from '../lib/generateBlueprint';

interface LeadData {
  name?: string;
  email: string;
}

export function useSaveTemplate() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveTemplate = async (
    leadData: LeadData,
    blueprintData: BlueprintData
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const completeness = calculateBlueprintCompleteness(blueprintData);
      const { layerScores, overallStatus, averageScore, totalScore } =
        calculateOverallScore(blueprintData);

      const insertData = {
        respondent_name: leadData.name,
        respondent_email: leadData.email.toLowerCase().trim(),
        lead_magnet_type: 'ecosystem-blueprint',
        inputs: blueprintData,
        outputs: {
          completeness,
          layersCount: Object.keys(blueprintData).length,
          overallStatus,
          averageScore,
          totalScore,
          layerScores,
        },
        total_score: Math.round(averageScore * 20), // Convert 1-5 to 0-100
        score_level: overallStatus,
        score_breakdown: {
          layerScores,
          averageScore,
          completeness,
        },
        source: urlParams.get('utm_source'),
        medium: urlParams.get('utm_medium'),
        campaign: urlParams.get('utm_campaign'),
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      };

      const { error } = await supabase.from('lead_magnet_results').insert(insertData);

      if (error) {
        console.error('Error saving blueprint:', error);
        toast({
          title: 'Erro ao salvar',
          description: 'Nao foi possivel salvar seu blueprint, mas voce ainda pode visualiza-lo.',
          variant: 'destructive',
        });
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error saving blueprint:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveTemplate, isSaving };
}
