import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Shield, UserPlus, Settings } from 'lucide-react';
import { useUser } from '@/hooks/useSession';
import type { RolePermissions } from '@/types/settings';

const DEFAULT_PERMISSIONS: Record<string, RolePermissions> = {
  admin: {
    can_create_tickets: true,
    can_view_all_tickets: true,
    can_assign_tickets: true,
    can_delete_tickets: true,
    can_manage_users: true,
    can_change_settings: true,
    can_view_analytics: true,
    can_manage_integrations: true,
  },
  agent: {
    can_create_tickets: true,
    can_view_all_tickets: true,
    can_assign_tickets: true,
    can_delete_tickets: false,
    can_manage_users: false,
    can_change_settings: false,
    can_view_analytics: true,
    can_manage_integrations: false,
  },
  client: {
    can_create_tickets: true,
    can_view_all_tickets: false,
    can_assign_tickets: false,
    can_delete_tickets: false,
    can_manage_users: false,
    can_change_settings: false,
    can_view_analytics: false,
    can_manage_integrations: false,
  },
};

export function TeamAccessSettingsTab() {
  const { role } = useUser();
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [invitationSettings, setInvitationSettings] = useState({
    require_email_verification: true,
    auto_approve_clients: false,
    default_client_role: 'client',
    invitation_expiry: '7days',
  });

  // Mock team size data
  const teamSize = { current: 5, limit: 10 };
  const teamUsagePercent = (teamSize.current / teamSize.limit) * 100;

  const updatePermission = (
    roleKey: string,
    permission: keyof RolePermissions,
    value: boolean
  ) => {
    setPermissions(prev => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [permission]: value,
      },
    }));
  };

  const permissionLabels: Record<keyof RolePermissions, string> = {
    can_create_tickets: 'Create tickets',
    can_view_all_tickets: 'View all tickets',
    can_assign_tickets: 'Assign tickets',
    can_delete_tickets: 'Delete tickets',
    can_manage_users: 'Manage users',
    can_change_settings: 'Change organization settings',
    can_view_analytics: 'View analytics',
    can_manage_integrations: 'Manage integrations',
  };

  return (
    <div className="space-y-6">
      {/* Team Size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Size
          </CardTitle>
          <CardDescription>
            Current team member usage based on your plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Team members used</span>
            <span className="font-medium">
              {teamSize.current} of {teamSize.limit}
            </span>
          </div>
          <Progress
            value={teamUsagePercent}
            className={teamUsagePercent > 90 ? 'bg-destructive/20' : ''}
          />
          {teamUsagePercent >= 90 && (
            <Button variant="outline" size="sm">
              Upgrade Plan
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Permissions
          </CardTitle>
          <CardDescription>
            Configure what each role can do in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-medium">Permission</th>
                  <th className="text-center py-3 px-4 font-medium">Admin</th>
                  <th className="text-center py-3 px-4 font-medium">Agent</th>
                  <th className="text-center py-3 px-4 font-medium">Client</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissionLabels).map(([key, label]) => (
                  <tr key={key} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-sm">{label}</td>
                    {['admin', 'agent', 'client'].map((roleKey) => (
                      <td key={roleKey} className="text-center py-3 px-4">
                        <Switch
                          checked={permissions[roleKey]?.[key as keyof RolePermissions] ?? false}
                          onCheckedChange={(checked) =>
                            updatePermission(roleKey, key as keyof RolePermissions, checked)
                          }
                          disabled={roleKey === 'admin' && key === 'can_change_settings'}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invitation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invitation Settings
          </CardTitle>
          <CardDescription>
            Configure how new users are invited and onboarded
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Email Verification</Label>
              <p className="text-xs text-muted-foreground">
                New users must verify their email before accessing the platform
              </p>
            </div>
            <Switch
              checked={invitationSettings.require_email_verification}
              onCheckedChange={(checked) =>
                setInvitationSettings(prev => ({
                  ...prev,
                  require_email_verification: checked,
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Approve Client Signups</Label>
              <p className="text-xs text-muted-foreground">
                Automatically approve new client registrations
              </p>
            </div>
            <Switch
              checked={invitationSettings.auto_approve_clients}
              onCheckedChange={(checked) =>
                setInvitationSettings(prev => ({
                  ...prev,
                  auto_approve_clients: checked,
                }))
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Default Role for New Clients</Label>
              <Select
                value={invitationSettings.default_client_role}
                onValueChange={(value) =>
                  setInvitationSettings(prev => ({
                    ...prev,
                    default_client_role: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Invitation Expiry</Label>
              <Select
                value={invitationSettings.invitation_expiry}
                onValueChange={(value) =>
                  setInvitationSettings(prev => ({
                    ...prev,
                    invitation_expiry: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24hours">24 hours</SelectItem>
                  <SelectItem value="7days">7 days</SelectItem>
                  <SelectItem value="30days">30 days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
