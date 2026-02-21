-- ============================================================================
-- ADD MATURITY DIAGNOSTIC LEAD MAGNET TYPE
-- Adiciona o tipo maturity-diagnostic que substitui ecosystem-calculator e ht-readiness
-- ============================================================================

-- Remover a constraint antiga
ALTER TABLE public.lead_magnet_results
DROP CONSTRAINT IF EXISTS lead_magnet_results_lead_magnet_type_check;

-- Adicionar nova constraint com todos os tipos (novos + legacy)
ALTER TABLE public.lead_magnet_results
ADD CONSTRAINT lead_magnet_results_lead_magnet_type_check
CHECK (
  lead_magnet_type IN (
    -- Novos tipos (Phase 1)
    'maturity-diagnostic',

    -- Futuros (Phase 2 e 3)
    'stop-launching-simulator',
    'ecosystem-blueprint',

    -- Legacy (manter para dados existentes e compatibilidade)
    'ecosystem-calculator',
    'ht-readiness',
    'ht-template',
    'transition-calculator'
  )
);

-- Atualizar comentário da coluna
COMMENT ON COLUMN public.lead_magnet_results.lead_magnet_type IS
'Tipo do lead magnet:
  - maturity-diagnostic: Diagnóstico de Maturidade de Ecossistema (NOVO)
  - stop-launching-simulator: Simulador "E Se Você Parar de Lançar" (NOVO)
  - ecosystem-blueprint: Blueprint de Ecossistema (NOVO)
  - ecosystem-calculator: [DEPRECATED] Calculadora de Ecossistema → substituído por maturity-diagnostic
  - ht-readiness: [DEPRECATED] Diagnóstico High Ticket → substituído por maturity-diagnostic
  - ht-template: [DEPRECATED] Template High Ticket → será substituído por ecosystem-blueprint
  - transition-calculator: [DEPRECATED] Calculadora de Transição → será substituído por stop-launching-simulator';

-- ============================================================================
-- FUNÇÃO: Mapeia novos lead magnets para stages do pipeline
-- Atualiza a função de sync para suportar o novo maturity-diagnostic
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_lead_magnet_to_contact()
RETURNS TRIGGER AS $$
DECLARE
  v_contact_id UUID;
  v_contact_org_id UUID;
  v_pipeline_id UUID;
  v_stage_id UUID;
  v_score INTEGER;
  v_maturity_level TEXT;
BEGIN
  -- Buscar ou criar contato
  SELECT id INTO v_contact_id
  FROM public.contacts
  WHERE email = lower(trim(NEW.respondent_email));

  IF v_contact_id IS NULL THEN
    INSERT INTO public.contacts (
      email,
      full_name,
      source,
      source_detail,
      created_at
    )
    VALUES (
      lower(trim(NEW.respondent_email)),
      COALESCE(NEW.respondent_name, split_part(NEW.respondent_email, '@', 1)),
      'lead_magnet',
      NEW.lead_magnet_type,
      NEW.created_at
    )
    RETURNING id INTO v_contact_id;
  ELSE
    -- Atualizar source_detail se já existe
    UPDATE public.contacts
    SET
      full_name = COALESCE(full_name, NEW.respondent_name),
      source_detail = COALESCE(source_detail, '') ||
        CASE WHEN source_detail IS NULL OR source_detail = ''
          THEN NEW.lead_magnet_type
          ELSE ',' || NEW.lead_magnet_type
        END,
      updated_at = now()
    WHERE id = v_contact_id;
  END IF;

  -- Buscar ou criar contact_org
  SELECT id INTO v_contact_org_id
  FROM public.contact_orgs
  WHERE contact_id = v_contact_id
    AND organization_id = NEW.organization_id;

  IF v_contact_org_id IS NULL THEN
    INSERT INTO public.contact_orgs (
      contact_id,
      organization_id,
      score,
      status,
      source,
      score_breakdown
    )
    VALUES (
      v_contact_id,
      NEW.organization_id,
      COALESCE(NEW.total_score, 0),
      'active',
      'lead_magnet_' || NEW.lead_magnet_type,
      NEW.score_breakdown
    )
    RETURNING id INTO v_contact_org_id;
  ELSE
    -- Atualizar score se maior
    UPDATE public.contact_orgs
    SET
      score = GREATEST(COALESCE(score, 0), COALESCE(NEW.total_score, 0)),
      score_breakdown = COALESCE(NEW.score_breakdown, score_breakdown),
      updated_at = now()
    WHERE id = v_contact_org_id;
  END IF;

  -- Adicionar ao pipeline de lead magnet (se existir)
  SELECT id INTO v_pipeline_id
  FROM public.pipelines
  WHERE organization_id = NEW.organization_id
    AND name = 'kosmos_score_leads'
    AND is_active = true;

  IF v_pipeline_id IS NOT NULL THEN
    -- Determinar stage baseado no tipo de lead magnet e score
    v_score := COALESCE(NEW.total_score, 0);

    -- Para maturity-diagnostic, usar o score_level (nível 1-5)
    IF NEW.lead_magnet_type = 'maturity-diagnostic' THEN
      v_maturity_level := COALESCE(NEW.score_level, '1');

      SELECT id INTO v_stage_id
      FROM public.pipeline_stages
      WHERE pipeline_id = v_pipeline_id
        AND name = CASE
          WHEN v_maturity_level IN ('4', '5') THEN 'high_score'
          WHEN v_maturity_level = '3' THEN 'medium_score'
          ELSE 'low_score'
        END;
    ELSE
      -- Lógica original para outros lead magnets
      SELECT id INTO v_stage_id
      FROM public.pipeline_stages
      WHERE pipeline_id = v_pipeline_id
        AND name = CASE
          WHEN v_score < 40 THEN 'low_score'
          WHEN v_score < 70 THEN 'medium_score'
          ELSE 'high_score'
        END;
    END IF;

    -- Fallback para 'captured'
    IF v_stage_id IS NULL THEN
      SELECT id INTO v_stage_id
      FROM public.pipeline_stages
      WHERE pipeline_id = v_pipeline_id AND name = 'captured';
    END IF;

    IF v_stage_id IS NOT NULL THEN
      INSERT INTO public.contact_pipeline_positions (
        contact_org_id,
        pipeline_id,
        stage_id
      ) VALUES (
        v_contact_org_id,
        v_pipeline_id,
        v_stage_id
      )
      ON CONFLICT (contact_org_id, pipeline_id) DO UPDATE SET
        stage_id = EXCLUDED.stage_id,
        entered_stage_at = now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ÍNDICE ADICIONAL: score_level para filtros rápidos
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_lead_magnet_results_score_level
  ON public.lead_magnet_results(score_level)
  WHERE score_level IS NOT NULL;
