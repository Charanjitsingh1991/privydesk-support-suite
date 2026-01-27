import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Target,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTicketAI, FullAnalysisResult, ResponseSuggestion } from '@/hooks/useTicketAI';

interface AIInsightsPanelProps {
  subject: string;
  description: string;
  messages?: string[];
  currentCategory?: string | null;
  onApplyCategory?: (category: string) => void;
  onApplySuggestion?: (content: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  technical: 'Technical Support',
  billing: 'Billing & Payments',
  account: 'Account Management',
  feature_request: 'Feature Request',
  bug_report: 'Bug Report',
  general: 'General Inquiry',
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  negative: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  frustrated: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export function AIInsightsPanel({
  subject,
  description,
  messages = [],
  currentCategory,
  onApplyCategory,
  onApplySuggestion,
}: AIInsightsPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    loading,
    fullAnalysis,
    suggestions,
    performFullAnalysis,
    suggestResponses,
    clearResults,
  } = useTicketAI();

  const handleAnalyze = async () => {
    clearResults();
    await performFullAnalysis(subject, description, messages);
  };

  const handleGetSuggestions = async () => {
    await suggestResponses(subject, description, messages);
    setShowSuggestions(true);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                AI Insights
                <Badge variant="secondary" className="text-xs">Beta</Badge>
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Analyze Button */}
            {!fullAnalysis && !loading && (
              <Button
                onClick={handleAnalyze}
                className="w-full"
                variant="outline"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Ticket
              </Button>
            )}

            {/* Loading State */}
            {loading && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Analyzing ticket...
                </div>
                <Skeleton className="h-20" />
                <Skeleton className="h-12" />
              </div>
            )}

            {/* Analysis Results */}
            {fullAnalysis && !loading && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{fullAnalysis.summary}</p>
                </div>

                {/* Category & Confidence */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Category
                    </span>
                    {onApplyCategory && fullAnalysis.category !== currentCategory && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs"
                        onClick={() => onApplyCategory(fullAnalysis.category)}
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {CATEGORY_LABELS[fullAnalysis.category] || fullAnalysis.category}
                    </Badge>
                    <div className="flex-1 flex items-center gap-2">
                      <Progress value={fullAnalysis.category_confidence} className="h-2" />
                      <span className="text-xs text-muted-foreground">
                        {fullAnalysis.category_confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sentiment */}
                <div className="space-y-2">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Sentiment
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={cn('capitalize', SENTIMENT_COLORS[fullAnalysis.sentiment])}>
                      {fullAnalysis.sentiment}
                    </Badge>
                    {fullAnalysis.emotions.slice(0, 3).map((emotion) => (
                      <Badge key={emotion} variant="outline" className="text-xs">
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Priority Recommendation */}
                <div className="space-y-2">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Recommended Priority
                  </span>
                  <Badge className={cn('capitalize', PRIORITY_COLORS[fullAnalysis.priority_recommendation])}>
                    {fullAnalysis.priority_recommendation}
                  </Badge>
                </div>

                {/* Key Issues */}
                {fullAnalysis.key_issues.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Key Issues</span>
                    <ul className="space-y-1">
                      {fullAnalysis.key_issues.map((issue, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Actions */}
                {fullAnalysis.suggested_actions.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Suggested Actions
                    </span>
                    <ul className="space-y-1">
                      {fullAnalysis.suggested_actions.map((action, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Re-analyze & Get Suggestions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Re-analyze
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGetSuggestions}
                    disabled={loading}
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Get Response Ideas
                  </Button>
                </div>
              </div>
            )}

            {/* Response Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <SuggestionsSection
                suggestions={suggestions}
                onApply={onApplySuggestion}
                onClose={() => setShowSuggestions(false)}
              />
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

interface SuggestionsSectionProps {
  suggestions: ResponseSuggestion[];
  onApply?: (content: string) => void;
  onClose: () => void;
}

function SuggestionsSection({ suggestions, onApply, onClose }: SuggestionsSectionProps) {
  return (
    <div className="space-y-3 pt-3 border-t">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-1">
          <Lightbulb className="h-3 w-3" />
          Response Suggestions
        </span>
        <Button variant="ghost" size="sm" className="h-6" onClick={onClose}>
          ×
        </Button>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, i) => (
          <div
            key={i}
            className="p-3 bg-background rounded-lg border space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{suggestion.title}</span>
              <Badge variant="outline" className="text-xs capitalize">
                {suggestion.tone}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {suggestion.content}
            </p>
            {onApply && (
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={() => onApply(suggestion.content)}
              >
                Use This Response
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
