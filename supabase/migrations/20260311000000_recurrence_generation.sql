-- Migration: Recurrence Generation Functions
-- Purpose: Add functions for generating transactions from recurrences and propagating changes

-- ============================================================================
-- 1. Function to calculate next due date based on frequency
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_next_due_date(
  p_current_date DATE,
  p_frequency financial_recurrence_frequency,
  p_day_of_month INTEGER DEFAULT NULL
) RETURNS DATE AS $$
DECLARE
  v_next_date DATE;
  v_target_day INTEGER;
BEGIN
  CASE p_frequency
    WHEN 'daily' THEN
      v_next_date := p_current_date + INTERVAL '1 day';

    WHEN 'weekly' THEN
      v_next_date := p_current_date + INTERVAL '1 week';

    WHEN 'biweekly' THEN
      v_next_date := p_current_date + INTERVAL '2 weeks';

    WHEN 'monthly' THEN
      v_target_day := COALESCE(p_day_of_month, EXTRACT(DAY FROM p_current_date)::INTEGER);
      v_next_date := (p_current_date + INTERVAL '1 month');
      -- Adjust to correct day of month (handle months with fewer days)
      v_next_date := make_date(
        EXTRACT(YEAR FROM v_next_date)::INTEGER,
        EXTRACT(MONTH FROM v_next_date)::INTEGER,
        LEAST(v_target_day, EXTRACT(DAY FROM (date_trunc('month', v_next_date) + INTERVAL '1 month' - INTERVAL '1 day'))::INTEGER)
      );

    WHEN 'bimonthly' THEN
      v_target_day := COALESCE(p_day_of_month, EXTRACT(DAY FROM p_current_date)::INTEGER);
      v_next_date := (p_current_date + INTERVAL '2 months');
      v_next_date := make_date(
        EXTRACT(YEAR FROM v_next_date)::INTEGER,
        EXTRACT(MONTH FROM v_next_date)::INTEGER,
        LEAST(v_target_day, EXTRACT(DAY FROM (date_trunc('month', v_next_date) + INTERVAL '1 month' - INTERVAL '1 day'))::INTEGER)
      );

    WHEN 'quarterly' THEN
      v_target_day := COALESCE(p_day_of_month, EXTRACT(DAY FROM p_current_date)::INTEGER);
      v_next_date := (p_current_date + INTERVAL '3 months');
      v_next_date := make_date(
        EXTRACT(YEAR FROM v_next_date)::INTEGER,
        EXTRACT(MONTH FROM v_next_date)::INTEGER,
        LEAST(v_target_day, EXTRACT(DAY FROM (date_trunc('month', v_next_date) + INTERVAL '1 month' - INTERVAL '1 day'))::INTEGER)
      );

    WHEN 'semiannual' THEN
      v_target_day := COALESCE(p_day_of_month, EXTRACT(DAY FROM p_current_date)::INTEGER);
      v_next_date := (p_current_date + INTERVAL '6 months');
      v_next_date := make_date(
        EXTRACT(YEAR FROM v_next_date)::INTEGER,
        EXTRACT(MONTH FROM v_next_date)::INTEGER,
        LEAST(v_target_day, EXTRACT(DAY FROM (date_trunc('month', v_next_date) + INTERVAL '1 month' - INTERVAL '1 day'))::INTEGER)
      );

    WHEN 'annual' THEN
      v_target_day := COALESCE(p_day_of_month, EXTRACT(DAY FROM p_current_date)::INTEGER);
      v_next_date := (p_current_date + INTERVAL '1 year');
      v_next_date := make_date(
        EXTRACT(YEAR FROM v_next_date)::INTEGER,
        EXTRACT(MONTH FROM v_next_date)::INTEGER,
        LEAST(v_target_day, EXTRACT(DAY FROM (date_trunc('month', v_next_date) + INTERVAL '1 month' - INTERVAL '1 day'))::INTEGER)
      );

    ELSE
      v_next_date := p_current_date + INTERVAL '1 month';
  END CASE;

  RETURN v_next_date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- ============================================================================
-- 2. Function to generate transactions from a recurrence
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_recurrence_transactions(
  p_recurrence_id UUID,
  p_until_date DATE DEFAULT (CURRENT_DATE + INTERVAL '3 months')::DATE
) RETURNS INTEGER AS $$
DECLARE
  v_rec RECORD;
  v_due_date DATE;
  v_generated_count INTEGER := 0;
  v_max_iterations INTEGER := 100; -- Safety limit
BEGIN
  -- Get recurrence details
  SELECT * INTO v_rec
  FROM financial_recurrences
  WHERE id = p_recurrence_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recurrence not found or inactive: %', p_recurrence_id;
  END IF;

  -- Start from next_due_date or start_date
  v_due_date := COALESCE(v_rec.next_due_date, v_rec.start_date);

  -- If we've already generated past this date, move to next
  IF v_rec.last_generated_date IS NOT NULL AND v_due_date <= v_rec.last_generated_date THEN
    v_due_date := calculate_next_due_date(v_rec.last_generated_date, v_rec.frequency, v_rec.day_of_month);
  END IF;

  -- Generate transactions until we reach the target date
  WHILE v_due_date <= p_until_date AND v_generated_count < v_max_iterations LOOP
    -- Check if end_date is set and we've passed it
    IF v_rec.end_date IS NOT NULL AND v_due_date > v_rec.end_date THEN
      EXIT;
    END IF;

    -- Check if transaction already exists for this date
    IF NOT EXISTS (
      SELECT 1 FROM financial_transactions
      WHERE recurrence_id = p_recurrence_id
        AND due_date = v_due_date
        AND status != 'canceled'
    ) THEN
      -- Insert transaction
      INSERT INTO financial_transactions (
        organization_id,
        type,
        description,
        amount,
        due_date,
        competence_date,
        category_id,
        account_id,
        cost_center_id,
        counterparty_name,
        recurrence_id,
        status,
        paid_amount
      ) VALUES (
        v_rec.organization_id,
        v_rec.type,
        v_rec.description,
        v_rec.amount,
        v_due_date,
        v_due_date, -- competence = due_date
        v_rec.category_id,
        v_rec.account_id,
        v_rec.cost_center_id,
        v_rec.counterparty_name,
        p_recurrence_id,
        'pending',
        0
      );

      v_generated_count := v_generated_count + 1;
    END IF;

    -- Calculate next due date
    v_due_date := calculate_next_due_date(v_due_date, v_rec.frequency, v_rec.day_of_month);
  END LOOP;

  -- Update recurrence tracking
  IF v_generated_count > 0 THEN
    UPDATE financial_recurrences
    SET
      next_due_date = v_due_date,
      last_generated_date = (v_due_date - INTERVAL '1 day')::DATE -- Last generated was before next
    WHERE id = p_recurrence_id;
  END IF;

  RETURN v_generated_count;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 3. Function to propagate recurrence changes to pending transactions
-- ============================================================================

CREATE OR REPLACE FUNCTION propagate_recurrence_changes(
  p_recurrence_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_rec RECORD;
  v_updated_count INTEGER;
BEGIN
  -- Get recurrence details
  SELECT * INTO v_rec
  FROM financial_recurrences
  WHERE id = p_recurrence_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recurrence not found: %', p_recurrence_id;
  END IF;

  -- Update all pending transactions linked to this recurrence
  -- Only update transactions that are still pending (not paid or partially paid)
  UPDATE financial_transactions
  SET
    description = v_rec.description,
    amount = v_rec.amount,
    category_id = v_rec.category_id,
    account_id = v_rec.account_id,
    cost_center_id = v_rec.cost_center_id,
    counterparty_name = v_rec.counterparty_name,
    updated_at = now()
  WHERE recurrence_id = p_recurrence_id
    AND status = 'pending'
    AND due_date >= CURRENT_DATE;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 4. Function to generate transactions for all active recurrences (batch)
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_all_recurrence_transactions(
  p_organization_id UUID,
  p_until_date DATE DEFAULT (CURRENT_DATE + INTERVAL '3 months')::DATE
) RETURNS TABLE(recurrence_id UUID, description TEXT, generated_count INTEGER) AS $$
DECLARE
  v_rec RECORD;
  v_count INTEGER;
BEGIN
  FOR v_rec IN
    SELECT id, fr.description
    FROM financial_recurrences fr
    WHERE organization_id = p_organization_id
      AND is_active = true
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  LOOP
    v_count := generate_recurrence_transactions(v_rec.id, p_until_date);

    recurrence_id := v_rec.id;
    description := v_rec.description;
    generated_count := v_count;

    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
