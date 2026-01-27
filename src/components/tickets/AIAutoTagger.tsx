import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Sparkles, Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTicketAI, CategoryResult } from '@/hooks/useTicketAI';

interface AIAutoTaggerProps {
  subject: string;
  description: string;
  currentCategory?: string | null;
  onCategoryApply: (category: string) => void;
  autoRun?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  technical: 'Technical Support',
  billing: 'Billing & Payments',
  account: 'Account Management',
  feature_request: 'Feature Request',
  bug_report: 'Bug Report',
  general: 'General Inquiry',
};

export function AIAutoTagger({
  subject,
  description,
  currentCategory,
  onCategoryApply,
  autoRun = false,
}: AIAutoTaggerProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { loading, categoryResult, categorize } = useTicketAI();

  useEffect(() => {
    if (autoRun && !currentCategory && subject && description) {
      categorize(subject, description);
    }
  }, [autoRun, currentCategory, subject, description, categorize]);

  const handleCategorize = async () => {
    const result = await categorize(subject, description);
    if (result && result.confidence >= 80) {
      // High confidence - auto-apply
      onCategoryApply(result.category);
    } else if (result && result.confidence >= 60) {
      // Medium confidence - ask for confirmation
      setShowConfirm(true);
    }
    // Low confidence - just show result, don't auto-apply
  };

  const handleConfirmApply = () => {
    if (categoryResult) {
      onCategoryApply(categoryResult.category);
    }
    setShowConfirm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-sm text-muted-foreground">Analyzing content...</span>
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  if (categoryResult) {
    const isHighConfidence = categoryResult.confidence >= 80;
    const isMediumConfidence = categoryResult.confidence >= 60 && categoryResult.confidence < 80;
    const isLowConfidence = categoryResult.confidence < 60;

    return (
      <>
        <div className={cn(
          'p-3 rounded-lg border space-y-2',
          isHighConfidence && 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
          isMediumConfidence && 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
          isLowConfidence && 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Suggestion</span>
            </div>
            {isHighConfidence && (
              <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                <Check className="h-3 w-3 mr-1" />
                Auto-applied
              </Badge>
            )}
            {isMediumConfidence && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Review suggested
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge>{CATEGORY_LABELS[categoryResult.category] || categoryResult.category}</Badge>
            <div className="flex-1 flex items-center gap-2">
              <Progress
                value={categoryResult.confidence}
                className={cn(
                  'h-2 flex-1',
                  isHighConfidence && '[&>div]:bg-green-500',
                  isMediumConfidence && '[&>div]:bg-yellow-500',
                  isLowConfidence && '[&>div]:bg-red-500'
                )}
              />
              <span className="text-xs text-muted-foreground w-10">
                {categoryResult.confidence}%
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">{categoryResult.reasoning}</p>

          {!isHighConfidence && categoryResult.category !== currentCategory && (
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="secondary" onClick={() => onCategoryApply(categoryResult.category)}>
                <Check className="h-3 w-3 mr-1" />
                Apply
              </Button>
              <Button size="sm" variant="ghost" onClick={() => categorize(subject, description)}>
                Re-analyze
              </Button>
            </div>
          )}
        </div>

        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apply AI Category Suggestion?</AlertDialogTitle>
              <AlertDialogDescription>
                AI suggests categorizing this ticket as{' '}
                <strong>{CATEGORY_LABELS[categoryResult.category] || categoryResult.category}</strong>{' '}
                with {categoryResult.confidence}% confidence.
                <br /><br />
                <em>"{categoryResult.reasoning}"</em>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Dismiss</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmApply}>
                Apply Category
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCategorize}
      className="gap-2"
    >
      <Sparkles className="h-4 w-4" />
      Auto-categorize
    </Button>
  );
}
