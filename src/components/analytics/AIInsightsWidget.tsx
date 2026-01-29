import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Tag,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendingIssue {
  category: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

interface SentimentTrend {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

interface AIInsight {
  type: 'warning' | 'suggestion' | 'trend';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export function AIInsightsWidget() {
  const [loading, setLoading] = useState(true);
  const [trendingIssues, setTrendingIssues] = useState<TrendingIssue[]>([]);
  const [sentimentTrend, setSentimentTrend] = useState<SentimentTrend | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [topTags, setTopTags] = useState<{ tag: string; count: number }[]>([]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      // Fetch ticket distribution by category (last 7 days vs previous 7 days)
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const { data: recentTickets } = await supabase
        .from('tickets')
        .select('category, priority, status, tags')
        .gte('created_at', sevenDaysAgo.toISOString());

      const { data: previousTickets } = await supabase
        .from('tickets')
        .select('category')
        .gte('created_at', fourteenDaysAgo.toISOString())
        .lt('created_at', sevenDaysAgo.toISOString());

      // Calculate trending issues
      const categoryCount: Record<string, number> = {};
      const prevCategoryCount: Record<string, number> = {};
      
      recentTickets?.forEach(t => {
        const cat = t.category || 'general';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });

      previousTickets?.forEach(t => {
        const cat = t.category || 'general';
        prevCategoryCount[cat] = (prevCategoryCount[cat] || 0) + 1;
      });

      const trending: TrendingIssue[] = Object.entries(categoryCount)
        .map(([category, count]) => {
          const prevCount = prevCategoryCount[category] || 0;
          const change = prevCount > 0 ? ((count - prevCount) / prevCount) * 100 : 100;
          const trend: 'up' | 'down' | 'stable' = change > 10 ? 'up' : change < -10 ? 'down' : 'stable';
          return {
            category,
            count,
            trend,
            percentage: Math.abs(Math.round(change)),
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTrendingIssues(trending);

      // Calculate tag frequency
      const tagCounts: Record<string, number> = {};
      recentTickets?.forEach(t => {
        (t.tags || []).forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      const sortedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
      
      setTopTags(sortedTags);

      // Generate insights based on data
      const generatedInsights: AIInsight[] = [];

      // Check for priority escalations
      const urgentTickets = recentTickets?.filter(t => t.priority === 'urgent' || t.priority === 'high') || [];
      const openUrgent = urgentTickets.filter(t => t.status === 'open' || t.status === 'in_progress');
      
      if (openUrgent.length > 3) {
        generatedInsights.push({
          type: 'warning',
          title: 'High Priority Backlog',
          description: `${openUrgent.length} high/urgent priority tickets need attention`,
          priority: 'high',
        });
      }

      // Check for trending categories
      const risingCategories = trending.filter(t => t.trend === 'up' && t.percentage > 50);
      if (risingCategories.length > 0) {
        generatedInsights.push({
          type: 'trend',
          title: 'Rising Issue Categories',
          description: `${risingCategories.map(c => c.category).join(', ')} tickets increased significantly`,
          priority: 'medium',
        });
      }

      // Suggestion for common issues
      if (trending[0] && trending[0].count > 10) {
        generatedInsights.push({
          type: 'suggestion',
          title: 'Create Knowledge Base Article',
          description: `Consider documenting solutions for "${trending[0].category}" - it's your most common issue`,
          priority: 'low',
        });
      }

      setInsights(generatedInsights);

      // Simulated sentiment trend (in a real app, you'd store sentiment with tickets)
      setSentimentTrend({
        positive: 35,
        neutral: 45,
        negative: 20,
        total: recentTickets?.length || 0,
      });

    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const CATEGORY_LABELS: Record<string, string> = {
    technical: 'Technical',
    billing: 'Billing',
    account: 'Account',
    feature_request: 'Feature Request',
    bug_report: 'Bug Report',
    general: 'General',
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Insights
          <Badge variant="secondary" className="text-xs">Beta</Badge>
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={fetchInsights}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alerts & Insights */}
        {insights.length > 0 && (
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={cn(
                  'p-3 rounded-lg flex items-start gap-3',
                  insight.type === 'warning' && 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
                  insight.type === 'trend' && 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
                  insight.type === 'suggestion' && 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                )}
              >
                {insight.type === 'warning' && <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />}
                {insight.type === 'trend' && <Zap className="h-5 w-5 text-blue-600 shrink-0" />}
                {insight.type === 'suggestion' && <Lightbulb className="h-5 w-5 text-yellow-600 shrink-0" />}
                <div>
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trending Issues */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending Issues (7 days)
          </h4>
          <div className="space-y-2">
            {trendingIssues.map((issue) => (
              <div key={issue.category} className="flex items-center gap-3">
                <span className="text-sm w-28 truncate">
                  {CATEGORY_LABELS[issue.category] || issue.category}
                </span>
                <Progress value={(issue.count / (trendingIssues[0]?.count || 1)) * 100} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground w-8">{issue.count}</span>
                {issue.trend === 'up' && (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                )}
                {issue.trend === 'down' && (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Overview */}
        {sentimentTrend && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Customer Sentiment
            </h4>
            <div className="flex gap-2 h-4 rounded-full overflow-hidden">
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${sentimentTrend.positive}%` }}
                title={`Positive: ${sentimentTrend.positive}%`}
              />
              <div
                className="bg-gray-400 transition-all"
                style={{ width: `${sentimentTrend.neutral}%` }}
                title={`Neutral: ${sentimentTrend.neutral}%`}
              />
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${sentimentTrend.negative}%` }}
                title={`Negative: ${sentimentTrend.negative}%`}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Positive {sentimentTrend.positive}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                Neutral {sentimentTrend.neutral}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Negative {sentimentTrend.negative}%
              </span>
            </div>
          </div>
        )}

        {/* Top Tags */}
        {topTags.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Common Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {topTags.map(({ tag, count }) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <span className="text-xs opacity-70">({count})</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
