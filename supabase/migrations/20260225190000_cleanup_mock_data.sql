-- ============================================================================
-- CLEANUP: Remove Mock/Test Data from Platform
-- ============================================================================
-- This migration removes test data while preserving legitimate seed data
-- (journey_stages, financial_categories, cadences, pipelines, tags, etc.)
-- ============================================================================

-- 1. Remove contact tags for test contacts
DELETE FROM contact_tags WHERE contact_org_id IN (
  SELECT co.id FROM contact_orgs co
  JOIN contacts c ON co.contact_id = c.id
  WHERE c.email LIKE '%test%'
     OR c.email LIKE '%teste%'
     OR c.email LIKE '%example.com'
     OR c.email LIKE '%fake%'
     OR c.email LIKE '%dummy%'
     OR c.email LIKE '%sample%'
);

-- 2. Remove activities for test contacts
DELETE FROM activities WHERE contact_org_id IN (
  SELECT co.id FROM contact_orgs co
  JOIN contacts c ON co.contact_id = c.id
  WHERE c.email LIKE '%test%'
     OR c.email LIKE '%teste%'
     OR c.email LIKE '%example.com'
     OR c.email LIKE '%fake%'
     OR c.email LIKE '%dummy%'
     OR c.email LIKE '%sample%'
);

-- 3. Remove contact_orgs for test contacts
DELETE FROM contact_orgs WHERE contact_id IN (
  SELECT id FROM contacts
  WHERE email LIKE '%test%'
     OR email LIKE '%teste%'
     OR email LIKE '%example.com'
     OR email LIKE '%fake%'
     OR email LIKE '%dummy%'
     OR email LIKE '%sample%'
);

-- 4. Remove test contacts
DELETE FROM contacts
WHERE email LIKE '%test%'
   OR email LIKE '%teste%'
   OR email LIKE '%example.com'
   OR email LIKE '%fake%'
   OR email LIKE '%dummy%'
   OR email LIKE '%sample%';

-- 5. Remove test deals
DELETE FROM deals
WHERE name LIKE '%test%'
   OR name LIKE '%teste%'
   OR name LIKE '%example%'
   OR name LIKE '%demo%';

-- 6. Remove test companies
DELETE FROM companies
WHERE name LIKE '%test%'
   OR name LIKE '%teste%'
   OR name LIKE '%example%'
   OR name LIKE '%demo%';

-- 8. Clean up old webhook logs (keep only last 7 days)
DELETE FROM webhook_logs
WHERE received_at < NOW() - INTERVAL '7 days';

-- 9. Clean up old API request logs (keep only last 7 days)
DELETE FROM api_request_logs
WHERE requested_at < NOW() - INTERVAL '7 days';

-- 10. Clean up test activities
DELETE FROM activities
WHERE title LIKE '%test%'
   OR title LIKE '%teste%';

-- ============================================================================
-- VERIFICATION QUERIES (run manually to check results)
-- ============================================================================
-- SELECT email, full_name FROM contacts ORDER BY created_at DESC;
-- SELECT * FROM contacts WHERE email LIKE '%test%';
-- SELECT * FROM deals WHERE title LIKE '%test%';
-- SELECT COUNT(*) FROM webhook_logs;
-- SELECT COUNT(*) FROM api_request_logs;
-- ============================================================================
