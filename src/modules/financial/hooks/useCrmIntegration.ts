import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KOSMOS_ORG_ID } from '@/core/auth';

interface CreateReceivableFromDealParams {
  dealId: string;
  dealName: string;
  amount: number;
  companyId?: string;
  contactOrgId?: string;
  dueDate: string;
  categoryId?: string;
  accountId?: string;
  organizationId?: string;
}

export function useCreateReceivableFromDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      dealName,
      amount,
      companyId,
      contactOrgId,
      dueDate,
      categoryId,
      accountId,
      organizationId = KOSMOS_ORG_ID,
    }: CreateReceivableFromDealParams) => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({
          organization_id: organizationId,
          type: 'receivable' as const,
          description: `Deal: ${dealName}`,
          amount,
          due_date: dueDate,
          competence_date: dueDate,
          deal_id: dealId,
          company_id: companyId || null,
          contact_org_id: contactOrgId || null,
          category_id: categoryId || null,
          account_id: accountId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
    },
  });
}
