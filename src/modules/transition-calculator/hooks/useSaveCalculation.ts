import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TransitionInputs, TransitionOutputs } from '../lib/calculateTransition';

interface LeadData {
  name?: string;
  email: string;
}

export function useSaveCalculation() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveCalculation = async (
    leadData: LeadData,
    inputs: TransitionInputs,
    outputs: TransitionOutputs
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);

      const insertData = {
        respondent_name: leadData.name,
        respondent_email: leadData.email.toLowerCase().trim(),
        lead_magnet_type: 'transition-calculator',
        inputs: {
          faturamento_lancamento: inputs.faturamentoLancamento,
          frequencia_lancamentos: inputs.frequenciaLancamentos,
          custo_lancamento: inputs.custoLancamento,
          tamanho_lista: inputs.tamanhoLista,
          ticket_recorrencia: inputs.ticketRecorrencia,
          churn_estimado: inputs.churnEstimado,
        },
        outputs: {
          assinantes_necessarios: outputs.assinantesNecessarios,
          meses_breakeven: outputs.mesesParaBreakeven,
          conversao_necessaria: outputs.conversaoNecessaria,
          faturamento_anual_lancamento: outputs.faturamentoAnualLancamento,
          faturamento_anual_recorrencia: outputs.faturamentoAnualRecorrencia,
          lucro_anual_lancamento: outputs.lucroAnualLancamento,
          lucro_anual_recorrencia: outputs.lucroAnualRecorrencia,
          mrr_inicial: outputs.mrrInicial,
          mrr_projetado_12m: outputs.mrrProjetado12Meses,
          ltv: outputs.ltv,
        },
        total_score: outputs.mesesParaBreakeven <= 6 ? 90 : outputs.mesesParaBreakeven <= 12 ? 70 : 50,
        score_level: outputs.mesesParaBreakeven <= 6 ? 'rapido' : outputs.mesesParaBreakeven <= 12 ? 'viavel' : 'longo',
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
        console.error('Error saving calculation:', error);
        toast({
          title: 'Erro ao salvar',
          description: 'Nao foi possivel salvar seu resultado, mas voce ainda pode visualiza-lo.',
          variant: 'destructive',
        });
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error saving calculation:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveCalculation, isSaving };
}
