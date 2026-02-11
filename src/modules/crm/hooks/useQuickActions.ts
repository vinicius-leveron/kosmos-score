import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type QuickActionType = 'whatsapp' | 'email' | 'call' | 'task';

export interface QuickActionData {
  type: QuickActionType;
  contactOrgId: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export function useCreateQuickAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: QuickActionData) => {
      // Save to activities table with the quick action type
      const { data: activity, error } = await supabase
        .from('activities')
        .insert({
          contact_org_id: data.contactOrgId,
          type: data.type === 'whatsapp' ? 'whatsapp_sent' : 
                data.type === 'email' ? 'email_sent' : 
                data.type === 'call' ? 'call' : 
                'meeting', // task will be logged as meeting type
          title: data.title,
          description: data.description,
          metadata: data.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;
      return activity;
    },
    onSuccess: (_, variables) => {
      // Invalidate activities cache
      queryClient.invalidateQueries({
        queryKey: ['activities', variables.contactOrgId],
      });
      
      // Show success toast
      const actionNames = {
        whatsapp: 'WhatsApp enviado',
        email: 'Email enviado',
        call: 'Ligação registrada',
        task: 'Tarefa criada'
      };
      
      toast.success(actionNames[variables.type]);
    },
    onError: (error) => {
      console.error('Error creating quick action:', error);
      toast.error('Erro ao registrar ação');
    },
  });
}

// Templates for quick messages
export const messageTemplates = {
  whatsapp: [
    {
      id: 'greeting',
      name: 'Saudação inicial',
      content: 'Olá {{nome}}! Tudo bem? Vi que você se interessou pelo nosso conteúdo sobre {{tema}}.'
    },
    {
      id: 'followup',
      name: 'Follow-up',
      content: 'Oi {{nome}}! Passando para ver se você teve tempo de analisar o material que enviei.'
    },
    {
      id: 'offer',
      name: 'Oferta especial',
      content: 'Olá {{nome}}! Tenho uma oportunidade especial para compartilhar com você. Quando podemos conversar?'
    },
    {
      id: 'thanks',
      name: 'Agradecimento',
      content: 'Muito obrigado pela confiança, {{nome}}! Foi ótimo conversar com você.'
    }
  ],
  email: [
    {
      id: 'welcome',
      name: 'Boas-vindas',
      subject: 'Bem-vindo(a) à nossa comunidade!',
      content: `Olá {{nome}},

É um prazer ter você conosco! 

Preparei alguns materiais especiais para você começar com o pé direito.

Qualquer dúvida, estou à disposição.

Atenciosamente,
{{remetente}}`
    },
    {
      id: 'content',
      name: 'Compartilhar conteúdo',
      subject: 'Material exclusivo para você',
      content: `Oi {{nome}},

Como prometido, segue o material que conversamos.

[Link do material]

Espero que seja útil para você!

Abraços,
{{remetente}}`
    },
    {
      id: 'meeting',
      name: 'Agendar reunião',
      subject: 'Vamos marcar uma conversa?',
      content: `Olá {{nome}},

Gostaria de agendar uma conversa rápida para entender melhor suas necessidades.

Você teria disponibilidade esta semana? Podemos fazer por videochamada ou telefone, como preferir.

Aguardo seu retorno.

Atenciosamente,
{{remetente}}`
    }
  ]
};

export const taskTypes = [
  { value: 'followup', label: 'Follow-up', color: 'blue' },
  { value: 'call', label: 'Ligar', color: 'green' },
  { value: 'email', label: 'Enviar email', color: 'purple' },
  { value: 'meeting', label: 'Reunião', color: 'orange' },
  { value: 'proposal', label: 'Enviar proposta', color: 'red' },
  { value: 'other', label: 'Outro', color: 'gray' }
];