-- ============================================================================
-- KOSMOS Platform - Enable Email Capture at Start for Aplicacao Form
-- ============================================================================
-- Sets collectEmail and emailRequired to true so email is captured
-- at the welcome screen instead of as a form question
-- ============================================================================

UPDATE public.forms
SET
  welcome_screen = jsonb_set(
    jsonb_set(
      welcome_screen,
      '{collectEmail}',
      'true'::jsonb
    ),
    '{emailRequired}',
    'true'::jsonb
  ),
  updated_at = now()
WHERE slug = 'aplicacao-kosmos';

-- Add comment explaining the change
COMMENT ON COLUMN public.forms.welcome_screen IS
  'Welcome screen configuration. collectEmail=true captures email at start.';
