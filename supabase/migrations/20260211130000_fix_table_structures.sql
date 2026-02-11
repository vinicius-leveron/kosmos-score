-- 20260211130000_fix_table_structures.sql
-- Corrigir estruturas das tabelas e colunas

-- ============================================================================
-- 1. VERIFICAR E CORRIGIR TABELA ORGANIZATIONS
-- ============================================================================

-- Verificar se as colunas antigas existem e renomear para o padrão correto
DO $$ 
BEGIN
  -- organization_name -> name
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'organization_name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.organizations 
    RENAME COLUMN organization_name TO name;
    RAISE NOTICE 'Renamed organization_name to name';
  END IF;
  
  -- organization_slug -> slug
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'organization_slug'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.organizations 
    RENAME COLUMN organization_slug TO slug;
    RAISE NOTICE 'Renamed organization_slug to slug';
  END IF;
  
  -- organization_type -> type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'organization_type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'type'
  ) THEN
    ALTER TABLE public.organizations 
    RENAME COLUMN organization_type TO type;
    RAISE NOTICE 'Renamed organization_type to type';
  END IF;

  -- Se nenhuma das colunas existe, criar com os nomes corretos
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name IN ('name', 'organization_name')
  ) THEN
    ALTER TABLE public.organizations 
    ADD COLUMN name TEXT NOT NULL DEFAULT 'Unnamed Organization';
    RAISE NOTICE 'Added name column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name IN ('slug', 'organization_slug')
  ) THEN
    ALTER TABLE public.organizations 
    ADD COLUMN slug TEXT;
    UPDATE public.organizations 
    SET slug = LOWER(REPLACE(COALESCE(name, 'org'), ' ', '-')) || '-' || LEFT(id::text, 8)
    WHERE slug IS NULL;
    ALTER TABLE public.organizations 
    ALTER COLUMN slug SET NOT NULL;
    RAISE NOTICE 'Added slug column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name IN ('type', 'organization_type')
  ) THEN
    ALTER TABLE public.organizations 
    ADD COLUMN type TEXT DEFAULT 'client';
    RAISE NOTICE 'Added type column';
  END IF;
END $$;

-- ============================================================================
-- 2. GARANTIR QUE PIPELINES TEM ORGANIZATION_ID
-- ============================================================================

DO $$ 
BEGIN
  -- Se a coluna não existe, a migration anterior não rodou
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pipelines' 
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.pipelines 
    ADD COLUMN organization_id UUID;
    
    -- Preencher com KOSMOS org como fallback
    UPDATE public.pipelines 
    SET organization_id = '00000000-0000-0000-0000-000000000000'::uuid
    WHERE organization_id IS NULL;
    
    ALTER TABLE public.pipelines 
    ALTER COLUMN organization_id SET NOT NULL;
    
    -- Só adicionar FK se a constraint não existe
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'pipelines' 
      AND constraint_name = 'pipelines_organization_id_fkey'
    ) THEN
      ALTER TABLE public.pipelines
      ADD CONSTRAINT pipelines_organization_id_fkey
      FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
    
    CREATE INDEX IF NOT EXISTS idx_pipelines_organization 
    ON public.pipelines(organization_id);
    
    RAISE NOTICE 'Added organization_id to pipelines';
  END IF;
END $$;

-- ============================================================================
-- 3. GARANTIR QUE PIPELINE_STAGES TEM ORGANIZATION_ID
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pipeline_stages' 
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.pipeline_stages 
    ADD COLUMN organization_id UUID;
    
    -- Preencher baseado na pipeline
    UPDATE public.pipeline_stages ps
    SET organization_id = p.organization_id
    FROM public.pipelines p
    WHERE ps.pipeline_id = p.id
    AND ps.organization_id IS NULL;
    
    -- Se ainda houver nulls, usar KOSMOS
    UPDATE public.pipeline_stages
    SET organization_id = '00000000-0000-0000-0000-000000000000'::uuid
    WHERE organization_id IS NULL;
    
    ALTER TABLE public.pipeline_stages 
    ALTER COLUMN organization_id SET NOT NULL;
    
    -- Só adicionar FK se não existe
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'pipeline_stages' 
      AND constraint_name = 'pipeline_stages_organization_id_fkey'
    ) THEN
      ALTER TABLE public.pipeline_stages
      ADD CONSTRAINT pipeline_stages_organization_id_fkey
      FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
    
    CREATE INDEX IF NOT EXISTS idx_pipeline_stages_organization 
    ON public.pipeline_stages(organization_id);
    
    RAISE NOTICE 'Added organization_id to pipeline_stages';
  END IF;
END $$;

-- ============================================================================
-- 4. GARANTIR QUE CONTACT_PIPELINE_POSITIONS TEM ORGANIZATION_ID
-- ============================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contact_pipeline_positions' 
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.contact_pipeline_positions 
    ADD COLUMN organization_id UUID;
    
    -- Preencher baseado no contact_org
    UPDATE public.contact_pipeline_positions cpp
    SET organization_id = co.organization_id
    FROM public.contact_orgs co
    WHERE cpp.contact_org_id = co.id
    AND cpp.organization_id IS NULL;
    
    -- Se ainda houver nulls, deletar (dados órfãos)
    DELETE FROM public.contact_pipeline_positions
    WHERE organization_id IS NULL;
    
    ALTER TABLE public.contact_pipeline_positions 
    ALTER COLUMN organization_id SET NOT NULL;
    
    -- Só adicionar FK se não existe
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'contact_pipeline_positions' 
      AND constraint_name = 'contact_pipeline_positions_organization_id_fkey'
    ) THEN
      ALTER TABLE public.contact_pipeline_positions
      ADD CONSTRAINT contact_pipeline_positions_organization_id_fkey
      FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
    
    CREATE INDEX IF NOT EXISTS idx_contact_pipeline_positions_organization 
    ON public.contact_pipeline_positions(organization_id);
    
    RAISE NOTICE 'Added organization_id to contact_pipeline_positions';
  END IF;
END $$;

-- ============================================================================
-- 5. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================================================

ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_pipeline_positions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. RECRIAR POLICIES USANDO FUNÇÃO HELPER
-- ============================================================================

-- Dropar policies antigas primeiro
DO $$
BEGIN
  -- Pipelines
  DROP POLICY IF EXISTS "pipelines_org_select" ON public.pipelines;
  DROP POLICY IF EXISTS "pipelines_org_insert" ON public.pipelines;
  DROP POLICY IF EXISTS "pipelines_org_update" ON public.pipelines;
  DROP POLICY IF EXISTS "pipelines_org_delete" ON public.pipelines;
  
  -- Pipeline stages
  DROP POLICY IF EXISTS "pipeline_stages_org_select" ON public.pipeline_stages;
  DROP POLICY IF EXISTS "pipeline_stages_org_insert" ON public.pipeline_stages;
  DROP POLICY IF EXISTS "pipeline_stages_org_update" ON public.pipeline_stages;
  DROP POLICY IF EXISTS "pipeline_stages_org_delete" ON public.pipeline_stages;
  
  -- Contact pipeline positions
  DROP POLICY IF EXISTS "contact_pipeline_positions_org_select" ON public.contact_pipeline_positions;
  DROP POLICY IF EXISTS "contact_pipeline_positions_org_insert" ON public.contact_pipeline_positions;
  DROP POLICY IF EXISTS "contact_pipeline_positions_org_update" ON public.contact_pipeline_positions;
  DROP POLICY IF EXISTS "contact_pipeline_positions_org_delete" ON public.contact_pipeline_positions;
END $$;

-- Recriar usando a função helper que já existe
DO $$
BEGIN
  -- Pipelines policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pipelines' 
    AND policyname = 'pipelines_org_access'
  ) THEN
    CREATE POLICY "pipelines_org_access" ON public.pipelines
      FOR ALL USING (
        organization_id = ANY(public.get_user_organization_ids())
      );
  END IF;
  
  -- Pipeline stages policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pipeline_stages' 
    AND policyname = 'pipeline_stages_org_access'
  ) THEN
    CREATE POLICY "pipeline_stages_org_access" ON public.pipeline_stages
      FOR ALL USING (
        organization_id = ANY(public.get_user_organization_ids())
      );
  END IF;
  
  -- Contact pipeline positions policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_pipeline_positions' 
    AND policyname = 'contact_pipeline_positions_org_access'
  ) THEN
    CREATE POLICY "contact_pipeline_positions_org_access" ON public.contact_pipeline_positions
      FOR ALL USING (
        organization_id = ANY(public.get_user_organization_ids())
      );
  END IF;
END $$;

-- ============================================================================
-- 7. CRIAR PIPELINE DEFAULT PARA ORGANIZAÇÕES EXISTENTES
-- ============================================================================

DO $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Para cada organização que não tem pipeline
  FOR v_org_id IN 
    SELECT o.id 
    FROM public.organizations o
    WHERE NOT EXISTS (
      SELECT 1 FROM public.pipelines p 
      WHERE p.organization_id = o.id
    )
  LOOP
    -- Criar pipeline default
    INSERT INTO public.pipelines (
      id,
      organization_id,
      name,
      description,
      is_default,
      is_active,
      position
    )
    VALUES (
      gen_random_uuid(),
      v_org_id,
      'Pipeline Principal',
      'Pipeline de vendas principal',
      true,
      true,
      0
    );
    
    RAISE NOTICE 'Created default pipeline for organization %', v_org_id;
  END LOOP;
END $$;

-- ============================================================================
-- MENSAGEM FINAL
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Fixed organizations table column names';
  RAISE NOTICE '✅ Added organization_id to all pipeline tables';
  RAISE NOTICE '✅ RLS enabled on all pipeline tables';
  RAISE NOTICE '✅ Policies recreated using helper function';
  RAISE NOTICE '✅ Default KOSMOS organization ensured';
END $$;