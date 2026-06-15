import { supabase } from '@/integrations/supabase/client';

/**
 * AI Service for ticket analysis, categorization, and response suggestions
 * Integrates with Groq API (free tier) for AI capabilities
 */

export interface AIAnalysisResult {
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  intent?: string;
  priority_score?: number;
  suggested_response?: string;
  confidence?: number;
}

export interface AITicketAnalysis {
  ticketId: string;
  category: string;
  sentiment: string;
  intent: string;
  priorityScore: number;
  suggestedResponse: string;
  confidence: number;
}

export class AIService {
  private static GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
  private static GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  private static MODEL = 'mixtral-8x7b-32768'; // Free tier model

  /**
   * Analyze ticket content using AI
   */
  static async analyzeTicket(
    ticketId: string,
    subject: string,
    description: string
  ): Promise<AIAnalysisResult> {
    try {
      // If no API key, return basic analysis
      if (!this.GROQ_API_KEY) {
        console.warn('GROQ_API_KEY not configured, using fallback analysis');
        return this.fallbackAnalysis(subject, description);
      }

      const prompt = `Analyze this support ticket and provide:
1. Category (billing, technical, feature_request, bug_report, general)
2. Sentiment (positive, negative, neutral)
3. Intent (what the customer wants)
4. Priority score (1-5, where 5 is highest)
5. A suggested response (professional, helpful, concise)

Ticket Subject: ${subject}
Ticket Description: ${description}

Respond in JSON format:
{
  "category": "string",
  "sentiment": "string",
  "intent": "string",
  "priority_score": number,
  "suggested_response": "string",
  "confidence": number (0-1)
}`;

      const response = await fetch(this.GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant that analyzes customer support tickets.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from AI');
      }

      // Parse JSON response
      const analysis = JSON.parse(content);

      // Update ticket with AI analysis
      await supabase
        .from('tickets')
        .update({
          ai_category: analysis.category,
          ai_sentiment: analysis.sentiment,
          ai_intent: analysis.intent,
          ai_priority_score: analysis.priority_score,
          ai_suggested_response: analysis.suggested_response,
        })
        .eq('id', ticketId);

      return analysis;
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback to basic analysis
      return this.fallbackAnalysis(subject, description);
    }
  }

  /**
   * Fallback analysis when AI is not available
   */
  private static fallbackAnalysis(subject: string, description: string): AIAnalysisResult {
    const text = `${subject} ${description}`.toLowerCase();

    // Simple keyword-based categorization
    let category = 'general';
    if (text.includes('bill') || text.includes('payment') || text.includes('invoice')) {
      category = 'billing';
    } else if (text.includes('bug') || text.includes('error') || text.includes('broken')) {
      category = 'bug_report';
    } else if (text.includes('feature') || text.includes('request') || text.includes('add')) {
      category = 'feature_request';
    } else if (text.includes('help') || text.includes('how to') || text.includes('question')) {
      category = 'technical';
    }

    // Simple sentiment analysis
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    const positiveWords = ['thank', 'great', 'excellent', 'love', 'happy'];
    const negativeWords = ['angry', 'frustrated', 'terrible', 'awful', 'hate', 'urgent'];

    const hasPositive = positiveWords.some(word => text.includes(word));
    const hasNegative = negativeWords.some(word => text.includes(word));

    if (hasPositive && !hasNegative) sentiment = 'positive';
    else if (hasNegative && !hasPositive) sentiment = 'negative';

    // Priority based on urgency keywords
    let priority_score = 3;
    if (text.includes('urgent') || text.includes('critical') || text.includes('asap')) {
      priority_score = 5;
    } else if (text.includes('important') || text.includes('soon')) {
      priority_score = 4;
    } else if (text.includes('whenever') || text.includes('no rush')) {
      priority_score = 2;
    }

    return {
      category,
      sentiment,
      intent: 'Customer needs assistance',
      priority_score,
      suggested_response: 'Thank you for contacting us. We have received your request and will respond shortly.',
      confidence: 0.6,
    };
  }

  /**
   * Generate AI response suggestion for a ticket
   */
  static async generateResponse(
    ticketSubject: string,
    ticketDescription: string,
    conversationHistory?: string[]
  ): Promise<string> {
    try {
      if (!this.GROQ_API_KEY) {
        return 'Thank you for contacting us. We are reviewing your request and will respond shortly.';
      }

      const historyContext = conversationHistory?.length
        ? `\n\nPrevious conversation:\n${conversationHistory.join('\n')}`
        : '';

      const prompt = `Generate a professional, helpful response to this customer support ticket:

Subject: ${ticketSubject}
Description: ${ticketDescription}${historyContext}

Requirements:
- Be professional and empathetic
- Address the customer's concern directly
- Provide actionable next steps if applicable
- Keep it concise (2-3 paragraphs max)
- End with an offer to help further`;

      const response = await fetch(this.GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a professional customer support agent. Write helpful, empathetic responses.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Thank you for your message. We will respond shortly.';
    } catch (error) {
      console.error('AI response generation error:', error);
      return 'Thank you for contacting us. We are reviewing your request and will respond shortly.';
    }
  }

  /**
   * Categorize multiple tickets in batch
   */
  static async batchAnalyzeTickets(
    tickets: Array<{ id: string; subject: string; description: string }>
  ): Promise<AIAnalysisResult[]> {
    const results: AIAnalysisResult[] = [];

    for (const ticket of tickets) {
      const analysis = await this.analyzeTicket(ticket.id, ticket.subject, ticket.description);
      results.push(analysis);
      
      // Rate limiting - wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  /**
   * Get AI insights for analytics
   */
  static async getTicketInsights(organizationId: string, days: number = 30): Promise<{
    topCategories: Array<{ category: string; count: number }>;
    sentimentDistribution: { positive: number; negative: number; neutral: number };
    averagePriorityScore: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: tickets } = await supabase
      .from('tickets')
      .select('ai_category, ai_sentiment, ai_priority_score')
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString())
      .not('ai_category', 'is', null);

    if (!tickets || tickets.length === 0) {
      return {
        topCategories: [],
        sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
        averagePriorityScore: 0,
      };
    }

    // Calculate category distribution
    const categoryCount: Record<string, number> = {};
    const sentimentCount = { positive: 0, negative: 0, neutral: 0 };
    let totalPriority = 0;

    tickets.forEach(ticket => {
      if (ticket.ai_category) {
        categoryCount[ticket.ai_category] = (categoryCount[ticket.ai_category] || 0) + 1;
      }
      if (ticket.ai_sentiment) {
        sentimentCount[ticket.ai_sentiment as keyof typeof sentimentCount]++;
      }
      if (ticket.ai_priority_score) {
        totalPriority += ticket.ai_priority_score;
      }
    });

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      topCategories,
      sentimentDistribution: sentimentCount,
      averagePriorityScore: totalPriority / tickets.length,
    };
  }
}
