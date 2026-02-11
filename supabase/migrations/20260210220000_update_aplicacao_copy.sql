-- ============================================================================
-- KOSMOS Platform - Update: Copy da Welcome Screen
-- ============================================================================
-- Nova copy mais impactante focada em comunidade e tribo
-- ============================================================================

UPDATE public.forms
SET
  welcome_screen = '{
    "enabled": true,
    "title": "Aplicação KOSMOS",
    "description": "Toda grande tribo começou pequena. Se você está pronto para criar a sua, queremos te conhecer.",
    "buttonText": "Começar",
    "collectEmail": false,
    "emailRequired": false
  }'::jsonb,
  updated_at = now()
WHERE slug = 'aplicacao-kosmos';
