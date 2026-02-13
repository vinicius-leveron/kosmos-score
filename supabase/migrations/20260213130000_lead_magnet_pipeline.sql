-- ============================================================================
-- KOSMOS SCORE LEAD MAGNET PIPELINE
-- Pipeline para rastrear leads do KOSMOS Score
-- ============================================================================

DO $$
DECLARE
  v_kosmos_org_id UUID := 'c0000000-0000-0000-0000-000000000001';
  v_pipeline_id UUID;
BEGIN
  -- Criar pipeline de Lead Magnet KOSMOS Score
  INSERT INTO public.pipelines (
    organization_id,
    name,
    display_name,
    description,
    icon,
    color,
    position,
    is_default,
    is_active
  ) VALUES (
    v_kosmos_org_id,
    'kosmos_score_leads',
    'KOSMOS Score Leads',
    'Pipeline para leads capturados pelo KOSMOS Score',
    'target',
    '#F97316',
    10,
    false,
    true
  )
  ON CONFLICT (organization_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    is_active = true
  RETURNING id INTO v_pipeline_id;

  -- Se o pipeline já existia, pegar o ID
  IF v_pipeline_id IS NULL THEN
    SELECT id INTO v_pipeline_id
    FROM public.pipelines
    WHERE organization_id = v_kosmos_org_id AND name = 'kosmos_score_leads';
  END IF;

  -- Criar stages do pipeline de lead magnet
  INSERT INTO public.pipeline_stages (
    pipeline_id,
    organization_id,
    name,
    display_name,
    description,
    color,
    position,
    is_entry_stage,
    is_exit_stage,
    exit_type
  ) VALUES
    -- Stage 1: Lead Capturado (entrada automática após preencher o form)
    (v_pipeline_id, v_kosmos_org_id, 'captured', 'Lead Capturado',
     'Lead preencheu o formulário do KOSMOS Score', '#3B82F6', 0, true, false, NULL),

    -- Stage 2: Score Baixo (precisa de nurturing)
    (v_pipeline_id, v_kosmos_org_id, 'low_score', 'Score Baixo',
     'Lead com score abaixo de 40 - precisa de educação', '#EF4444', 1, false, false, NULL),

    -- Stage 3: Score Médio (potencial)
    (v_pipeline_id, v_kosmos_org_id, 'medium_score', 'Score Médio',
     'Lead com score entre 40-70 - potencial de conversão', '#F59E0B', 2, false, false, NULL),

    -- Stage 4: Score Alto (pronto para abordagem)
    (v_pipeline_id, v_kosmos_org_id, 'high_score', 'Score Alto',
     'Lead com score acima de 70 - pronto para contato', '#10B981', 3, false, false, NULL),

    -- Stage 5: Qualificado (MQL)
    (v_pipeline_id, v_kosmos_org_id, 'qualified', 'Qualificado (MQL)',
     'Lead qualificado para marketing - interesse confirmado', '#8B5CF6', 4, false, false, NULL),

    -- Stage 6: Oportunidade (SQL)
    (v_pipeline_id, v_kosmos_org_id, 'opportunity', 'Oportunidade (SQL)',
     'Lead qualificado para vendas - pronto para proposta', '#EC4899', 5, false, false, NULL),

    -- Stage 7: Convertido (ganho)
    (v_pipeline_id, v_kosmos_org_id, 'converted', 'Convertido',
     'Lead convertido em cliente', '#22C55E', 6, false, true, 'positive'),

    -- Stage 8: Perdido
    (v_pipeline_id, v_kosmos_org_id, 'lost', 'Perdido',
     'Lead não converteu ou desistiu', '#6B7280', 7, false, true, 'negative')
  ON CONFLICT (pipeline_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    position = EXCLUDED.position;

  RAISE NOTICE 'Pipeline KOSMOS Score Leads criado/atualizado com ID: %', v_pipeline_id;
END $$;

-- ============================================================================
-- FUNÇÃO PARA AUTO-ADICIONAR LEADS AO PIPELINE
-- Chamada quando um novo audit_result é criado com email
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_enroll_lead_in_pipeline()
RETURNS TRIGGER AS $$
DECLARE
  v_kosmos_org_id UUID := 'c0000000-0000-0000-0000-000000000001';
  v_pipeline_id UUID;
  v_stage_id UUID;
  v_contact_id UUID;
  v_contact_org_id UUID;
  v_score INTEGER;
BEGIN
  -- Só processar se tiver email
  IF NEW.respondent_email IS NULL OR NEW.respondent_email = '' THEN
    RETURN NEW;
  END IF;

  -- Buscar pipeline de lead magnet
  SELECT id INTO v_pipeline_id
  FROM public.pipelines
  WHERE organization_id = v_kosmos_org_id
    AND name = 'kosmos_score_leads'
    AND is_active = true;

  IF v_pipeline_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calcular score (0-100)
  v_score := COALESCE(NEW.total_score, 0);

  -- Determinar stage baseado no score
  SELECT id INTO v_stage_id
  FROM public.pipeline_stages
  WHERE pipeline_id = v_pipeline_id
    AND name = CASE
      WHEN v_score < 40 THEN 'low_score'
      WHEN v_score < 70 THEN 'medium_score'
      ELSE 'high_score'
    END;

  -- Se não encontrar stage por score, usar 'captured'
  IF v_stage_id IS NULL THEN
    SELECT id INTO v_stage_id
    FROM public.pipeline_stages
    WHERE pipeline_id = v_pipeline_id AND name = 'captured';
  END IF;

  -- Buscar ou criar contato
  SELECT id INTO v_contact_id
  FROM public.contacts
  WHERE email = NEW.respondent_email;

  IF v_contact_id IS NULL THEN
    INSERT INTO public.contacts (email, full_name, source, source_detail)
    VALUES (
      NEW.respondent_email,
      COALESCE(NEW.respondent_name, split_part(NEW.respondent_email, '@', 1)),
      'lead_magnet',
      'kosmos_score'
    )
    RETURNING id INTO v_contact_id;
  END IF;

  -- Buscar ou criar contact_org
  SELECT id INTO v_contact_org_id
  FROM public.contact_orgs
  WHERE contact_id = v_contact_id
    AND organization_id = v_kosmos_org_id;

  IF v_contact_org_id IS NULL THEN
    INSERT INTO public.contact_orgs (contact_id, organization_id, score, status)
    VALUES (v_contact_id, v_kosmos_org_id, v_score, 'active')
    RETURNING id INTO v_contact_org_id;
  ELSE
    -- Atualizar score se já existe
    UPDATE public.contact_orgs
    SET score = v_score, updated_at = now()
    WHERE id = v_contact_org_id;
  END IF;

  -- Adicionar ao pipeline (se ainda não estiver)
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
    stage_id = v_stage_id,
    entered_stage_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para auto-enroll
DROP TRIGGER IF EXISTS trigger_auto_enroll_lead ON public.audit_results;
CREATE TRIGGER trigger_auto_enroll_lead
  AFTER INSERT ON public.audit_results
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_enroll_lead_in_pipeline();

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON FUNCTION public.auto_enroll_lead_in_pipeline() IS
'Automaticamente adiciona leads do KOSMOS Score ao pipeline de lead magnet, classificando por score';
