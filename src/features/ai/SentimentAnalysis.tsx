import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smile, Frown, Meh, TrendingUp, TrendingDown } from 'lucide-react';

interface SentimentData {
  score: number;
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

interface SentimentAnalysisProps {
  text: string;
  ticketId?: string;
}

export function SentimentAnalysis({ text, ticketId }: SentimentAnalysisProps) {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (text && text.length > 10) {
      analyzeSentiment(text);
    }
  }, [text]);

  const analyzeSentiment = async (content: string) => {
    setLoading(true);
    
    // Simulate AI sentiment analysis
    // In production, this would call an AI API (OpenAI, Hugging Face, etc.)
    setTimeout(() => {
      const score = Math.random() * 2 - 1; // -1 to 1
      let label: 'positive' | 'neutral' | 'negative';
      
      if (score > 0.3) label = 'positive';
      else if (score < -0.3) label = 'negative';
      else label = 'neutral';

      setSentiment({
        score,
        label,
        confidence: 0.75 + Math.random() * 0.2,
      });
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <Card className="p-4 bg-white/5 border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-accent-lime border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white/60 text-sm">Analyzing sentiment...</span>
        </div>
      </Card>
    );
  }

  if (!sentiment) return null;

  const getSentimentIcon = () => {
    switch (sentiment.label) {
      case 'positive':
        return <Smile className="w-5 h-5 text-green-500" />;
      case 'negative':
        return <Frown className="w-5 h-5 text-red-500" />;
      default:
        return <Meh className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getSentimentColor = () => {
    switch (sentiment.label) {
      case 'positive':
        return 'bg-green-500/10 border-green-500/20 text-green-500';
      case 'negative':
        return 'bg-red-500/10 border-red-500/20 text-red-500';
      default:
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
    }
  };

  return (
    <Card className={`p-4 border ${getSentimentColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getSentimentIcon()}
          <div>
            <p className="font-semibold capitalize">{sentiment.label} Sentiment</p>
            <p className="text-sm opacity-80">
              Confidence: {(sentiment.confidence * 100).toFixed(0)}%
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-current">
          AI Analysis
        </Badge>
      </div>
    </Card>
  );
}

/**
 * Sentiment trend component for analytics
 */
export function SentimentTrend({ data }: { data: Array<{ date: string; sentiment: number }> }) {
  const avgSentiment = data.reduce((acc, d) => acc + d.sentiment, 0) / data.length;
  const trend = data[data.length - 1].sentiment - data[0].sentiment;

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Sentiment Trend</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-white">
            {avgSentiment > 0 ? '+' : ''}{(avgSentiment * 100).toFixed(1)}%
          </p>
          <p className="text-white/60">Average Sentiment</p>
        </div>
        <div className="flex items-center gap-2">
          {trend > 0 ? (
            <>
              <TrendingUp className="w-6 h-6 text-green-500" />
              <span className="text-green-500 font-semibold">Improving</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-6 h-6 text-red-500" />
              <span className="text-red-500 font-semibold">Declining</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
