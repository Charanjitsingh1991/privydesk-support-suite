-- Create user_invitations table for tracking team member invites
CREATE TABLE public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'agent',
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  custom_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(organization_id, email)
);

-- Enable RLS
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_invitations
CREATE POLICY "Admins can view invitations in their org"
  ON public.user_invitations FOR SELECT
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can create invitations in their org"
  ON public.user_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can update invitations in their org"
  ON public.user_invitations FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can delete invitations in their org"
  ON public.user_invitations FOR DELETE
  TO authenticated
  USING (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'super_admin')
  );

-- Create index for faster lookups
CREATE INDEX idx_user_invitations_org ON public.user_invitations(organization_id);
CREATE INDEX idx_user_invitations_email ON public.user_invitations(email);
CREATE INDEX idx_user_invitations_token ON public.user_invitations(token);
CREATE INDEX idx_user_invitations_status ON public.user_invitations(status);

-- Function to generate secure invitation token
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Function to accept an invitation and update user profile
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation user_invitations%ROWTYPE;
BEGIN
  -- Find valid invitation
  SELECT * INTO v_invitation
  FROM public.user_invitations
  WHERE token = p_token
    AND status = 'pending'
    AND token_expires_at > now();
  
  IF v_invitation IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update user's profile with organization and role
  UPDATE public.profiles
  SET 
    organization_id = v_invitation.organization_id,
    role = v_invitation.role,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Mark invitation as accepted
  UPDATE public.user_invitations
  SET 
    status = 'accepted',
    accepted_at = now()
  WHERE id = v_invitation.id;
  
  RETURN true;
END;
$$;

-- Function to cleanup expired invitations
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND token_expires_at < now();
END;
$$;