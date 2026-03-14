-- ============================================================================
-- KOSMOS Platform - Generate March 2026 Transactions from Recurrences
-- ============================================================================
-- Gera as transações de março 2026 a partir das recorrências criadas
-- ============================================================================

DO $$
DECLARE
  v_org_id UUID;
  v_rec RECORD;
  v_due_date DATE;
BEGIN
  -- Get KOSMOS org ID
  SELECT id INTO v_org_id FROM public.organizations WHERE slug = 'kosmos';

  IF v_org_id IS NULL THEN
    RAISE NOTICE 'KOSMOS organization not found, skipping...';
    RETURN;
  END IF;

  -- Generate transactions for each active recurrence that starts in March or earlier
  FOR v_rec IN
    SELECT r.*, c.name as category_name
    FROM public.financial_recurrences r
    LEFT JOIN public.financial_categories c ON c.id = r.category_id
    WHERE r.organization_id = v_org_id
      AND r.is_active = true
      AND r.start_date <= '2026-03-31'  -- Only recurrences that start by March
  LOOP
    -- Calculate due date for March
    v_due_date := make_date(2026, 3, COALESCE(v_rec.day_of_month, 10));

    -- Skip if recurrence starts after March
    IF v_rec.start_date > '2026-03-31' THEN
      CONTINUE;
    END IF;

    -- Insert transaction for March
    INSERT INTO public.financial_transactions (
      organization_id,
      type,
      description,
      amount,
      due_date,
      competence_date,
      status,
      category_id,
      account_id,
      cost_center_id,
      recurrence_id,
      counterparty_name,
      notes
    ) VALUES (
      v_org_id,
      v_rec.type,
      v_rec.description,
      v_rec.amount,
      v_due_date,
      '2026-03-01',  -- Competence: March
      CASE
        WHEN v_due_date < CURRENT_DATE THEN 'overdue'::financial_transaction_status
        ELSE 'pending'::financial_transaction_status
      END,
      v_rec.category_id,
      v_rec.account_id,
      v_rec.cost_center_id,
      v_rec.id,
      v_rec.counterparty_name,
      'Gerado automaticamente da recorrência: ' || v_rec.description
    );

    -- Update recurrence next_due_date
    UPDATE public.financial_recurrences
    SET
      next_due_date = v_due_date + INTERVAL '1 month',
      last_generated_date = v_due_date
    WHERE id = v_rec.id;

    RAISE NOTICE 'Created transaction: % (R$ %)', v_rec.description, v_rec.amount;
  END LOOP;

  RAISE NOTICE 'March 2026 transactions generated successfully!';
END $$;
