import { useEffect, useState } from 'react';
import { Search, UserPlus, Filter, Users, Mail, Shield } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/useSession';
import { useTeamMembers, useInvitations } from '@/hooks/useTeamManagement';
import { InviteUserModal } from '@/components/team/InviteUserModal';
import { TeamMemberTable } from '@/components/team/TeamMemberTable';
import { InvitationsTable } from '@/components/team/InvitationsTable';
import type { UserRole } from '@/types/database';

export default function Team() {
  const { organizationId, userId, role } = useUser();
  const { members, loading: membersLoading, fetchMembers, updateMemberRole, toggleMemberStatus } = useTeamMembers(organizationId || null);
  const { invitations, loading: invitationsLoading, sending, fetchInvitations, sendInvitation, resendInvitation, cancelInvitation } = useInvitations(organizationId || null);
  
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (organizationId) {
      fetchMembers();
      fetchInvitations();
    }
  }, [organizationId, fetchMembers, fetchInvitations]);

  // Filter members based on search and filters
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && member.is_active) ||
      (statusFilter === 'inactive' && !member.is_active);
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'admins' && member.role === 'admin') ||
      (activeTab === 'agents' && member.role === 'agent');

    return matchesSearch && matchesStatus && matchesRole && matchesTab;
  });

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  const isAdmin = role === 'admin' || role === 'super_admin';

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            You need admin privileges to access team management.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Team Members</h1>
            <p className="text-muted-foreground">
              Manage your team and send invitations
            </p>
          </div>
          <Button onClick={() => setInviteModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Members</span>
            </div>
            <p className="text-2xl font-bold mt-2">{members.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Admins</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {members.filter(m => m.role === 'admin').length}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Pending Invites</span>
            </div>
            <p className="text-2xl font-bold mt-2">{pendingInvitations.length}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="invitations" className="relative">
              Invitations
              {pendingInvitations.length > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {pendingInvitations.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {membersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <TeamMemberTable
                members={filteredMembers}
                currentUserId={userId}
                onChangeRole={updateMemberRole}
                onToggleStatus={toggleMemberStatus}
                isLoading={membersLoading}
              />
            )}
          </TabsContent>

          <TabsContent value="admins" className="mt-6">
            <TeamMemberTable
              members={filteredMembers}
              currentUserId={userId}
              onChangeRole={updateMemberRole}
              onToggleStatus={toggleMemberStatus}
              isLoading={membersLoading}
            />
          </TabsContent>

          <TabsContent value="agents" className="mt-6">
            <TeamMemberTable
              members={filteredMembers}
              currentUserId={userId}
              onChangeRole={updateMemberRole}
              onToggleStatus={toggleMemberStatus}
              isLoading={membersLoading}
            />
          </TabsContent>

          <TabsContent value="invitations" className="mt-6">
            {invitationsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <InvitationsTable
                invitations={invitations}
                onResend={resendInvitation}
                onCancel={cancelInvitation}
                isLoading={invitationsLoading}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <InviteUserModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        onInvite={sendInvitation}
        isSubmitting={sending}
      />
    </DashboardLayout>
  );
}
