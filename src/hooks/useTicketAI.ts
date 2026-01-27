import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CategoryResult {
  category: string;
  confidence: number;
  reasoning: string;
}

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated' | 'urgent';
  score: number;
  emotions: string[];
  reasoning: string;
}

export interface ResponseSuggestion {
  title: string;
  content: string;
  tone: 'formal' | 'friendly' | 'concise';
}

export interface FullAnalysisResult {
  category: string;
  category_confidence: number;
  sentiment: string;
  sentiment_score: number;
  emotions: string[];
  priority_recommendation: string;
  key_issues: string[];
  suggested_actions: string[];
  summary: string;
}

export function useTicketAI() {
  const [loading, setLoading] = useState(false);
  const [categoryResult, setCategoryResult] = useState<CategoryResult | null>(null);
  const [sentimentResult, setSentimentResult] = useState<SentimentResult | null>(null);
  const [suggestions, setSuggestions] = useState<ResponseSuggestion[]>([]);
  const [fullAnalysis, setFullAnalysis] = useState<FullAnalysisResult | null>(null);

  const analyzeTicket = useCallback(async (
    type: 'categorize' | 'sentiment' | 'suggest_response' | 'full_analysis',
    subject: string,
    description: string,
    messages: string[] = []
  ) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-ticket', {
        body: { type, subject, description, messages }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return null;
      }

      switch (type) {
        case 'categorize':
          setCategoryResult(data.result);
          break;
        case 'sentiment':
          setSentimentResult(data.result);
          break;
        case 'suggest_response':
          setSuggestions(data.result.suggestions || []);
          break;
        case 'full_analysis':
          setFullAnalysis(data.result);
          break;
      }

      return data.result;
    } catch (err: any) {
      console.error('AI analysis error:', err);
      toast.error(err.message || 'AI analysis failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const categorize = useCallback((subject: string, description: string) => {
    return analyzeTicket('categorize', subject, description);
  }, [analyzeTicket]);

  const analyzeSentiment = useCallback((subject: string, description: string, messages: string[] = []) => {
    return analyzeTicket('sentiment', subject, description, messages);
  }, [analyzeTicket]);

  const suggestResponses = useCallback((subject: string, description: string, messages: string[] = []) => {
    return analyzeTicket('suggest_response', subject, description, messages);
  }, [analyzeTicket]);

  const performFullAnalysis = useCallback((subject: string, description: string, messages: string[] = []) => {
    return analyzeTicket('full_analysis', subject, description, messages);
  }, [analyzeTicket]);

  const clearResults = useCallback(() => {
    setCategoryResult(null);
    setSentimentResult(null);
    setSuggestions([]);
    setFullAnalysis(null);
  }, []);

  return {
    loading,
    categoryResult,
    sentimentResult,
    suggestions,
    fullAnalysis,
    categorize,
    analyzeSentiment,
    suggestResponses,
    performFullAnalysis,
    clearResults,
  };
}
