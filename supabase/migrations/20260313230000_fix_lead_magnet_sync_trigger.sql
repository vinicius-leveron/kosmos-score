-- ============================================================================
-- Fix sync_lead_magnet_to_contact trigger for JSONB source_detail
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
      jsonb_build_object('lead_magnet_type', NEW.lead_magnet_type),
      NEW.created_at
    )
    RETURNING id INTO v_contact_id;
  ELSE
    -- Atualizar source_detail se já existe (merge JSONB)
    UPDATE public.contacts
    SET
      full_name = COALESCE(full_name, NEW.respondent_name),
      source_detail = COALESCE(source_detail, '{}'::jsonb) ||
        jsonb_build_object('lead_magnet_type', NEW.lead_magnet_type),
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

  -- Atualizar lead_magnet_results com contact_org_id
  UPDATE public.lead_magnet_results
  SET contact_org_id = v_contact_org_id
  WHERE id = NEW.id;

  -- Determinar estágio do pipeline baseado no lead magnet type
  IF NEW.lead_magnet_type IN ('maturity-diagnostic', 'raio-x-kosmos') THEN
    -- Buscar pipeline padrão
    SELECT id INTO v_pipeline_id
    FROM public.pipelines
    WHERE organization_id = NEW.organization_id
      AND is_default = true
      AND is_active = true
    LIMIT 1;

    IF v_pipeline_id IS NOT NULL THEN
      -- Buscar estágio de entrada
      SELECT id INTO v_stage_id
      FROM public.pipeline_stages
      WHERE pipeline_id = v_pipeline_id
        AND is_entry_stage = true
      LIMIT 1;

      IF v_stage_id IS NOT NULL THEN
        -- Inserir no pipeline (se não existir)
        INSERT INTO public.contact_pipeline_positions (
          contact_org_id,
          organization_id,
          pipeline_id,
          stage_id,
          entered_stage_at,
          entered_pipeline_at
        ) VALUES (
          v_contact_org_id,
          NEW.organization_id,
          v_pipeline_id,
          v_stage_id,
          now(),
          now()
        )
        ON CONFLICT (contact_org_id, pipeline_id) DO NOTHING;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que o trigger existe
DROP TRIGGER IF EXISTS trg_sync_lead_magnet_to_contact ON public.lead_magnet_results;
CREATE TRIGGER trg_sync_lead_magnet_to_contact
  AFTER INSERT ON public.lead_magnet_results
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_lead_magnet_to_contact();
