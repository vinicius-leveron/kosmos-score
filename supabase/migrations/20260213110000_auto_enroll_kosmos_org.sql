-- ============================================================================
-- AUTO-ENROLL USERS IN KOSMOS ORGANIZATION
-- ============================================================================
-- Problem: Users were not being added to org_members for KOSMOS org,
-- which prevented them from seeing contacts due to RLS policies.
--
-- Fix:
-- 1. Update handle_new_user() to also add users to KOSMOS org_members
-- 2. Backfill existing users who are missing org_member entries
-- ============================================================================

-- ============================================================================
-- 1. UPDATE HANDLE_NEW_USER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_kosmos_org_id UUID := 'c0000000-0000-0000-0000-000000000001';
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  -- Auto-enroll in KOSMOS organization as member
  INSERT INTO public.org_members (organization_id, profile_id, role)
  VALUES (v_kosmos_org_id, NEW.id, 'member')
  ON CONFLICT (organization_id, profile_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. BACKFILL EXISTING USERS WITHOUT ORG_MEMBERS
-- ============================================================================

DO $$
DECLARE
  v_kosmos_org_id UUID := 'c0000000-0000-0000-0000-000000000001';
  v_count INTEGER := 0;
BEGIN
  -- Add all existing profiles to KOSMOS org if not already members
  INSERT INTO public.org_members (organization_id, profile_id, role)
  SELECT
    v_kosmos_org_id,
    p.id,
    'member'
  FROM public.profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.profile_id = p.id
    AND om.organization_id = v_kosmos_org_id
  );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Added % users to KOSMOS organization', v_count;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  v_profiles_count INTEGER;
  v_members_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_profiles_count FROM public.profiles;
  SELECT COUNT(*) INTO v_members_count
  FROM public.org_members
  WHERE organization_id = 'c0000000-0000-0000-0000-000000000001';

  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Verification:';
  RAISE NOTICE '  Total profiles: %', v_profiles_count;
  RAISE NOTICE '  KOSMOS org members: %', v_members_count;
  RAISE NOTICE '=========================================';

  IF v_profiles_count = v_members_count THEN
    RAISE NOTICE '✅ All users are now KOSMOS members!';
  ELSE
    RAISE NOTICE '⚠️  Some users may still be missing';
  END IF;
END $$;
