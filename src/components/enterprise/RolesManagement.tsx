import { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Trash2, Users } from 'lucide-react';
import { RBACService, type CustomRole } from '@/lib/services/rbacService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

type Role = CustomRole;

const AVAILABLE_PERMISSIONS = [
  { id: 'tickets.view', label: 'View Tickets', category: 'Tickets' },
  { id: 'tickets.create', label: 'Create Tickets', category: 'Tickets' },
  { id: 'tickets.edit', label: 'Edit Tickets', category: 'Tickets' },
  { id: 'tickets.delete', label: 'Delete Tickets', category: 'Tickets' },
  { id: 'tickets.assign', label: 'Assign Tickets', category: 'Tickets' },
  { id: 'users.view', label: 'View Users', category: 'Users' },
  { id: 'users.create', label: 'Create Users', category: 'Users' },
  { id: 'users.edit', label: 'Edit Users', category: 'Users' },
  { id: 'users.delete', label: 'Delete Users', category: 'Users' },
  { id: 'settings.view', label: 'View Settings', category: 'Settings' },
  { id: 'settings.edit', label: 'Edit Settings', category: 'Settings' },
  { id: 'reports.view', label: 'View Reports', category: 'Reports' },
  { id: 'billing.view', label: 'View Billing', category: 'Billing' },
  { id: 'billing.edit', label: 'Manage Billing', category: 'Billing' },
  { id: 'integrations.manage', label: 'Manage Integrations', category: 'Integrations' },
];

export function RolesManagement({ organizationId }: { organizationId: string }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  useEffect(() => {
    loadRoles();
  }, [organizationId]);

  const loadRoles = async () => {
    setLoading(true);
    const data = await RBACService.getRoles(organizationId);
    setRoles(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      await RBACService.updateRole(editingRole.id, formData);
    } else {
      await RBACService.createRole(organizationId, 'current-user-id', formData);
    }
    setShowForm(false);
    setEditingRole(null);
    setFormData({ name: '', description: '', permissions: [] });
    loadRoles();
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: Array.isArray(role.permissions) ? role.permissions as string[] : [],
    });
    setShowForm(true);
  };

  const handleDelete = async (roleId: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      await RBACService.deleteRole(roleId);
      loadRoles();
    }
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Roles & Permissions</h2>
          <p className="text-muted-foreground">Manage custom roles and access control</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingRole(null); }}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Cancel' : 'Create Role'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</CardTitle>
            <CardDescription>Define role name, description, and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium">Role Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Support Manager"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Can manage support tickets and agents"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Permissions</label>
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{category}</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {perms.map((perm) => (
                          <div key={perm.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={perm.id}
                              checked={formData.permissions.includes(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                            />
                            <label htmlFor={perm.id} className="text-sm cursor-pointer">
                              {perm.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">Loading roles...</div>
      ) : roles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No custom roles created</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {role.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {role.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {Array.isArray(role.permissions) ? (role.permissions as string[]).slice(0, 3).join(', ') : 'No permissions'}
                    {Array.isArray(role.permissions) && (role.permissions as string[]).length > 3 && ` +${(role.permissions as string[]).length - 3} more`}
                  </p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(role)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(role.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
