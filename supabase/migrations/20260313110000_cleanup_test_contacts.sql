-- ============================================================================
-- KOSMOS Platform - Cleanup Test Contacts
-- ============================================================================
-- Remove contatos de teste para começar do zero
-- ============================================================================

-- Log antes de deletar
DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.contact_orgs WHERE cadence_status IS NOT NULL;
  RAISE NOTICE 'Contatos Outbound antes: %', v_count;

  SELECT COUNT(*) INTO v_count FROM public.contacts;
  RAISE NOTICE 'Contatos totais antes: %', v_count;

  SELECT COUNT(*) INTO v_count FROM public.deals;
  RAISE NOTICE 'Deals antes: %', v_count;

  SELECT COUNT(*) INTO v_count FROM public.activities;
  RAISE NOTICE 'Activities antes: %', v_count;
END $$;

-- ============================================================================
-- DELETAR EM ORDEM (respeitando foreign keys)
-- ============================================================================

-- 1. Deletar activities (dependem de contact_orgs)
DELETE FROM public.activities
WHERE contact_org_id IN (
  SELECT id FROM public.contact_orgs WHERE cadence_status IS NOT NULL
);

-- 2. Deletar deal_contacts (junction table)
DELETE FROM public.deal_contacts
WHERE contact_org_id IN (
  SELECT id FROM public.contact_orgs WHERE cadence_status IS NOT NULL
);

-- 3. Deletar contact_pipeline_positions
DELETE FROM public.contact_pipeline_positions
WHERE contact_org_id IN (
  SELECT id FROM public.contact_orgs WHERE cadence_status IS NOT NULL
);

-- 4. Deletar contact_companies
DELETE FROM public.contact_companies
WHERE contact_org_id IN (
  SELECT id FROM public.contact_orgs WHERE cadence_status IS NOT NULL
);

-- 5. Deletar deals criados via outbound (sem primary_contact ou com primary_contact outbound)
DELETE FROM public.deals
WHERE source = 'outbound'
   OR primary_contact_id IN (
     SELECT id FROM public.contact_orgs WHERE cadence_status IS NOT NULL
   );

-- 6. Deletar contact_orgs (outbound contacts)
DELETE FROM public.contact_orgs
WHERE cadence_status IS NOT NULL;

-- 7. Deletar contacts órfãos (sem contact_orgs associado)
DELETE FROM public.contacts c
WHERE NOT EXISTS (
  SELECT 1 FROM public.contact_orgs co WHERE co.contact_id = c.id
);

-- ============================================================================
-- LOG após deletar
-- ============================================================================

DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.contact_orgs WHERE cadence_status IS NOT NULL;
  RAISE NOTICE 'Contatos Outbound depois: %', v_count;

  SELECT COUNT(*) INTO v_count FROM public.contacts;
  RAISE NOTICE 'Contatos totais depois: %', v_count;

  SELECT COUNT(*) INTO v_count FROM public.deals;
  RAISE NOTICE 'Deals depois: %', v_count;

  SELECT COUNT(*) INTO v_count FROM public.activities;
  RAISE NOTICE 'Activities depois: %', v_count;

  RAISE NOTICE '=== Cleanup concluído! ===';
END $$;
