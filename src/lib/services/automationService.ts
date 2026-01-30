import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AutomationRule = Database['public']['Tables']['automation_rules']['Row'];
type AutomationRuleInsert = Database['public']['Tables']['automation_rules']['Insert'];

export interface AutomationTrigger {
  type: 'ticket_created' | 'ticket_updated' | 'status_changed' | 'time_based' | 'sla_breach';
  conditions: Record<string, any>;
}

export interface AutomationAction {
  type: 'assign_agent' | 'change_status' | 'add_tag' | 'send_email' | 'update_priority' | 'close_ticket';
  parameters: Record<string, any>;
}

export class AutomationService {
  /**
   * Get all automation rules for an organization
   */
  static async getRules(organizationId: string): Promise<AutomationRule[]> {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch automation rules:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get a single automation rule
   */
  static async getRule(ruleId: string): Promise<AutomationRule | null> {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('id', ruleId)
      .single();

    if (error) {
      console.error('Failed to fetch automation rule:', error);
      return null;
    }

    return data;
  }

  /**
   * Create a new automation rule
   */
  static async createRule(
    organizationId: string,
    userId: string,
    rule: {
      name: string;
      description?: string;
      trigger_type: string;
      trigger_conditions: any;
      actions: any;
      is_active?: boolean;
    }
  ): Promise<AutomationRule | null> {
    const { data, error } = await supabase
      .from('automation_rules')
      .insert({
        organization_id: organizationId,
        created_by: userId,
        name: rule.name,
        description: rule.description,
        trigger_type: rule.trigger_type,
        trigger_conditions: rule.trigger_conditions,
        actions: rule.actions,
        is_active: rule.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create automation rule:', error);
      return null;
    }

    return data;
  }

  /**
   * Update an automation rule
   */
  static async updateRule(
    ruleId: string,
    updates: {
      name?: string;
      description?: string;
      trigger_type?: string;
      trigger_conditions?: any;
      actions?: any;
      is_active?: boolean;
    }
  ): Promise<boolean> {
    const { error } = await supabase
      .from('automation_rules')
      .update(updates)
      .eq('id', ruleId);

    if (error) {
      console.error('Failed to update automation rule:', error);
      return false;
    }

    return true;
  }

  /**
   * Delete an automation rule
   */
  static async deleteRule(ruleId: string): Promise<boolean> {
    const { error } = await supabase
      .from('automation_rules')
      .delete()
      .eq('id', ruleId);

    if (error) {
      console.error('Failed to delete automation rule:', error);
      return false;
    }

    return true;
  }

  /**
   * Toggle rule active status
   */
  static async toggleRule(ruleId: string, isActive: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('automation_rules')
      .update({ is_active: isActive })
      .eq('id', ruleId);

    if (error) {
      console.error('Failed to toggle automation rule:', error);
      return false;
    }

    return true;
  }

  /**
   * Execute automation rules for a ticket
   */
  static async executeRulesForTicket(
    ticketId: string,
    triggerType: string,
    context: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Get ticket details
      const { data: ticket } = await supabase
        .from('tickets')
        .select('*, organization_id')
        .eq('id', ticketId)
        .single();

      if (!ticket) return;

      // Get active rules for this trigger type
      const { data: rules } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('organization_id', ticket.organization_id)
        .eq('trigger_type', triggerType)
        .eq('is_active', true);

      if (!rules || rules.length === 0) return;

      // Execute each matching rule
      for (const rule of rules) {
        if (this.evaluateConditions(rule.trigger_conditions, ticket, context)) {
          await this.executeActions(rule.id, ticketId, rule.actions);
        }
      }
    } catch (error) {
      console.error('Failed to execute automation rules:', error);
    }
  }

  /**
   * Evaluate if conditions match
   */
  private static evaluateConditions(
    conditions: any,
    ticket: any,
    context: Record<string, any>
  ): boolean {
    if (!conditions) return true;

    try {
      const conditionsObj = typeof conditions === 'string' ? JSON.parse(conditions) : conditions;

      // Simple condition evaluation
      for (const [key, value] of Object.entries(conditionsObj)) {
        const ticketValue = ticket[key] || context[key];
        
        if (Array.isArray(value)) {
          // Check if ticket value is in array
          if (!value.includes(ticketValue)) return false;
        } else if (typeof value === 'object' && value !== null) {
          // Handle operators like { $gt: 5, $lt: 10 }
          const operators = value as Record<string, any>;
          if (operators.$gt !== undefined && ticketValue <= operators.$gt) return false;
          if (operators.$lt !== undefined && ticketValue >= operators.$lt) return false;
          if (operators.$eq !== undefined && ticketValue !== operators.$eq) return false;
        } else {
          // Direct equality check
          if (ticketValue !== value) return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to evaluate conditions:', error);
      return false;
    }
  }

  /**
   * Execute automation actions
   */
  private static async executeActions(
    ruleId: string,
    ticketId: string,
    actions: any
  ): Promise<void> {
    try {
      const actionsArray = typeof actions === 'string' ? JSON.parse(actions) : actions;

      if (!Array.isArray(actionsArray)) return;

      for (const action of actionsArray) {
        await this.executeAction(ticketId, action);
      }

      // Log automation execution
      await supabase.from('automation_logs').insert({
        automation_rule_id: ruleId,
        ticket_id: ticketId,
        executed_at: new Date().toISOString(),
        status: 'success',
      });
    } catch (error) {
      console.error('Failed to execute actions:', error);
      
      // Log failure
      await supabase.from('automation_logs').insert({
        automation_rule_id: ruleId,
        ticket_id: ticketId,
        executed_at: new Date().toISOString(),
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Execute a single action
   */
  private static async executeAction(ticketId: string, action: any): Promise<void> {
    const { type, parameters } = action;

    switch (type) {
      case 'assign_agent':
        await supabase
          .from('tickets')
          .update({ assigned_to: parameters.agent_id })
          .eq('id', ticketId);
        break;

      case 'change_status':
        await supabase
          .from('tickets')
          .update({ status: parameters.status })
          .eq('id', ticketId);
        break;

      case 'update_priority':
        await supabase
          .from('tickets')
          .update({ priority: parameters.priority })
          .eq('id', ticketId);
        break;

      case 'add_tag':
        // Get current tags
        const { data: ticket } = await supabase
          .from('tickets')
          .select('tags')
          .eq('id', ticketId)
          .single();

        if (ticket) {
          const currentTags = Array.isArray(ticket.tags) ? ticket.tags : [];
          const newTags = [...new Set([...currentTags, parameters.tag])];
          
          await supabase
            .from('tickets')
            .update({ tags: newTags })
            .eq('id', ticketId);
        }
        break;

      case 'send_email':
        // This would integrate with email service
        console.log('Send email action:', parameters);
        break;

      case 'close_ticket':
        await supabase
          .from('tickets')
          .update({ 
            status: 'closed',
            closed_at: new Date().toISOString(),
          })
          .eq('id', ticketId);
        break;

      default:
        console.warn('Unknown action type:', type);
    }
  }

  /**
   * Get automation execution logs
   */
  static async getExecutionLogs(
    organizationId: string,
    limit: number = 50
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('automation_logs')
      .select(`
        *,
        automation_rules!inner(name, organization_id),
        tickets(subject)
      `)
      .eq('automation_rules.organization_id', organizationId)
      .order('executed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch automation logs:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get automation statistics
   */
  static async getStatistics(organizationId: string): Promise<{
    totalRules: number;
    activeRules: number;
    totalExecutions: number;
    successRate: number;
  }> {
    const { data: rules } = await supabase
      .from('automation_rules')
      .select('id, is_active')
      .eq('organization_id', organizationId);

    const { data: logs } = await supabase
      .from('automation_logs')
      .select('status, automation_rules!inner(organization_id)')
      .eq('automation_rules.organization_id', organizationId);

    const totalRules = rules?.length || 0;
    const activeRules = rules?.filter(r => r.is_active).length || 0;
    const totalExecutions = logs?.length || 0;
    const successfulExecutions = logs?.filter(l => l.status === 'success').length || 0;
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

    return {
      totalRules,
      activeRules,
      totalExecutions,
      successRate,
    };
  }
}
