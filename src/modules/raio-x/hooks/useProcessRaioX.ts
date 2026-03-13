import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RaioXSubmission, RaioXProcessResponse } from '../lib/types';

export function useProcessRaioX() {
  return useMutation({
    mutationFn: async (submission: RaioXSubmission): Promise<RaioXProcessResponse> => {
      const { data, error } = await supabase.functions.invoke('raio-x-process', {
        body: submission,
      });
      if (error) throw error;
      return data as RaioXProcessResponse;
    },
  });
}
