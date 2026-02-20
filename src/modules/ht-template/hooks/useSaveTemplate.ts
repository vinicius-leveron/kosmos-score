import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TemplateData } from '../lib/sections';
import { calculateCompleteness } from '../lib/generatePreview';

interface LeadData {
  name?: string;
  email: string;
}

export function useSaveTemplate() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveTemplate = async (
    leadData: LeadData,
    templateData: TemplateData
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const completeness = calculateCompleteness(templateData);

      const insertData = {
        respondent_name: leadData.name,
        respondent_email: leadData.email.toLowerCase().trim(),
        lead_magnet_type: 'ht-template',
        inputs: templateData,
        outputs: {
          completeness,
          sections_filled: Object.keys(templateData).length,
          headline: templateData.stack_valor?.headline_oferta || null,
          investimento: templateData.pricing?.investimento || null,
        },
        total_score: completeness,
        score_level: completeness >= 80 ? 'completo' : completeness >= 50 ? 'parcial' : 'inicial',
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
        console.error('Error saving template:', error);
        toast({
          title: 'Erro ao salvar',
          description: 'Não foi possível salvar seu template, mas você ainda pode visualizá-lo.',
          variant: 'destructive',
        });
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error saving template:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveTemplate, isSaving };
}
