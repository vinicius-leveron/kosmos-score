import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CalculatorInputs, CalculatorOutputs } from '../lib/calculatePotential';

interface LeadData {
  name?: string;
  email: string;
  phone?: string;
}

export function useSaveCalculation() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveCalculation = async (
    leadData: LeadData,
    inputs: CalculatorInputs,
    outputs: CalculatorOutputs
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Get UTM params from URL
      const urlParams = new URLSearchParams(window.location.search);

      const insertData = {
        respondent_name: leadData.name,
        respondent_email: leadData.email.toLowerCase().trim(),
        respondent_phone: leadData.phone,
        lead_magnet_type: 'ecosystem-calculator',
        inputs: {
          faturamento_atual: inputs.faturamentoAtual,
          modelo_atual: inputs.modeloAtual,
          tamanho_audiencia: inputs.tamanhoAudiencia,
          ticket_medio: inputs.ticketMedio,
          horas_trabalhadas: inputs.horasTrabalhadas,
          equipe: inputs.equipe,
        },
        outputs: {
          potencial_mensal: outputs.potencialMensal,
          potencial_anual: outputs.potencialAnual,
          gap_atual: outputs.gapAtual,
          gap_percentual: outputs.gapPercentual,
          faturamento_hora_atual: outputs.faturamentoPorHoraAtual,
          faturamento_hora_potencial: outputs.faturamentoPorHoraPotencial,
          aumento_eficiencia: outputs.aumentoEficiencia,
          nivel_gap: outputs.nivelGap,
          breakdown: {
            produto_entrada: outputs.potencialProdutoEntrada,
            recorrencia: outputs.potencialRecorrencia,
            high_ticket: outputs.potencialHighTicket,
            comunidade: outputs.potencialComunidade,
          },
        },
        score_level: outputs.nivelGap,
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
          description: 'Não foi possível salvar seu resultado, mas você ainda pode visualizá-lo.',
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
