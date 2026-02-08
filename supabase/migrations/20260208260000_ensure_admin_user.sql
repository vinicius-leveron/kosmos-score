-- ============================================================================
-- ENSURE ADMIN USER HAS PROFILE AND MEMBERSHIP
-- ============================================================================

-- First, get the user ID from auth.users and create profile if missing
DO $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT := 'vinicius@leveron.online';
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = v_user_email;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User % not found in auth.users', v_user_email;
    RETURN;
  END IF;
  
  RAISE NOTICE 'Found user % with ID %', v_user_email, v_user_id;
  
  -- Ensure profile exists
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (v_user_id, v_user_email, 'Vinicius Oliveira')
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Profile ensured for user %', v_user_id;
  
  -- Ensure org_members entry exists for KOSMOS master org
  INSERT INTO public.org_members (organization_id, profile_id, role)
  VALUES ('c0000000-0000-0000-0000-000000000001', v_user_id, 'owner')
  ON CONFLICT (organization_id, profile_id) DO NOTHING;
  
  RAISE NOTICE 'Org membership ensured for user %', v_user_id;
END $$;
