import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendToPipelineResult {
  success: boolean;
  error?: string;
  pipeline_id?: string;
  stage_id?: string;
  deal_created?: boolean;
  deal_error?: string;
}

/**
 * Hook para enviar um contato do Outbound para o Pipeline de CRM
 * Usa a função SQL send_contact_to_pipeline
 */
export function useSendToPipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactOrgId,
      createDeal = false,
    }: {
      contactOrgId: string;
      createDeal?: boolean;
    }): Promise<SendToPipelineResult> => {
      const { data, error } = await supabase.rpc('send_contact_to_pipeline', {
        p_contact_org_id: contactOrgId,
        p_create_deal: createDeal,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data as SendToPipelineResult;
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        queryClient.invalidateQueries({ queryKey: ['pipeline'] });
        queryClient.invalidateQueries({ queryKey: ['deals'] });

        if (result.deal_created) {
          toast.success('Contato adicionado ao pipeline e Deal criado');
        } else if (variables.createDeal && result.deal_error) {
          toast.success('Contato adicionado ao pipeline');
          toast.warning(result.deal_error === 'No company linked to contact'
            ? 'Deal nao criado: contato sem empresa vinculada'
            : result.deal_error
          );
        } else {
          toast.success('Contato adicionado ao pipeline');
        }
      } else {
        toast.error(result.error || 'Erro ao enviar para pipeline');
      }
    },
    onError: (error) => {
      console.error('Error sending to pipeline:', error);
      toast.error('Erro ao enviar para pipeline');
    },
  });
}
