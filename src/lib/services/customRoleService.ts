import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CustomRoleRow = Database['public']['Tables']['custom_roles']['Row'];
type UserRoleAssignmentRow = Database['public']['Tables']['user_role_assignments']['Row'];

export type CustomRole = CustomRoleRow
export type UserRoleAssignment = UserRoleAssignmentRow

export class CustomRoleService {
  /**
   * Get all custom roles for organization
   */
  static async getRoles(organizationId: string): Promise<CustomRole[]> {
    const { data, error } = await supabase
      .from('custom_roles')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch roles:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Create custom role
   */
  static async createRole(
    organizationId: string,
    role: {
      name: string;
      description?: string;
      permissions: string[];
    }
  ): Promise<CustomRole | null> {
    const { data, error } = await supabase
      .from('custom_roles')
      .insert({
        organization_id: organizationId,
        ...role,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create role:', error);
      return null;
    }

    return data;
  }

  /**
   * Update custom role
   */
  static async updateRole(
    roleId: string,
    updates: Partial<CustomRole>
  ): Promise<CustomRole | null> {
    const { data, error } = await supabase
      .from('custom_roles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roleId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update role:', error);
      return null;
    }

    return data;
  }

  /**
   * Delete custom role
   */
  static async deleteRole(roleId: string): Promise<boolean> {
    const { error } = await supabase
      .from('custom_roles')
      .delete()
      .eq('id', roleId);

    if (error) {
      console.error('Failed to delete role:', error);
      return false;
    }

    return true;
  }

  /**
   * Assign role to user
   */
  static async assignRole(
    userId: string,
    roleId: string
  ): Promise<UserRoleAssignment | null> {
    const { data, error } = await supabase
      .from('user_role_assignments')
      .insert({
        user_id: userId,
        custom_role_id: roleId,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to assign role:', error);
      return null;
    }

    return data;
  }

  /**
   * Remove role from user
   */
  static async removeRole(assignmentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_role_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      console.error('Failed to remove role:', error);
      return false;
    }

    return true;
  }

  /**
   * Get user's roles
   */
  static async getUserRoles(userId: string): Promise<CustomRole[]> {
    const { data, error } = await supabase
      .from('user_role_assignments')
      .select('role:custom_roles(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to fetch user roles:', error);
      return [];
    }

    return (data || []).map((item) => item.role).filter(Boolean);
  }

  /**
   * Check if user has permission
   */
  static async hasPermission(
    userId: string,
    permission: string
  ): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    
    return roles.some(role => {
      if (!role.permissions) return false;
      const perms = Array.isArray(role.permissions) ? role.permissions : [];
      return perms.includes(permission);
    });
  }

  /**
   * Get all available permissions
   */
  static getAvailablePermissions(): string[] {
    return [
      // Ticket permissions
      'tickets.view',
      'tickets.create',
      'tickets.edit',
      'tickets.delete',
      'tickets.assign',
      'tickets.close',
      
      // User permissions
      'users.view',
      'users.create',
      'users.edit',
      'users.delete',
      
      // Settings permissions
      'settings.view',
      'settings.edit',
      
      // Reports permissions
      'reports.view',
      'reports.export',
      
      // API permissions
      'api.access',
      
      // Admin permissions
      'admin.full_access',
    ];
  }
}
