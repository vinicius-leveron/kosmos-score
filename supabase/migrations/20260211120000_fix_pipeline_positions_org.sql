-- 20260211120000_fix_pipeline_positions_org.sql
-- Adicionar organization_id em contact_pipeline_positions para melhor isolamento

-- ============================================================================
-- 1. ADICIONAR COLUNA ORGANIZATION_ID
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contact_pipeline_positions' 
    AND column_name = 'organization_id'
  ) THEN
    -- Adicionar coluna
    ALTER TABLE public.contact_pipeline_positions 
    ADD COLUMN organization_id UUID;
    
    -- Preencher com dados existentes baseado no contact_orgs
    UPDATE public.contact_pipeline_positions cpp
    SET organization_id = co.organization_id
    FROM public.contact_orgs co
    WHERE cpp.contact_org_id = co.id
    AND cpp.organization_id IS NULL;
    
    -- Tornar NOT NULL após preencher
    ALTER TABLE public.contact_pipeline_positions
    ALTER COLUMN organization_id SET NOT NULL;
    
    -- Adicionar foreign key
    ALTER TABLE public.contact_pipeline_positions
    ADD CONSTRAINT contact_pipeline_positions_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
    
    -- Criar índice para performance
    CREATE INDEX IF NOT EXISTS idx_contact_pipeline_positions_org
    ON public.contact_pipeline_positions(organization_id);
    
    RAISE NOTICE 'Added organization_id to contact_pipeline_positions';
  END IF;
END $$;

-- ============================================================================
-- 2. RECRIAR POLICIES COM ORGANIZATION_ID
-- ============================================================================

-- Remover policies antigas
DROP POLICY IF EXISTS "contact_pipeline_positions_select" ON public.contact_pipeline_positions;
DROP POLICY IF EXISTS "contact_pipeline_positions_insert" ON public.contact_pipeline_positions;
DROP POLICY IF EXISTS "contact_pipeline_positions_update" ON public.contact_pipeline_positions;
DROP POLICY IF EXISTS "contact_pipeline_positions_delete" ON public.contact_pipeline_positions;

-- Criar novas policies usando organization_id diretamente
CREATE POLICY "contact_pipeline_positions_org_select" ON public.contact_pipeline_positions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members 
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "contact_pipeline_positions_org_insert" ON public.contact_pipeline_positions
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.org_members 
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "contact_pipeline_positions_org_update" ON public.contact_pipeline_positions
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members 
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "contact_pipeline_positions_org_delete" ON public.contact_pipeline_positions
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members 
      WHERE profile_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. ADICIONAR ORGANIZAÇÃO EM PIPELINES (SE NÃO EXISTIR)
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pipelines' 
    AND column_name = 'organization_id'
  ) THEN
    -- Adicionar coluna
    ALTER TABLE public.pipelines 
    ADD COLUMN organization_id UUID;
    
    -- Preencher com dados existentes (assumir KOSMOS por enquanto)
    UPDATE public.pipelines
    SET organization_id = '00000000-0000-0000-0000-000000000000'::uuid
    WHERE organization_id IS NULL;
    
    -- Tornar NOT NULL
    ALTER TABLE public.pipelines
    ALTER COLUMN organization_id SET NOT NULL;
    
    -- Adicionar foreign key
    ALTER TABLE public.pipelines
    ADD CONSTRAINT pipelines_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
    
    -- Criar índice
    CREATE INDEX IF NOT EXISTS idx_pipelines_org
    ON public.pipelines(organization_id);
    
    RAISE NOTICE 'Added organization_id to pipelines';
  END IF;
END $$;

-- ============================================================================
-- 4. ADICIONAR ORGANIZAÇÃO EM PIPELINE_STAGES (SE NÃO EXISTIR)
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pipeline_stages' 
    AND column_name = 'organization_id'
  ) THEN
    -- Adicionar coluna
    ALTER TABLE public.pipeline_stages 
    ADD COLUMN organization_id UUID;
    
    -- Preencher com dados da pipeline
    UPDATE public.pipeline_stages ps
    SET organization_id = p.organization_id
    FROM public.pipelines p
    WHERE ps.pipeline_id = p.id
    AND ps.organization_id IS NULL;
    
    -- Tornar NOT NULL
    ALTER TABLE public.pipeline_stages
    ALTER COLUMN organization_id SET NOT NULL;
    
    -- Adicionar foreign key
    ALTER TABLE public.pipeline_stages
    ADD CONSTRAINT pipeline_stages_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
    
    -- Criar índice
    CREATE INDEX IF NOT EXISTS idx_pipeline_stages_org
    ON public.pipeline_stages(organization_id);
    
    RAISE NOTICE 'Added organization_id to pipeline_stages';
  END IF;
END $$;

-- ============================================================================
-- 5. RECRIAR POLICIES PARA PIPELINES E STAGES
-- ============================================================================

-- Pipelines policies
DROP POLICY IF EXISTS "pipelines_select" ON public.pipelines;
DROP POLICY IF EXISTS "pipelines_insert" ON public.pipelines;
DROP POLICY IF EXISTS "pipelines_update" ON public.pipelines;
DROP POLICY IF EXISTS "pipelines_delete" ON public.pipelines;

CREATE POLICY "pipelines_org_select" ON public.pipelines
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members 
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "pipelines_org_insert" ON public.pipelines
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.org_members 
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "pipelines_org_update" ON public.pipelines
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members 
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "pipelines_org_delete" ON public.pipelines
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members 
      WHERE profile_id = auth.uid()
    )
  );

-- Pipeline stages policies
DROP POLICY IF EXISTS "pipeline_stages_select" ON public.pipeline_stages;
DROP POLICY IF EXISTS "pipeline_stages_insert" ON public.pipeline_stages;
DROP POLICY IF EXISTS "pipeline_stages_update" ON public.pipeline_stages;
DROP POLICY IF EXISTS "pipeline_stages_delete" ON public.pipeline_stages;

CREATE POLICY "pipeline_stages_org_select" ON public.pipeline_stages
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members 
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "pipeline_stages_org_insert" ON public.pipeline_stages
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.org_members 
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "pipeline_stages_org_update" ON public.pipeline_stages
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members 
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "pipeline_stages_org_delete" ON public.pipeline_stages
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members 
      WHERE profile_id = auth.uid()
    )
  );

-- ============================================================================
-- MENSAGEM FINAL
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Pipeline positions now have organization_id';
  RAISE NOTICE '✅ All pipeline tables have proper multi-tenant isolation';
  RAISE NOTICE '✅ RLS policies updated for direct organization filtering';
  RAISE NOTICE '✅ Performance indexes created';
END $$;