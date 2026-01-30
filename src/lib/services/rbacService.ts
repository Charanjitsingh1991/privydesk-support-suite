import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CustomRoleRow = Database['public']['Tables']['custom_roles']['Row'];
type RoleAssignmentRow = Database['public']['Tables']['role_assignments']['Row'];

export interface CustomRole extends CustomRoleRow {}
export interface RoleAssignment extends RoleAssignmentRow {}

export class RBACService {
  /**
   * Get custom roles for organization
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
    userId: string,
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
        created_by: userId,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
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
    roleId: string,
    assignedBy: string
  ): Promise<RoleAssignment | null> {
    const { data, error } = await supabase
      .from('role_assignments')
      .insert({
        user_id: userId,
        role_id: roleId,
        assigned_by: assignedBy,
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
      .from('role_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      console.error('Failed to remove role:', error);
      return false;
    }

    return true;
  }

  /**
   * Get user roles
   */
  static async getUserRoles(userId: string): Promise<RoleAssignment[]> {
    const { data, error } = await supabase
      .from('role_assignments')
      .select('*, custom_roles(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to fetch user roles:', error);
      return [];
    }

    return data || [];
  }
}
