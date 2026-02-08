-- ============================================================================
-- CREATE ORG_INVITATIONS TABLE
-- ============================================================================
-- Stores pending invitations for users to join organizations

CREATE TABLE public.org_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  token TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX idx_org_invitations_token ON public.org_invitations(token);
CREATE INDEX idx_org_invitations_email ON public.org_invitations(email);
CREATE INDEX idx_org_invitations_org_status ON public.org_invitations(organization_id, status);

-- Trigger for updated_at
CREATE TRIGGER update_org_invitations_updated_at
  BEFORE UPDATE ON public.org_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE public.org_invitations ENABLE ROW LEVEL SECURITY;

-- Org admins can see invitations for their org
CREATE POLICY "org_invitations_select" ON public.org_invitations
  FOR SELECT USING (
    -- User is member of the org
    organization_id IN (
      SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
    )
  );

-- Org admins can create invitations
CREATE POLICY "org_invitations_insert" ON public.org_invitations
  FOR INSERT WITH CHECK (
    -- User is admin/owner of the org
    organization_id IN (
      SELECT organization_id FROM public.org_members
      WHERE profile_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Org admins can update invitations (revoke, etc)
CREATE POLICY "org_invitations_update" ON public.org_invitations
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members
      WHERE profile_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Org admins can delete invitations
CREATE POLICY "org_invitations_delete" ON public.org_invitations
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members
      WHERE profile_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- FUNCTION: Accept invitation (called when user accepts invite)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get and validate invitation
  SELECT * INTO v_invitation
  FROM org_invitations
  WHERE token = invitation_token
  AND status = 'pending'
  AND expires_at > now();

  IF v_invitation IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM org_members
    WHERE organization_id = v_invitation.organization_id
    AND profile_id = v_user_id
  ) THEN
    -- Update invitation status anyway
    UPDATE org_invitations
    SET status = 'accepted', accepted_at = now()
    WHERE id = v_invitation.id;

    RETURN jsonb_build_object('success', true, 'message', 'Already a member');
  END IF;

  -- Add user to organization
  INSERT INTO org_members (organization_id, profile_id, role)
  VALUES (v_invitation.organization_id, v_user_id, v_invitation.role);

  -- Update invitation status
  UPDATE org_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object(
    'success', true,
    'organization_id', v_invitation.organization_id,
    'role', v_invitation.role
  );
END;
$$;

-- ============================================================================
-- FUNCTION: Get invitation by token (public, for invite page)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(invitation_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  SELECT
    i.id,
    i.email,
    i.role,
    i.status,
    i.expires_at,
    o.name as organization_name,
    o.slug as organization_slug,
    p.full_name as invited_by_name
  INTO v_invitation
  FROM org_invitations i
  JOIN organizations o ON o.id = i.organization_id
  LEFT JOIN profiles p ON p.id = i.invited_by
  WHERE i.token = invitation_token;

  IF v_invitation IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'id', v_invitation.id,
    'email', v_invitation.email,
    'role', v_invitation.role,
    'status', v_invitation.status,
    'expires_at', v_invitation.expires_at,
    'organization_name', v_invitation.organization_name,
    'organization_slug', v_invitation.organization_slug,
    'invited_by_name', v_invitation.invited_by_name,
    'is_valid', v_invitation.status = 'pending' AND v_invitation.expires_at > now()
  );
END;
$$;
