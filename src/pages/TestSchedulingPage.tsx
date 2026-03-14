/**
 * Test page for Cal.com scheduling integration
 * Access via: /#/test/scheduling
 */

import { SchedulingScreen } from '@/modules/toolkit/components/runtime/SchedulingScreen';
import type { FormWithRelations, FormSubmission } from '@/modules/toolkit/types/form.types';

// Mock form with scheduling enabled
const mockForm: FormWithRelations = {
  id: 'test-form',
  name: 'Test Form',
  slug: 'test-form',
  organization_id: 'c0000000-0000-0000-0000-000000000001',
  status: 'published',
  description: null,
  welcome_screen: { enabled: false, title: '', description: '', buttonText: '' },
  thank_you_screen: { enabled: true, title: 'Obrigado!', description: '', showScore: false },
  crm_config: { createContact: false, emailFieldKey: 'email', nameFieldKey: 'nome' },
  scoring_enabled: false,
  email_capture_enabled: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  blocks: [],
  fields: [],
  classifications: [],
  scheduling_screen: {
    enabled: true,
    calLink: 'vinicius-kosmos',
    eventType: null,
    title: 'Agende uma conversa',
    description: 'Escolha o melhor horário para conversarmos sobre seu ecossistema.',
    theme: 'dark',
    brandColor: '#FF6B35',
    layout: 'month_view',
    ctaText: 'Agendar conversa',
    hideEventTypeDetails: false,
  },
};

// Mock submission
const mockSubmission: FormSubmission = {
  id: 'test-submission',
  form_id: 'test-form',
  respondent_email: 'test@example.com',
  status: 'completed',
  answers: {
    nome: { value: 'Usuário Teste' },
    email: { value: 'test@example.com' },
  },
  progress_percentage: 100,
  score: null,
  pillar_scores: {},
  computed_data: {},
  classification_id: null,
  metadata: {},
  started_at: new Date().toISOString(),
  completed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function TestSchedulingPage() {
  return (
    <SchedulingScreen
      form={mockForm}
      submission={mockSubmission}
      onBack={() => window.history.back()}
      onScheduled={() => alert('Agendamento confirmado!')}
    />
  );
}
