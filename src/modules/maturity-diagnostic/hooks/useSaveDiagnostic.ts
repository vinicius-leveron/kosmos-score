import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DiagnosticResult, formatResultForDatabase } from '../lib/scoring';

interface SaveDiagnosticParams {
  result: DiagnosticResult;
}

export function useSaveDiagnostic() {
  return useMutation({
    mutationFn: async ({ result }: SaveDiagnosticParams) => {
      const formattedData = formatResultForDatabase(result);

      const { data, error } = await supabase
        .from('lead_magnet_results')
        .insert(formattedData)
        .select()
        .single();

      if (error) {
        console.error('Error saving diagnostic result:', error);
        throw error;
      }

      return data;
    },
  });
}
