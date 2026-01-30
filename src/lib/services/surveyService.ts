import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Survey = Database['public']['Tables']['surveys']['Row'];
type SurveyResponse = Database['public']['Tables']['survey_responses']['Row'];

export interface SurveyStats {
  totalResponses: number;
  averageScore: number;
  npsScore?: number;
  csatScore?: number;
  cesScore?: number;
  responseRate: number;
}

export class SurveyService {
  /**
   * Get all surveys for an organization
   */
  static async getSurveys(organizationId: string): Promise<Survey[]> {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch surveys:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get a single survey
   */
  static async getSurvey(surveyId: string): Promise<Survey | null> {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single();

    if (error) {
      console.error('Failed to fetch survey:', error);
      return null;
    }

    return data;
  }

  /**
   * Create a new survey
   */
  static async createSurvey(
    organizationId: string,
    userId: string,
    survey: {
      name: string;
      type: 'csat' | 'nps' | 'ces' | 'custom';
      questions: any;
      trigger_event?: string;
      trigger_delay_minutes?: number;
      is_active?: boolean;
    }
  ): Promise<Survey | null> {
    const { data, error } = await supabase
      .from('surveys')
      .insert({
        organization_id: organizationId,
        created_by: userId,
        name: survey.name,
        type: survey.type,
        questions: survey.questions,
        trigger_event: survey.trigger_event || 'ticket_closed',
        trigger_delay_minutes: survey.trigger_delay_minutes || 60,
        is_active: survey.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create survey:', error);
      return null;
    }

    return data;
  }

  /**
   * Update a survey
   */
  static async updateSurvey(
    surveyId: string,
    updates: {
      name?: string;
      questions?: any;
      trigger_event?: string;
      trigger_delay_minutes?: number;
      is_active?: boolean;
    }
  ): Promise<boolean> {
    const { error } = await supabase
      .from('surveys')
      .update(updates)
      .eq('id', surveyId);

    if (error) {
      console.error('Failed to update survey:', error);
      return false;
    }

    return true;
  }

  /**
   * Delete a survey
   */
  static async deleteSurvey(surveyId: string): Promise<boolean> {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', surveyId);

    if (error) {
      console.error('Failed to delete survey:', error);
      return false;
    }

    return true;
  }

  /**
   * Submit a survey response
   */
  static async submitResponse(
    surveyId: string,
    ticketId: string,
    customerId: string,
    responses: {
      score: number;
      feedback?: string;
      question_responses?: any;
    }
  ): Promise<SurveyResponse | null> {
    const { data, error } = await supabase
      .from('survey_responses')
      .insert({
        survey_id: surveyId,
        ticket_id: ticketId,
        customer_id: customerId,
        score: responses.score,
        feedback: responses.feedback,
        question_responses: responses.question_responses,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to submit survey response:', error);
      return null;
    }

    return data;
  }

  /**
   * Get survey responses
   */
  static async getResponses(
    surveyId: string,
    limit: number = 100
  ): Promise<SurveyResponse[]> {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId)
      .order('submitted_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch survey responses:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Calculate CSAT score
   */
  static async calculateCSAT(surveyId: string): Promise<number> {
    const { data } = await supabase.rpc('calculate_csat_score', {
      p_survey_id: surveyId,
    });

    return data || 0;
  }

  /**
   * Calculate NPS score
   */
  static async calculateNPS(surveyId: string): Promise<number> {
    const { data } = await supabase.rpc('calculate_nps_score', {
      p_survey_id: surveyId,
    });

    return data || 0;
  }

  /**
   * Get survey statistics
   */
  static async getSurveyStats(surveyId: string): Promise<SurveyStats> {
    const { data: survey } = await supabase
      .from('surveys')
      .select('type, sent_count')
      .eq('id', surveyId)
      .single();

    const responses = await this.getResponses(surveyId);

    const totalResponses = responses.length;
    const sentCount = survey?.sent_count || 0;
    const responseRate = sentCount > 0 ? (totalResponses / sentCount) * 100 : 0;

    let averageScore = 0;
    if (totalResponses > 0) {
      const totalScore = responses.reduce((sum, r) => sum + (r.score || 0), 0);
      averageScore = totalScore / totalResponses;
    }

    const stats: SurveyStats = {
      totalResponses,
      averageScore,
      responseRate,
    };

    // Calculate specific scores based on survey type
    if (survey?.type === 'csat') {
      stats.csatScore = await this.calculateCSAT(surveyId);
    } else if (survey?.type === 'nps') {
      stats.npsScore = await this.calculateNPS(surveyId);
    } else if (survey?.type === 'ces') {
      stats.cesScore = averageScore;
    }

    return stats;
  }

  /**
   * Get survey trends over time
   */
  static async getSurveyTrends(
    organizationId: string,
    surveyType: 'csat' | 'nps' | 'ces',
    days: number = 30
  ): Promise<Array<{ date: string; score: number; responses: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: surveys } = await supabase
      .from('surveys')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('type', surveyType);

    if (!surveys || surveys.length === 0) return [];

    const surveyIds = surveys.map(s => s.id);

    const { data: responses } = await supabase
      .from('survey_responses')
      .select('score, submitted_at')
      .in('survey_id', surveyIds)
      .gte('submitted_at', startDate.toISOString())
      .order('submitted_at', { ascending: true });

    if (!responses || responses.length === 0) return [];

    // Group by date
    const trendsByDate: Record<string, { total: number; count: number }> = {};

    responses.forEach(response => {
      const date = new Date(response.submitted_at).toISOString().split('T')[0];
      if (!trendsByDate[date]) {
        trendsByDate[date] = { total: 0, count: 0 };
      }
      trendsByDate[date].total += response.score || 0;
      trendsByDate[date].count += 1;
    });

    return Object.entries(trendsByDate).map(([date, data]) => ({
      date,
      score: data.total / data.count,
      responses: data.count,
    }));
  }

  /**
   * Trigger survey for a ticket
   */
  static async triggerSurveyForTicket(ticketId: string): Promise<void> {
    try {
      // Get ticket details
      const { data: ticket } = await supabase
        .from('tickets')
        .select('organization_id, customer_id, status')
        .eq('id', ticketId)
        .single();

      if (!ticket || ticket.status !== 'closed') return;

      // Get active surveys for this organization
      const { data: surveys } = await supabase
        .from('surveys')
        .select('*')
        .eq('organization_id', ticket.organization_id)
        .eq('is_active', true)
        .eq('trigger_event', 'ticket_closed');

      if (!surveys || surveys.length === 0) return;

      // Send survey (this would integrate with email/notification service)
      for (const survey of surveys) {
        console.log(`Triggering survey ${survey.id} for ticket ${ticketId}`);
        
        // Update sent count
        await supabase
          .from('surveys')
          .update({ sent_count: (survey.sent_count || 0) + 1 })
          .eq('id', survey.id);
      }
    } catch (error) {
      console.error('Failed to trigger survey:', error);
    }
  }

  /**
   * Get feedback summary
   */
  static async getFeedbackSummary(
    organizationId: string,
    days: number = 30
  ): Promise<{
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    recentFeedback: Array<{ score: number; feedback: string; date: string }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: surveys } = await supabase
      .from('surveys')
      .select('id')
      .eq('organization_id', organizationId);

    if (!surveys || surveys.length === 0) {
      return {
        positiveCount: 0,
        neutralCount: 0,
        negativeCount: 0,
        recentFeedback: [],
      };
    }

    const surveyIds = surveys.map(s => s.id);

    const { data: responses } = await supabase
      .from('survey_responses')
      .select('score, feedback, submitted_at')
      .in('survey_id', surveyIds)
      .gte('submitted_at', startDate.toISOString())
      .order('submitted_at', { ascending: false });

    if (!responses || responses.length === 0) {
      return {
        positiveCount: 0,
        neutralCount: 0,
        negativeCount: 0,
        recentFeedback: [],
      };
    }

    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;

    responses.forEach(response => {
      if (response.score >= 4) positiveCount++;
      else if (response.score === 3) neutralCount++;
      else negativeCount++;
    });

    const recentFeedback = responses
      .filter(r => r.feedback)
      .slice(0, 10)
      .map(r => ({
        score: r.score || 0,
        feedback: r.feedback || '',
        date: r.submitted_at,
      }));

    return {
      positiveCount,
      neutralCount,
      negativeCount,
      recentFeedback,
    };
  }
}
