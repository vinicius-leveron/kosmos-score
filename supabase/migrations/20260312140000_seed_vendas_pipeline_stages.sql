-- ============================================================================
-- KOSMOS Platform - Seed Vendas Pipeline Stages
-- ============================================================================
-- Cria estágios padrão para venda de consultoria em call
-- ============================================================================

DO $$
DECLARE
  v_pipeline_id UUID;
  v_org_id UUID;
BEGIN
  -- Buscar pipeline Vendas
  SELECT id, organization_id INTO v_pipeline_id, v_org_id
  FROM public.pipelines
  WHERE display_name = 'Vendas' OR name = 'sales'
  LIMIT 1;

  IF v_pipeline_id IS NULL THEN
    RAISE NOTICE 'Pipeline Vendas nao encontrado';
    RETURN;
  END IF;

  RAISE NOTICE 'Criando estagios para pipeline: % (org: %)', v_pipeline_id, v_org_id;

  -- Limpar estágios existentes (caso existam órfãos)
  DELETE FROM public.pipeline_stages WHERE pipeline_id = v_pipeline_id;

  -- 1. Lead (Entry Stage)
  INSERT INTO public.pipeline_stages (
    pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage
  ) VALUES (
    v_pipeline_id, v_org_id, 'lead', 'Lead', 0, '#3B82F6', true, false
  );

  -- 2. Qualificação
  INSERT INTO public.pipeline_stages (
    pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage
  ) VALUES (
    v_pipeline_id, v_org_id, 'qualificacao', 'Qualificação', 1, '#F59E0B', false, false
  );

  -- 3. Discovery Call
  INSERT INTO public.pipeline_stages (
    pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage
  ) VALUES (
    v_pipeline_id, v_org_id, 'discovery_call', 'Discovery Call', 2, '#8B5CF6', false, false
  );

  -- 4. Proposta
  INSERT INTO public.pipeline_stages (
    pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage
  ) VALUES (
    v_pipeline_id, v_org_id, 'proposta', 'Proposta', 3, '#EC4899', false, false
  );

  -- 5. Negociação
  INSERT INTO public.pipeline_stages (
    pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage
  ) VALUES (
    v_pipeline_id, v_org_id, 'negociacao', 'Negociação', 4, '#06B6D4', false, false
  );

  -- 6. Fechado Ganho (Exit Stage - Positive)
  INSERT INTO public.pipeline_stages (
    pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage, exit_type
  ) VALUES (
    v_pipeline_id, v_org_id, 'fechado_ganho', 'Fechado Ganho', 5, '#10B981', false, true, 'positive'
  );

  -- 7. Fechado Perdido (Exit Stage - Negative)
  INSERT INTO public.pipeline_stages (
    pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage, exit_type
  ) VALUES (
    v_pipeline_id, v_org_id, 'fechado_perdido', 'Fechado Perdido', 6, '#EF4444', false, true, 'negative'
  );

  RAISE NOTICE 'Estagios criados com sucesso!';
END $$;

-- ============================================================================
-- Verificação
-- ============================================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== Estagios do Pipeline Vendas ===';
  FOR r IN
    SELECT ps.position, ps.display_name, ps.color, ps.is_entry_stage, ps.is_exit_stage, ps.exit_type
    FROM public.pipeline_stages ps
    JOIN public.pipelines p ON p.id = ps.pipeline_id
    WHERE p.display_name = 'Vendas' OR p.name = 'sales'
    ORDER BY ps.position
  LOOP
    RAISE NOTICE '% - % (entry: %, exit: %, type: %)',
      r.position, r.display_name, r.is_entry_stage, r.is_exit_stage, COALESCE(r.exit_type::text, '-');
  END LOOP;
END $$;
