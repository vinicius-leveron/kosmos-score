-- ============================================================================
-- ADD SCHEDULING_SCREEN COLUMN AND ENABLE FOR APLICACAO-KOSMOS
-- ============================================================================

-- 1. Adicionar coluna scheduling_screen se não existir
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS scheduling_screen JSONB DEFAULT jsonb_build_object(
  'enabled', false,
  'calLink', '',
  'eventType', null,
  'title', 'Agende uma conversa',
  'description', 'Escolha o melhor horário para conversarmos.',
  'theme', 'dark',
  'brandColor', '#FF6B35',
  'layout', 'month_view',
  'ctaText', 'Agendar conversa',
  'hideEventTypeDetails', false
);

-- 2. Habilitar para aplicacao-kosmos
UPDATE public.forms
SET scheduling_screen = jsonb_build_object(
  'enabled', true,
  'calLink', 'vinicius-kosmos',
  'eventType', null,
  'title', 'Agende uma conversa',
  'description', 'Escolha o melhor horário para conversarmos sobre seu ecossistema.',
  'theme', 'dark',
  'brandColor', '#FF6B35',
  'layout', 'month_view',
  'ctaText', 'Agendar conversa',
  'hideEventTypeDetails', false
)
WHERE slug = 'aplicacao-kosmos';

-- Verificação
DO $$
DECLARE
  v_enabled BOOLEAN;
BEGIN
  SELECT (scheduling_screen->>'enabled')::boolean INTO v_enabled
  FROM public.forms
  WHERE slug = 'aplicacao-kosmos';

  IF v_enabled THEN
    RAISE NOTICE 'Agendamento HABILITADO para aplicacao-kosmos';
  ELSE
    RAISE NOTICE 'ERRO: Agendamento NAO foi habilitado';
  END IF;
END $$;
