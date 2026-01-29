import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Lightbulb, Copy, Check, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTicketAI, ResponseSuggestion } from '@/hooks/useTicketAI';
import { toast } from 'sonner';

interface AIResponseSuggesterProps {
  subject: string;
  description: string;
  messages?: string[];
  onSelect?: (content: string) => void;
  disabled?: boolean;
}

export function AIResponseSuggester({
  subject,
  description,
  messages = [],
  onSelect,
  disabled = false,
}: AIResponseSuggesterProps) {
  const [open, setOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { loading, suggestions, suggestResponses, clearResults } = useTicketAI();

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && suggestions.length === 0) {
      await suggestResponses(subject, description, messages);
    }
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSelect = (content: string) => {
    onSelect?.(content);
    setOpen(false);
    toast.success('Response inserted');
  };

  const handleRefresh = () => {
    clearResults();
    suggestResponses(subject, description, messages);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          AI Suggestions
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Response Suggestions
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              Generate New
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            {loading && (
              <>
                <SuggestionSkeleton />
                <SuggestionSkeleton />
                <SuggestionSkeleton />
              </>
            )}

            {!loading && suggestions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No suggestions available</p>
                <Button variant="link" onClick={handleRefresh}>
                  Try again
                </Button>
              </div>
            )}

            {!loading && suggestions.map((suggestion, index) => (
              <SuggestionCard
                key={index}
                suggestion={suggestion}
                index={index}
                copied={copiedIndex === index}
                onCopy={() => handleCopy(suggestion.content, index)}
                onSelect={() => handleSelect(suggestion.content)}
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

interface SuggestionCardProps {
  suggestion: ResponseSuggestion;
  index: number;
  copied: boolean;
  onCopy: () => void;
  onSelect: () => void;
}

function SuggestionCard({ suggestion, index, copied, onCopy, onSelect }: SuggestionCardProps) {
  const toneColors = {
    formal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    friendly: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    concise: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{suggestion.title}</CardTitle>
          <Badge
            variant="secondary"
            className={cn('text-xs capitalize', toneColors[suggestion.tone])}
          >
            {suggestion.tone}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-muted/50 rounded-md">
          <p className="text-sm whitespace-pre-wrap">{suggestion.content}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" className="flex-1" onClick={onSelect}>
            <Check className="h-3 w-3 mr-1" />
            Use Response
          </Button>
          <Button size="sm" variant="outline" onClick={onCopy}>
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SuggestionSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-10" />
        </div>
      </CardContent>
    </Card>
  );
}
