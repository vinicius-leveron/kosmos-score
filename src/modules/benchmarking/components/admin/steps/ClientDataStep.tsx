/**
 * ClientDataStep - Step 1: Select client and basic data
 */

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Search, User } from 'lucide-react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/design-system/primitives/form';
import { Input } from '@/design-system/primitives/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import { useContacts } from '@/modules/crm/hooks/useContacts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KOSMOS_ORG_ID } from '@/core/auth';

export function ClientDataStep() {
  const { control, setValue, watch } = useFormContext();
  const [searchTerm, setSearchTerm] = useState('');

  const selectedContactOrgId = watch('contact_org_id');

  // Fetch all organizations (for admin to select which org the client belongs to)
  const { data: organizations } = useQuery({
    queryKey: ['organizations-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .neq('id', KOSMOS_ORG_ID)
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  // Fetch contacts for selection
  const { data: contactsData } = useContacts({
    organizationId: KOSMOS_ORG_ID,
    filters: { search: searchTerm },
    pagination: { page: 1, per_page: 50 },
  });

  // When contact is selected, also set the organization
  useEffect(() => {
    if (selectedContactOrgId && contactsData?.data) {
      const selectedContact = contactsData.data.find(
        (c) => c.id === selectedContactOrgId
      );
      if (selectedContact) {
        // For now, set to KOSMOS org - in production this would be the client's org
        setValue('organization_id', KOSMOS_ORG_ID);
      }
    }
  }, [selectedContactOrgId, contactsData, setValue]);

  return (
    <div className="space-y-6">
      {/* Client Selection */}
      <FormField
        control={control}
        name="contact_org_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cliente</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente">
                    {field.value && contactsData?.data ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {contactsData.data.find((c) => c.id === field.value)
                          ?.full_name ||
                          contactsData.data.find((c) => c.id === field.value)
                            ?.email ||
                          'Cliente selecionado'}
                      </div>
                    ) : (
                      'Selecione o cliente'
                    )}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-kosmos-gray-500" />
                    <Input
                      placeholder="Buscar cliente..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                {contactsData?.data?.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    <div className="flex flex-col">
                      <span>{contact.full_name || contact.email}</span>
                      {contact.full_name && (
                        <span className="text-xs text-kosmos-gray-500">
                          {contact.email}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
                {(!contactsData?.data || contactsData.data.length === 0) && (
                  <div className="p-4 text-center text-kosmos-gray-500 text-sm">
                    Nenhum cliente encontrado
                  </div>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Organization (hidden, auto-set based on contact) */}
      <FormField
        control={control}
        name="organization_id"
        render={({ field }) => (
          <FormItem className="hidden">
            <FormControl>
              <Input type="hidden" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Title */}
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título do Benchmark</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Benchmark Q1 2026 - Comunidade XYZ"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Analysis Date */}
      <FormField
        control={control}
        name="analysis_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data da Análise</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
