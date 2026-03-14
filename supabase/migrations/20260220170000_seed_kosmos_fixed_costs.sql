-- ============================================================================
-- KOSMOS Platform - Seed Custos Fixos Mensais
-- ============================================================================
-- Insere as recorrências financeiras da operação KOSMOS
-- Total mensal: R$ 21.635
-- Vencimento: dia 10 de cada mês
-- ============================================================================

DO $$
DECLARE
  v_org_id UUID;
  v_cat_prolabore UUID;
  v_cat_marketing UUID;
  v_cat_freelancers UUID;
  v_cat_contador UUID;
  v_cat_saas UUID;
BEGIN
  -- Get KOSMOS org ID
  SELECT id INTO v_org_id FROM public.organizations WHERE slug = 'kosmos';

  -- Exit if org not found
  IF v_org_id IS NULL THEN
    RAISE NOTICE 'KOSMOS organization not found, skipping...';
    RETURN;
  END IF;

  -- Get category IDs
  SELECT id INTO v_cat_prolabore FROM public.financial_categories
    WHERE organization_id = v_org_id AND name = 'Salários e Pró-labore' LIMIT 1;

  SELECT id INTO v_cat_marketing FROM public.financial_categories
    WHERE organization_id = v_org_id AND name = 'Marketing Digital' LIMIT 1;

  SELECT id INTO v_cat_freelancers FROM public.financial_categories
    WHERE organization_id = v_org_id AND name = 'Freelancers e Terceirizados' LIMIT 1;

  SELECT id INTO v_cat_contador FROM public.financial_categories
    WHERE organization_id = v_org_id AND name = 'Contabilidade e Jurídico' LIMIT 1;

  SELECT id INTO v_cat_saas FROM public.financial_categories
    WHERE organization_id = v_org_id AND name = 'SaaS e Assinaturas' LIMIT 1;

  -- ==========================================================================
  -- RECORRÊNCIAS MENSAIS (financial_recurrences)
  -- ==========================================================================

  -- Pró-labore - R$ 10.000
  INSERT INTO public.financial_recurrences
    (organization_id, description, type, amount, frequency, start_date, day_of_month, category_id, is_active)
  VALUES
    (v_org_id, 'Pró-labore', 'payable', 10000.00, 'monthly', '2026-03-01', 10, v_cat_prolabore, true)
  ON CONFLICT DO NOTHING;

  -- Anúncio - R$ 5.000
  INSERT INTO public.financial_recurrences
    (organization_id, description, type, amount, frequency, start_date, day_of_month, category_id, is_active)
  VALUES
    (v_org_id, 'Anúncio (Meta Ads)', 'payable', 5000.00, 'monthly', '2026-03-01', 10, v_cat_marketing, true)
  ON CONFLICT DO NOTHING;

  -- Editor de vídeo - R$ 800
  INSERT INTO public.financial_recurrences
    (organization_id, description, type, amount, frequency, start_date, day_of_month, category_id, is_active)
  VALUES
    (v_org_id, 'Editor de vídeo', 'payable', 800.00, 'monthly', '2026-03-01', 10, v_cat_freelancers, true)
  ON CONFLICT DO NOTHING;

  -- Claude Code Max - R$ 500
  INSERT INTO public.financial_recurrences
    (organization_id, description, type, amount, frequency, start_date, day_of_month, category_id, is_active)
  VALUES
    (v_org_id, 'Claude Code Max', 'payable', 500.00, 'monthly', '2026-03-01', 10, v_cat_saas, true)
  ON CONFLICT DO NOTHING;

  -- Contador - R$ 350
  INSERT INTO public.financial_recurrences
    (organization_id, description, type, amount, frequency, start_date, day_of_month, category_id, is_active)
  VALUES
    (v_org_id, 'Contador', 'payable', 350.00, 'monthly', '2026-03-01', 10, v_cat_contador, true)
  ON CONFLICT DO NOTHING;

  -- Axiom - R$ 300
  INSERT INTO public.financial_recurrences
    (organization_id, description, type, amount, frequency, start_date, day_of_month, category_id, is_active)
  VALUES
    (v_org_id, 'Axiom', 'payable', 300.00, 'monthly', '2026-03-01', 10, v_cat_saas, true)
  ON CONFLICT DO NOTHING;

  -- Apify - R$ 210
  INSERT INTO public.financial_recurrences
    (organization_id, description, type, amount, frequency, start_date, day_of_month, category_id, is_active)
  VALUES
    (v_org_id, 'Apify', 'payable', 210.00, 'monthly', '2026-03-01', 10, v_cat_saas, true)
  ON CONFLICT DO NOTHING;

  -- Gemini API - R$ 100
  INSERT INTO public.financial_recurrences
    (organization_id, description, type, amount, frequency, start_date, day_of_month, category_id, is_active)
  VALUES
    (v_org_id, 'Gemini API', 'payable', 100.00, 'monthly', '2026-03-01', 10, v_cat_saas, true)
  ON CONFLICT DO NOTHING;

  -- E-mail Google Business - R$ 90
  INSERT INTO public.financial_recurrences
    (organization_id, description, type, amount, frequency, start_date, day_of_month, category_id, is_active)
  VALUES
    (v_org_id, 'E-mail Google Business', 'payable', 90.00, 'monthly', '2026-03-01', 10, v_cat_saas, true)
  ON CONFLICT DO NOTHING;

  -- Zapi - R$ 80
  INSERT INTO public.financial_recurrences
    (organization_id, description, type, amount, frequency, start_date, day_of_month, category_id, is_active)
  VALUES
    (v_org_id, 'Zapi', 'payable', 80.00, 'monthly', '2026-03-01', 10, v_cat_saas, true)
  ON CONFLICT DO NOTHING;

  -- VPS n8n - R$ 80 (inicia em 90 dias - maio 2026)
  INSERT INTO public.financial_recurrences
    (organization_id, description, type, amount, frequency, start_date, day_of_month, category_id, is_active)
  VALUES
    (v_org_id, 'VPS n8n', 'payable', 80.00, 'monthly', '2026-05-20', 10, v_cat_saas, true)
  ON CONFLICT DO NOTHING;

  -- Verificados Insta - R$ 60
  INSERT INTO public.financial_recurrences
    (organization_id, description, type, amount, frequency, start_date, day_of_month, category_id, is_active)
  VALUES
    (v_org_id, 'Verificados Instagram', 'payable', 60.00, 'monthly', '2026-03-01', 10, v_cat_marketing, true)
  ON CONFLICT DO NOTHING;

  -- Domínios Google - R$ 59
  INSERT INTO public.financial_recurrences
    (organization_id, description, type, amount, frequency, start_date, day_of_month, category_id, is_active)
  VALUES
    (v_org_id, 'Domínios Google', 'payable', 59.00, 'monthly', '2026-03-01', 10, v_cat_saas, true)
  ON CONFLICT DO NOTHING;

  -- Cloud Storage - R$ 6
  INSERT INTO public.financial_recurrences
    (organization_id, description, type, amount, frequency, start_date, day_of_month, category_id, is_active)
  VALUES
    (v_org_id, 'Cloud Storage', 'payable', 6.00, 'monthly', '2026-03-01', 10, v_cat_saas, true)
  ON CONFLICT DO NOTHING;

  -- ==========================================================================
  -- TRANSAÇÃO URGENTE - Pagamento Cartão (vence 10/03/2026)
  -- ==========================================================================
  INSERT INTO public.financial_transactions (
    organization_id,
    type,
    description,
    amount,
    due_date,
    competence_date,
    status,
    notes,
    tags
  ) VALUES (
    v_org_id,
    'payable',
    'Pagamento Cartão - URGENTE',
    0.01,  -- Valor placeholder - definir antes do vencimento
    '2026-03-10',
    '2026-03-01',
    'pending',
    '⚠️ URGENTE - Definir valor real antes do vencimento 10/03',
    ARRAY['urgente', 'cartao']
  );

  RAISE NOTICE 'KOSMOS fixed costs seeded successfully!';
  RAISE NOTICE 'Total monthly: R$ 21.635 (14 recurrences)';
  RAISE NOTICE 'Urgent transaction created: Pagamento Cartão (due 10/03)';
END $$;
