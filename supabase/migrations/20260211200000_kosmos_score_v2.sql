-- KOSMOS Score V2 Migration
-- Adds new columns for the restructured diagnostic (18 questions)

-- Add version column to track v1 vs v2 submissions
ALTER TABLE public.audit_results
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- BLOCO 1: PERFIL (New profile questions)
ALTER TABLE public.audit_results
ADD COLUMN IF NOT EXISTS business_category TEXT,
ADD COLUMN IF NOT EXISTS stage TEXT, -- 'construindo' | 'escalando' | 'consolidando'
ADD COLUMN IF NOT EXISTS niche TEXT,
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS time_selling TEXT;

-- BLOCO 2: New quantitative field
ALTER TABLE public.audit_results
ADD COLUMN IF NOT EXISTS monthly_revenue TEXT,
ADD COLUMN IF NOT EXISTS monthly_revenue_value INTEGER;

-- BLOCO 3: PILAR MOVIMENTO (renamed from CAUSA)
ALTER TABLE public.audit_results
ADD COLUMN IF NOT EXISTS referral_perception TEXT,
ADD COLUMN IF NOT EXISTS referral_perception_score INTEGER,
ADD COLUMN IF NOT EXISTS mission_identification TEXT,
ADD COLUMN IF NOT EXISTS mission_identification_score INTEGER;

-- Rename CAUSA to MOVIMENTO for V2
ALTER TABLE public.audit_results
ADD COLUMN IF NOT EXISTS score_movimento NUMERIC(5,2);

-- BLOCO 4: PILAR ESTRUTURA (renamed from CULTURA)
ALTER TABLE public.audit_results
ADD COLUMN IF NOT EXISTS member_interactions TEXT,
ADD COLUMN IF NOT EXISTS member_interactions_score INTEGER,
ADD COLUMN IF NOT EXISTS rituals_multi TEXT[], -- Array for multi-select
ADD COLUMN IF NOT EXISTS rituals_multi_score INTEGER;

-- Rename CULTURA to ESTRUTURA for V2
ALTER TABLE public.audit_results
ADD COLUMN IF NOT EXISTS score_estrutura NUMERIC(5,2);

-- BLOCO 6: VOZ DO CLIENTE (New open text questions)
ALTER TABLE public.audit_results
ADD COLUMN IF NOT EXISTS main_obstacle TEXT,
ADD COLUMN IF NOT EXISTS workshop_motivation TEXT;

-- Result profile (new classification system)
ALTER TABLE public.audit_results
ADD COLUMN IF NOT EXISTS result_profile TEXT; -- 'base_sem_estrutura' | 'base_construcao' | 'base_maturacao' | 'ativo_alta_performance'

-- Lucro oculto with ranges (not exact values)
ALTER TABLE public.audit_results
ADD COLUMN IF NOT EXISTS lucro_oculto_min INTEGER,
ADD COLUMN IF NOT EXISTS lucro_oculto_max INTEGER,
ADD COLUMN IF NOT EXISTS lucro_oculto_display TEXT;

-- Make old required columns nullable for V2 compatibility
-- (V2 doesn't use some of the V1 columns)
ALTER TABLE public.audit_results
ALTER COLUMN base_size DROP NOT NULL,
ALTER COLUMN base_value DROP NOT NULL,
ALTER COLUMN ticket_medio DROP NOT NULL,
ALTER COLUMN ticket_value DROP NOT NULL,
ALTER COLUMN num_ofertas DROP NOT NULL,
ALTER COLUMN ofertas_multiplier DROP NOT NULL,
ALTER COLUMN frequencia_comunicacao DROP NOT NULL,
ALTER COLUMN comunicacao_multiplier DROP NOT NULL,
ALTER COLUMN razao_compra DROP NOT NULL,
ALTER COLUMN razao_compra_score DROP NOT NULL,
ALTER COLUMN identidade_comunidade DROP NOT NULL,
ALTER COLUMN identidade_score DROP NOT NULL,
ALTER COLUMN autonomia_comunidade DROP NOT NULL,
ALTER COLUMN autonomia_score DROP NOT NULL,
ALTER COLUMN rituais_jornada DROP NOT NULL,
ALTER COLUMN rituais_score DROP NOT NULL,
ALTER COLUMN oferta_ascensao DROP NOT NULL,
ALTER COLUMN ascensao_score DROP NOT NULL,
ALTER COLUMN recorrencia DROP NOT NULL,
ALTER COLUMN recorrencia_score DROP NOT NULL,
ALTER COLUMN score_causa DROP NOT NULL,
ALTER COLUMN score_cultura DROP NOT NULL,
ALTER COLUMN score_economia DROP NOT NULL,
ALTER COLUMN kosmos_asset_score DROP NOT NULL,
ALTER COLUMN lucro_oculto DROP NOT NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_audit_results_version ON public.audit_results(version);
CREATE INDEX IF NOT EXISTS idx_audit_results_stage ON public.audit_results(stage);
CREATE INDEX IF NOT EXISTS idx_audit_results_business_category ON public.audit_results(business_category);
CREATE INDEX IF NOT EXISTS idx_audit_results_result_profile ON public.audit_results(result_profile);

-- Add comment for documentation
COMMENT ON COLUMN public.audit_results.version IS 'Version of the diagnostic: 1 = original 10 questions, 2 = new 18 questions';
COMMENT ON COLUMN public.audit_results.stage IS 'User stage: construindo, escalando, consolidando';
COMMENT ON COLUMN public.audit_results.score_movimento IS 'V2 pillar score - renamed from score_causa';
COMMENT ON COLUMN public.audit_results.score_estrutura IS 'V2 pillar score - renamed from score_cultura';
COMMENT ON COLUMN public.audit_results.result_profile IS 'V2 classification: base_sem_estrutura, base_construcao, base_maturacao, ativo_alta_performance';
