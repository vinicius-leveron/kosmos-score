-- 20260213100000_financial_core.sql
-- Módulo Financeiro: Enums, Tabelas, Triggers, RLS
-- Mini-ERP financeiro para gestão de contas a pagar/receber, fluxo de caixa e DRE

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE financial_transaction_type AS ENUM ('receivable', 'payable');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE financial_transaction_status AS ENUM ('pending', 'paid', 'overdue', 'canceled', 'partially_paid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE financial_category_type AS ENUM ('revenue', 'expense', 'cost');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE financial_account_type AS ENUM ('checking', 'savings', 'cash', 'credit_card', 'investment', 'digital_wallet', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE financial_recurrence_frequency AS ENUM ('daily', 'weekly', 'biweekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE dre_group AS ENUM (
    'receita_bruta',
    'deducoes',
    'custos',
    'despesas_administrativas',
    'despesas_comerciais',
    'despesas_pessoal',
    'despesas_outras',
    'depreciacao_amortizacao',
    'resultado_financeiro',
    'impostos',
    'outras_receitas',
    'outras_despesas'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 2. TABELAS
-- ============================================================================

-- 2.1 Categorias financeiras (hierárquicas com mapeamento DRE)
CREATE TABLE IF NOT EXISTS public.financial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  type financial_category_type NOT NULL,
  dre_group dre_group NOT NULL,
  color TEXT DEFAULT '#6B7280',
  icon TEXT DEFAULT 'folder',
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.2 Contas bancárias / carteiras
CREATE TABLE IF NOT EXISTS public.financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type financial_account_type NOT NULL,
  bank_name TEXT,
  bank_branch TEXT,
  account_number TEXT,
  initial_balance NUMERIC(15,2) DEFAULT 0,
  current_balance NUMERIC(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.3 Centros de custo
CREATE TABLE IF NOT EXISTS public.financial_cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.4 Recorrências (templates)
CREATE TABLE IF NOT EXISTS public.financial_recurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  type financial_transaction_type NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  frequency financial_recurrence_frequency NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  next_due_date DATE,
  last_generated_date DATE,
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
  cost_center_id UUID REFERENCES public.financial_cost_centers(id) ON DELETE SET NULL,
  counterparty_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.5 Transações financeiras (tabela principal)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type financial_transaction_type NOT NULL,
  status financial_transaction_status DEFAULT 'pending',
  description TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  paid_amount NUMERIC(15,2) DEFAULT 0,
  due_date DATE NOT NULL,
  paid_date DATE,
  competence_date DATE NOT NULL,
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
  cost_center_id UUID REFERENCES public.financial_cost_centers(id) ON DELETE SET NULL,
  recurrence_id UUID REFERENCES public.financial_recurrences(id) ON DELETE SET NULL,
  -- CRM integration
  deal_id UUID,
  company_id UUID,
  contact_org_id UUID,
  -- Counterparty
  counterparty_name TEXT,
  counterparty_document TEXT,
  -- Document info
  document_number TEXT,
  document_type TEXT,
  -- Metadata
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

-- financial_categories
CREATE INDEX IF NOT EXISTS idx_financial_categories_org ON public.financial_categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_financial_categories_parent ON public.financial_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_financial_categories_type ON public.financial_categories(organization_id, type);

-- financial_accounts
CREATE INDEX IF NOT EXISTS idx_financial_accounts_org ON public.financial_accounts(organization_id);

-- financial_cost_centers
CREATE INDEX IF NOT EXISTS idx_financial_cost_centers_org ON public.financial_cost_centers(organization_id);

-- financial_recurrences
CREATE INDEX IF NOT EXISTS idx_financial_recurrences_org ON public.financial_recurrences(organization_id);
CREATE INDEX IF NOT EXISTS idx_financial_recurrences_next ON public.financial_recurrences(next_due_date) WHERE is_active = true;

-- financial_transactions
CREATE INDEX IF NOT EXISTS idx_financial_transactions_org ON public.financial_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_org_due ON public.financial_transactions(organization_id, due_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_org_status ON public.financial_transactions(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_org_competence ON public.financial_transactions(organization_id, competence_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_org_type ON public.financial_transactions(organization_id, type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON public.financial_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_account ON public.financial_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_recurrence ON public.financial_transactions(recurrence_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_deal ON public.financial_transactions(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_financial_transactions_overdue ON public.financial_transactions(organization_id, due_date) WHERE status = 'pending';

-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

-- 4.1 updated_at trigger (reutiliza função existente se disponível)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_financial_categories_updated_at
  BEFORE UPDATE ON public.financial_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_financial_accounts_updated_at
  BEFORE UPDATE ON public.financial_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_financial_cost_centers_updated_at
  BEFORE UPDATE ON public.financial_cost_centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_financial_recurrences_updated_at
  BEFORE UPDATE ON public.financial_recurrences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4.2 Auto-update transaction status based on paid_amount
CREATE OR REPLACE FUNCTION public.update_financial_transaction_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip if status is already canceled
  IF NEW.status = 'canceled' THEN
    RETURN NEW;
  END IF;

  -- Auto-determine status from paid_amount
  IF NEW.paid_amount >= NEW.amount THEN
    NEW.status = 'paid';
    IF NEW.paid_date IS NULL THEN
      NEW.paid_date = CURRENT_DATE;
    END IF;
  ELSIF NEW.paid_amount > 0 AND NEW.paid_amount < NEW.amount THEN
    NEW.status = 'partially_paid';
  ELSIF NEW.paid_amount = 0 OR NEW.paid_amount IS NULL THEN
    IF NEW.due_date < CURRENT_DATE THEN
      NEW.status = 'overdue';
    ELSE
      NEW.status = 'pending';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_financial_transaction_status
  BEFORE INSERT OR UPDATE OF paid_amount, due_date, status ON public.financial_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_financial_transaction_status();

-- 4.3 Update account balance when transaction payment changes
CREATE OR REPLACE FUNCTION public.update_account_balance_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  balance_delta NUMERIC(15,2);
  multiplier INTEGER;
BEGIN
  -- Only process if account_id is set and payment-related fields changed
  IF NEW.account_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Determine multiplier: receivable adds money, payable removes money
  IF NEW.type = 'receivable' THEN
    multiplier = 1;
  ELSE
    multiplier = -1;
  END IF;

  -- Calculate balance change
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'paid' OR NEW.status = 'partially_paid' THEN
      balance_delta = COALESCE(NEW.paid_amount, 0) * multiplier;
    ELSE
      balance_delta = 0;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Compute delta from old to new paid_amount
    balance_delta = (COALESCE(NEW.paid_amount, 0) - COALESCE(OLD.paid_amount, 0)) * multiplier;

    -- Handle account change: reverse old, apply new
    IF OLD.account_id IS NOT NULL AND OLD.account_id != NEW.account_id THEN
      -- Reverse the old amount from the old account
      UPDATE public.financial_accounts
      SET current_balance = current_balance - (COALESCE(OLD.paid_amount, 0) * multiplier)
      WHERE id = OLD.account_id;
      -- Apply full new amount to new account
      balance_delta = COALESCE(NEW.paid_amount, 0) * multiplier;
    END IF;
  END IF;

  -- Apply balance change
  IF balance_delta != 0 THEN
    UPDATE public.financial_accounts
    SET current_balance = current_balance + balance_delta
    WHERE id = NEW.account_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_account_balance
  AFTER INSERT OR UPDATE OF paid_amount, status, account_id ON public.financial_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_account_balance_on_payment();

-- Reverse balance on delete
CREATE OR REPLACE FUNCTION public.reverse_account_balance_on_delete()
RETURNS TRIGGER AS $$
DECLARE
  multiplier INTEGER;
BEGIN
  IF OLD.account_id IS NULL OR COALESCE(OLD.paid_amount, 0) = 0 THEN
    RETURN OLD;
  END IF;

  IF OLD.type = 'receivable' THEN
    multiplier = 1;
  ELSE
    multiplier = -1;
  END IF;

  UPDATE public.financial_accounts
  SET current_balance = current_balance - (OLD.paid_amount * multiplier)
  WHERE id = OLD.account_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_reverse_balance_on_delete
  AFTER DELETE ON public.financial_transactions
  FOR EACH ROW EXECUTE FUNCTION public.reverse_account_balance_on_delete();

-- ============================================================================
-- 5. RLS (Row Level Security)
-- ============================================================================

ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_recurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- financial_categories
CREATE POLICY "financial_categories_select"
ON public.financial_categories FOR SELECT
USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "financial_categories_insert"
ON public.financial_categories FOR INSERT
WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "financial_categories_update"
ON public.financial_categories FOR UPDATE
USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "financial_categories_delete"
ON public.financial_categories FOR DELETE
USING (organization_id = ANY(public.get_user_organization_ids()));

-- financial_accounts
CREATE POLICY "financial_accounts_select"
ON public.financial_accounts FOR SELECT
USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "financial_accounts_insert"
ON public.financial_accounts FOR INSERT
WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "financial_accounts_update"
ON public.financial_accounts FOR UPDATE
USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "financial_accounts_delete"
ON public.financial_accounts FOR DELETE
USING (organization_id = ANY(public.get_user_organization_ids()));

-- financial_cost_centers
CREATE POLICY "financial_cost_centers_select"
ON public.financial_cost_centers FOR SELECT
USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "financial_cost_centers_insert"
ON public.financial_cost_centers FOR INSERT
WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "financial_cost_centers_update"
ON public.financial_cost_centers FOR UPDATE
USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "financial_cost_centers_delete"
ON public.financial_cost_centers FOR DELETE
USING (organization_id = ANY(public.get_user_organization_ids()));

-- financial_recurrences
CREATE POLICY "financial_recurrences_select"
ON public.financial_recurrences FOR SELECT
USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "financial_recurrences_insert"
ON public.financial_recurrences FOR INSERT
WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "financial_recurrences_update"
ON public.financial_recurrences FOR UPDATE
USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "financial_recurrences_delete"
ON public.financial_recurrences FOR DELETE
USING (organization_id = ANY(public.get_user_organization_ids()));

-- financial_transactions
CREATE POLICY "financial_transactions_select"
ON public.financial_transactions FOR SELECT
USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "financial_transactions_insert"
ON public.financial_transactions FOR INSERT
WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "financial_transactions_update"
ON public.financial_transactions FOR UPDATE
USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "financial_transactions_delete"
ON public.financial_transactions FOR DELETE
USING (organization_id = ANY(public.get_user_organization_ids()));

-- ============================================================================
-- 6. VIEWS E FUNÇÕES AUXILIARES
-- ============================================================================

-- View de métricas do dashboard financeiro
CREATE OR REPLACE FUNCTION public.get_financial_dashboard_metrics(
  p_organization_id UUID,
  p_month DATE DEFAULT date_trunc('month', CURRENT_DATE)::DATE
)
RETURNS TABLE (
  revenue_month NUMERIC,
  expenses_month NUMERIC,
  profit_month NUMERIC,
  receivables_pending NUMERIC,
  receivables_overdue NUMERIC,
  receivables_overdue_count BIGINT,
  payables_pending NUMERIC,
  payables_overdue NUMERIC,
  payables_overdue_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Revenue this month (paid receivables)
    COALESCE(SUM(CASE WHEN t.type = 'receivable' AND t.status = 'paid'
      AND t.paid_date >= p_month AND t.paid_date < p_month + INTERVAL '1 month'
      THEN t.paid_amount ELSE 0 END), 0) AS revenue_month,
    -- Expenses this month (paid payables)
    COALESCE(SUM(CASE WHEN t.type = 'payable' AND t.status = 'paid'
      AND t.paid_date >= p_month AND t.paid_date < p_month + INTERVAL '1 month'
      THEN t.paid_amount ELSE 0 END), 0) AS expenses_month,
    -- Profit (revenue - expenses)
    COALESCE(SUM(CASE WHEN t.type = 'receivable' AND t.status = 'paid'
      AND t.paid_date >= p_month AND t.paid_date < p_month + INTERVAL '1 month'
      THEN t.paid_amount ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN t.type = 'payable' AND t.status = 'paid'
      AND t.paid_date >= p_month AND t.paid_date < p_month + INTERVAL '1 month'
      THEN t.paid_amount ELSE 0 END), 0) AS profit_month,
    -- Receivables pending
    COALESCE(SUM(CASE WHEN t.type = 'receivable' AND t.status IN ('pending', 'partially_paid')
      AND t.due_date >= CURRENT_DATE
      THEN t.amount - COALESCE(t.paid_amount, 0) ELSE 0 END), 0) AS receivables_pending,
    -- Receivables overdue
    COALESCE(SUM(CASE WHEN t.type = 'receivable' AND t.status IN ('pending', 'partially_paid', 'overdue')
      AND t.due_date < CURRENT_DATE
      THEN t.amount - COALESCE(t.paid_amount, 0) ELSE 0 END), 0) AS receivables_overdue,
    -- Receivables overdue count
    COUNT(CASE WHEN t.type = 'receivable' AND t.status IN ('pending', 'partially_paid', 'overdue')
      AND t.due_date < CURRENT_DATE THEN 1 END) AS receivables_overdue_count,
    -- Payables pending
    COALESCE(SUM(CASE WHEN t.type = 'payable' AND t.status IN ('pending', 'partially_paid')
      AND t.due_date >= CURRENT_DATE
      THEN t.amount - COALESCE(t.paid_amount, 0) ELSE 0 END), 0) AS payables_pending,
    -- Payables overdue
    COALESCE(SUM(CASE WHEN t.type = 'payable' AND t.status IN ('pending', 'partially_paid', 'overdue')
      AND t.due_date < CURRENT_DATE
      THEN t.amount - COALESCE(t.paid_amount, 0) ELSE 0 END), 0) AS payables_overdue,
    -- Payables overdue count
    COUNT(CASE WHEN t.type = 'payable' AND t.status IN ('pending', 'partially_paid', 'overdue')
      AND t.due_date < CURRENT_DATE THEN 1 END) AS payables_overdue_count
  FROM public.financial_transactions t
  WHERE t.organization_id = p_organization_id
    AND t.status != 'canceled';
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_financial_dashboard_metrics(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_financial_dashboard_metrics(UUID, DATE) TO service_role;

-- Função de projeção de fluxo de caixa
CREATE OR REPLACE FUNCTION public.get_cashflow_projection(
  p_organization_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_granularity TEXT DEFAULT 'daily' -- 'daily', 'weekly', 'monthly'
)
RETURNS TABLE (
  period_date DATE,
  receivables NUMERIC,
  payables NUMERIC,
  net NUMERIC,
  cumulative_balance NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_initial_balance NUMERIC;
  v_interval INTERVAL;
BEGIN
  -- Calculate initial balance from accounts
  SELECT COALESCE(SUM(current_balance), 0)
  INTO v_initial_balance
  FROM public.financial_accounts
  WHERE organization_id = p_organization_id AND is_active = true;

  -- Set interval based on granularity
  IF p_granularity = 'weekly' THEN
    v_interval = '1 week'::INTERVAL;
  ELSIF p_granularity = 'monthly' THEN
    v_interval = '1 month'::INTERVAL;
  ELSE
    v_interval = '1 day'::INTERVAL;
  END IF;

  RETURN QUERY
  WITH periods AS (
    SELECT generate_series(p_start_date, p_end_date, v_interval)::DATE AS pd
  ),
  period_data AS (
    SELECT
      p.pd,
      COALESCE(SUM(CASE WHEN t.type = 'receivable' THEN
        CASE WHEN t.status = 'paid' THEN t.paid_amount ELSE t.amount END
      ELSE 0 END), 0) AS recv,
      COALESCE(SUM(CASE WHEN t.type = 'payable' THEN
        CASE WHEN t.status = 'paid' THEN t.paid_amount ELSE t.amount END
      ELSE 0 END), 0) AS pay
    FROM periods p
    LEFT JOIN public.financial_transactions t
      ON t.organization_id = p_organization_id
      AND t.status != 'canceled'
      AND (
        (t.status = 'paid' AND t.paid_date >= p.pd AND t.paid_date < p.pd + v_interval)
        OR (t.status != 'paid' AND t.due_date >= p.pd AND t.due_date < p.pd + v_interval)
      )
    GROUP BY p.pd
  )
  SELECT
    pd.pd AS period_date,
    pd.recv AS receivables,
    pd.pay AS payables,
    pd.recv - pd.pay AS net,
    v_initial_balance + SUM(pd.recv - pd.pay) OVER (ORDER BY pd.pd) AS cumulative_balance
  FROM period_data pd
  ORDER BY pd.pd;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_cashflow_projection(UUID, DATE, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cashflow_projection(UUID, DATE, DATE, TEXT) TO service_role;

-- Função DRE (Demonstrativo de Resultado do Exercício)
CREATE OR REPLACE FUNCTION public.get_dre_report(
  p_organization_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_use_competence BOOLEAN DEFAULT true
)
RETURNS TABLE (
  dre_group_name dre_group,
  category_id UUID,
  category_name TEXT,
  total_amount NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fc.dre_group AS dre_group_name,
    fc.id AS category_id,
    fc.name AS category_name,
    COALESCE(SUM(
      CASE WHEN t.status IN ('paid', 'partially_paid') THEN t.paid_amount
      ELSE 0 END
    ), 0) AS total_amount
  FROM public.financial_categories fc
  LEFT JOIN public.financial_transactions t
    ON t.category_id = fc.id
    AND t.organization_id = p_organization_id
    AND t.status != 'canceled'
    AND (
      CASE WHEN p_use_competence THEN
        t.competence_date >= p_start_date AND t.competence_date <= p_end_date
      ELSE
        t.paid_date >= p_start_date AND t.paid_date <= p_end_date
      END
    )
  WHERE fc.organization_id = p_organization_id
    AND fc.is_active = true
  GROUP BY fc.dre_group, fc.id, fc.name
  ORDER BY fc.dre_group, fc.position, fc.name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dre_report(UUID, DATE, DATE, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dre_report(UUID, DATE, DATE, BOOLEAN) TO service_role;
