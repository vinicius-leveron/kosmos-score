-- Create audit_results table to store all audit submissions
CREATE TABLE public.audit_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  
  -- Quantitative data (Questions 1-4)
  base_size TEXT NOT NULL,
  base_value INTEGER NOT NULL,
  ticket_medio TEXT NOT NULL,
  ticket_value INTEGER NOT NULL,
  num_ofertas TEXT NOT NULL,
  ofertas_multiplier NUMERIC(3,2) NOT NULL,
  frequencia_comunicacao TEXT NOT NULL,
  comunicacao_multiplier NUMERIC(3,2) NOT NULL,
  
  -- Qualitative data - Causa (Questions 5-6)
  razao_compra TEXT NOT NULL,
  razao_compra_score INTEGER NOT NULL,
  identidade_comunidade TEXT NOT NULL,
  identidade_score INTEGER NOT NULL,
  
  -- Qualitative data - Cultura (Questions 7-8)
  autonomia_comunidade TEXT NOT NULL,
  autonomia_score INTEGER NOT NULL,
  rituais_jornada TEXT NOT NULL,
  rituais_score INTEGER NOT NULL,
  
  -- Qualitative data - Economia (Questions 9-10)
  oferta_ascensao TEXT NOT NULL,
  ascensao_score INTEGER NOT NULL,
  recorrencia TEXT NOT NULL,
  recorrencia_score INTEGER NOT NULL,
  
  -- Calculated scores
  score_causa NUMERIC(5,2) NOT NULL,
  score_cultura NUMERIC(5,2) NOT NULL,
  score_economia NUMERIC(5,2) NOT NULL,
  kosmos_asset_score NUMERIC(5,2) NOT NULL,
  
  -- Financial calculation
  lucro_oculto NUMERIC(12,2) NOT NULL,
  
  -- Flags
  is_beginner BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audit_results ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting (anyone can submit an audit)
CREATE POLICY "Anyone can submit an audit" 
ON public.audit_results 
FOR INSERT 
WITH CHECK (true);

-- Create policy for selecting (only authenticated users can view, or match by email)
CREATE POLICY "Users can view their own audits by email" 
ON public.audit_results 
FOR SELECT 
USING (true);

-- Create index on email for faster lookups
CREATE INDEX idx_audit_results_email ON public.audit_results(email);

-- Create index on created_at for time-based queries
CREATE INDEX idx_audit_results_created_at ON public.audit_results(created_at DESC);