-- ============================================================================
-- KOSMOS Platform - Pipeline Direct Entry + Stage Sync
-- ============================================================================
-- 1. Adiciona estágios de prospecção no início do pipeline Vendas
-- 2. Modifica trigger para lead entrar direto no pipeline (não espera replied)
-- 3. Cria sync: mover card no Kanban atualiza cadence_status
-- ============================================================================

-- ============================================================================
-- 1. REORDENAR ESTÁGIOS EXISTENTES (shift +3 positions)
-- ============================================================================

DO $$
DECLARE
  v_pipeline_id UUID;
BEGIN
  -- Buscar pipeline Vendas
  SELECT id INTO v_pipeline_id
  FROM public.pipelines
  WHERE display_name = 'Vendas' OR name = 'sales'
  LIMIT 1;

  IF v_pipeline_id IS NULL THEN
    RAISE NOTICE 'Pipeline Vendas nao encontrado';
    RETURN;
  END IF;

  RAISE NOTICE 'Reordenando estagios do pipeline: %', v_pipeline_id;

  -- Shift all existing stages by +3 positions
  UPDATE public.pipeline_stages
  SET position = position + 3
  WHERE pipeline_id = v_pipeline_id;

  -- Unmark old entry stage
  UPDATE public.pipeline_stages
  SET is_entry_stage = false
  WHERE pipeline_id = v_pipeline_id AND is_entry_stage = true;
END $$;

-- ============================================================================
-- 2. INSERIR NOVOS ESTÁGIOS DE PROSPECÇÃO
-- ============================================================================

DO $$
DECLARE
  v_pipeline_id UUID;
  v_org_id UUID;
BEGIN
  SELECT id, organization_id INTO v_pipeline_id, v_org_id
  FROM public.pipelines
  WHERE display_name = 'Vendas' OR name = 'sales'
  LIMIT 1;

  IF v_pipeline_id IS NULL THEN
    RAISE NOTICE 'Pipeline Vendas nao encontrado';
    RETURN;
  END IF;

  -- 0. Prospecção (ENTRY STAGE)
  INSERT INTO public.pipeline_stages (
    pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage
  ) VALUES (
    v_pipeline_id, v_org_id, 'prospeccao', 'Prospecção', 0, '#94A3B8', true, false
  ) ON CONFLICT (pipeline_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    position = EXCLUDED.position,
    color = EXCLUDED.color,
    is_entry_stage = EXCLUDED.is_entry_stage;

  -- 1. Primeiro Contato
  INSERT INTO public.pipeline_stages (
    pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage
  ) VALUES (
    v_pipeline_id, v_org_id, 'primeiro_contato', '1º Contato', 1, '#60A5FA', false, false
  ) ON CONFLICT (pipeline_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    position = EXCLUDED.position,
    color = EXCLUDED.color;

  -- 2. Respondeu
  INSERT INTO public.pipeline_stages (
    pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage
  ) VALUES (
    v_pipeline_id, v_org_id, 'respondeu', 'Respondeu', 2, '#22C55E', false, false
  ) ON CONFLICT (pipeline_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    position = EXCLUDED.position,
    color = EXCLUDED.color;

  RAISE NOTICE 'Novos estagios criados: Prospeccao, 1o Contato, Respondeu';
END $$;

-- ============================================================================
-- 3. ATUALIZAR TRIGGER: LEAD ENTRA DIRETO NO PIPELINE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_outbound_to_pipeline()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_pipeline_id UUID;
  v_entry_stage_id UUID;
  v_contact_name TEXT;
  v_company_id UUID;
BEGIN
  -- ============================================
  -- NOVA LÓGICA: Disparar quando cadence_status é definido (INSERT ou UPDATE)
  -- ============================================

  -- Skip if no cadence_status (not an outbound contact)
  IF NEW.cadence_status IS NULL THEN
    RETURN NEW;
  END IF;

  -- Skip if status didn't change (for UPDATEs)
  IF TG_OP = 'UPDATE' AND OLD.cadence_status IS NOT DISTINCT FROM NEW.cadence_status THEN
    RETURN NEW;
  END IF;

  -- Resolve organization_id from tenant mapping
  IF NEW.tenant IS NOT NULL THEN
    SELECT organization_id INTO v_org_id
    FROM public.tenant_org_mapping
    WHERE tenant = NEW.tenant;
  END IF;

  IF v_org_id IS NULL THEN
    v_org_id := NEW.organization_id;
  END IF;

  -- ============================================
  -- Buscar pipeline específico do tenant
  -- ============================================
  IF NEW.tenant IS NOT NULL THEN
    SELECT tom.default_pipeline_id, s.id INTO v_pipeline_id, v_entry_stage_id
    FROM public.tenant_org_mapping tom
    JOIN public.pipeline_stages s ON s.pipeline_id = tom.default_pipeline_id AND s.is_entry_stage = true
    WHERE tom.tenant = NEW.tenant
      AND tom.default_pipeline_id IS NOT NULL;
  END IF;

  -- Fallback: Pipeline padrão da organização
  IF v_pipeline_id IS NULL THEN
    SELECT p.id, s.id INTO v_pipeline_id, v_entry_stage_id
    FROM public.pipelines p
    JOIN public.pipeline_stages s ON s.pipeline_id = p.id AND s.is_entry_stage = true
    WHERE p.organization_id = v_org_id
      AND p.is_default = true
      AND p.is_active = true
    LIMIT 1;
  END IF;

  IF v_pipeline_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- ============================================
  -- INSERIR NO PIPELINE (para qualquer cadence_status, não só replied)
  -- ============================================
  INSERT INTO public.contact_pipeline_positions (
    contact_org_id,
    pipeline_id,
    stage_id,
    entered_stage_at,
    entered_pipeline_at
  ) VALUES (
    NEW.id,
    v_pipeline_id,
    v_entry_stage_id,
    now(),
    now()
  )
  ON CONFLICT (contact_org_id, pipeline_id) DO NOTHING;

  -- ============================================
  -- CRIAR DEAL se status = 'converted'
  -- ============================================
  IF NEW.cadence_status = 'converted' THEN
    SELECT c.full_name INTO v_contact_name
    FROM public.contacts c
    WHERE c.id = NEW.contact_id;

    SELECT cc.company_id INTO v_company_id
    FROM public.contact_companies cc
    WHERE cc.contact_org_id = NEW.id
    LIMIT 1;

    IF v_company_id IS NOT NULL THEN
      INSERT INTO public.deals (
        organization_id,
        name,
        description,
        status,
        company_id,
        primary_contact_id,
        pipeline_id,
        stage_id,
        source
      ) VALUES (
        v_org_id,
        COALESCE('Deal - ' || v_contact_name, 'Deal - Outbound Lead'),
        'Deal criado automaticamente via Outbound Motor',
        'open',
        v_company_id,
        NEW.id,
        v_pipeline_id,
        v_entry_stage_id,
        'outbound'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. TRIGGER: SYNC KANBAN → CADENCE_STATUS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_pipeline_to_cadence_status()
RETURNS TRIGGER AS $$
DECLARE
  v_stage_name TEXT;
BEGIN
  -- Get the stage name
  SELECT name INTO v_stage_name
  FROM public.pipeline_stages
  WHERE id = NEW.stage_id;

  -- Update cadence_status based on stage
  IF v_stage_name = 'primeiro_contato' THEN
    UPDATE public.contact_orgs
    SET cadence_status = 'in_sequence'
    WHERE id = NEW.contact_org_id
      AND cadence_status IS NOT NULL;

  ELSIF v_stage_name = 'respondeu' THEN
    UPDATE public.contact_orgs
    SET cadence_status = 'replied'
    WHERE id = NEW.contact_org_id
      AND cadence_status IS NOT NULL;

  ELSIF v_stage_name = 'fechado_ganho' THEN
    UPDATE public.contact_orgs
    SET cadence_status = 'converted'
    WHERE id = NEW.contact_org_id
      AND cadence_status IS NOT NULL;

  ELSIF v_stage_name = 'fechado_perdido' THEN
    UPDATE public.contact_orgs
    SET cadence_status = 'archived'
    WHERE id = NEW.contact_org_id
      AND cadence_status IS NOT NULL;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on contact_pipeline_positions
DROP TRIGGER IF EXISTS trg_sync_pipeline_to_cadence ON public.contact_pipeline_positions;
CREATE TRIGGER trg_sync_pipeline_to_cadence
  AFTER UPDATE OF stage_id ON public.contact_pipeline_positions
  FOR EACH ROW
  WHEN (OLD.stage_id IS DISTINCT FROM NEW.stage_id)
  EXECUTE FUNCTION public.sync_pipeline_to_cadence_status();

-- ============================================================================
-- LOG
-- ============================================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== Pipeline Vendas - Novos Estagios ===';
  FOR r IN
    SELECT ps.position, ps.display_name, ps.is_entry_stage, ps.is_exit_stage
    FROM public.pipeline_stages ps
    JOIN public.pipelines p ON p.id = ps.pipeline_id
    WHERE p.display_name = 'Vendas' OR p.name = 'sales'
    ORDER BY ps.position
  LOOP
    RAISE NOTICE '% - % (entry: %, exit: %)', r.position, r.display_name, r.is_entry_stage, r.is_exit_stage;
  END LOOP;
END $$;
