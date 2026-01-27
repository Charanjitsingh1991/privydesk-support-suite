import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TeamMember, UserInvitation, InviteUserFormData } from '@/types/team';
import type { UserRole } from '@/types/database';

export function useTeamMembers(organizationId: string | null) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMembers = useCallback(async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organizationId)
        .neq('role', 'client')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers((data as TeamMember[]) || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching team members',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [organizationId, toast]);

  const updateMemberRole = useCallback(async (memberId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;
      await fetchMembers();
      toast({ title: 'Role updated successfully' });
    } catch (error: any) {
      toast({
        title: 'Error updating role',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchMembers, toast]);

  const toggleMemberStatus = useCallback(async (memberId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;
      await fetchMembers();
      toast({ title: isActive ? 'User activated' : 'User deactivated' });
    } catch (error: any) {
      toast({
        title: 'Error updating user status',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchMembers, toast]);

  return { members, loading, fetchMembers, updateMemberRole, toggleMemberStatus };
}

export function useClients(organizationId: string | null) {
  const [clients, setClients] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchClients = useCallback(async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients((data as TeamMember[]) || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching clients',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [organizationId, toast]);

  const toggleClientStatus = useCallback(async (clientId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', clientId);

      if (error) throw error;
      await fetchClients();
      toast({ title: isActive ? 'Client activated' : 'Client deactivated' });
    } catch (error: any) {
      toast({
        title: 'Error updating client status',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchClients, toast]);

  return { clients, loading, fetchClients, toggleClientStatus };
}

export function useInvitations(organizationId: string | null) {
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const fetchInvitations = useCallback(async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations((data as UserInvitation[]) || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching invitations',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [organizationId, toast]);

  const sendInvitation = useCallback(async (formData: InviteUserFormData) => {
    if (!organizationId) return false;
    
    setSending(true);
    try {
      // Generate token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_invitation_token');
      
      if (tokenError) throw tokenError;
      
      const token = tokenData as string;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Get current user ID for invited_by
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create invitation record
      const { error: insertError } = await supabase
        .from('user_invitations')
        .insert({
          organization_id: organizationId,
          email: formData.email.toLowerCase(),
          full_name: formData.full_name,
          role: formData.role,
          invited_by: user.id,
          token,
          token_expires_at: expiresAt.toISOString(),
          custom_message: formData.custom_message || null,
        });

      if (insertError) throw insertError;

      // Send invitation email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-team-invite', {
        body: {
          email: formData.email,
          fullName: formData.full_name,
          role: formData.role,
          token,
          customMessage: formData.custom_message,
        },
      });

      if (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Don't fail the operation, invitation was created
        toast({
          title: 'Invitation created',
          description: 'Invitation was created but email sending failed. You can resend it later.',
          variant: 'default',
        });
      } else {
        toast({ title: 'Invitation sent successfully' });
      }

      await fetchInvitations();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error sending invitation',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setSending(false);
    }
  }, [organizationId, fetchInvitations, toast]);

  const resendInvitation = useCallback(async (invitationId: string) => {
    try {
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) throw new Error('Invitation not found');

      // Generate new token and extend expiry
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_invitation_token');
      
      if (tokenError) throw tokenError;
      
      const newToken = tokenData as string;
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      // Update invitation with new token
      const { error: updateError } = await supabase
        .from('user_invitations')
        .update({
          token: newToken,
          token_expires_at: newExpiresAt.toISOString(),
          status: 'pending',
        })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // Resend email
      await supabase.functions.invoke('send-team-invite', {
        body: {
          email: invitation.email,
          fullName: invitation.full_name,
          role: invitation.role,
          token: newToken,
          customMessage: invitation.custom_message,
        },
      });

      await fetchInvitations();
      toast({ title: 'Invitation resent' });
    } catch (error: any) {
      toast({
        title: 'Error resending invitation',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [invitations, fetchInvitations, toast]);

  const cancelInvitation = useCallback(async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;
      await fetchInvitations();
      toast({ title: 'Invitation cancelled' });
    } catch (error: any) {
      toast({
        title: 'Error cancelling invitation',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchInvitations, toast]);

  return { 
    invitations, 
    loading, 
    sending,
    fetchInvitations, 
    sendInvitation, 
    resendInvitation, 
    cancelInvitation 
  };
}
