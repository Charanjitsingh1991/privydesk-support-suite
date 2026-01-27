import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tag, Sparkles, Check, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTicketAI } from '@/hooks/useTicketAI';

interface AITagExtractorProps {
  subject: string;
  description: string;
  currentTags?: string[];
  onApplyTags: (tags: string[]) => void;
}

export function AITagExtractor({
  subject,
  description,
  currentTags = [],
  onApplyTags,
}: AITagExtractorProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { loading, tagsResult, extractTags } = useTicketAI();

  const handleExtract = async () => {
    const result = await extractTags(subject, description);
    if (result?.tags) {
      // Pre-select tags that aren't already on the ticket
      const newTags = result.tags.filter((tag: string) => !currentTags.includes(tag));
      setSelectedTags(newTags);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleApply = () => {
    const combinedTags = [...new Set([...currentTags, ...selectedTags])];
    onApplyTags(combinedTags);
    setSelectedTags([]);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
        <Tag className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-sm text-muted-foreground">Extracting tags...</span>
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-14" />
      </div>
    );
  }

  if (tagsResult) {
    const suggestedTags = tagsResult.tags.filter(tag => !currentTags.includes(tag));
    
    if (suggestedTags.length === 0) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-green-600" />
          All suggested tags already applied
          <Button variant="ghost" size="sm" onClick={handleExtract} className="h-7">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Suggested Tags</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleExtract} className="h-7">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {suggestedTags.map((tag) => (
            <TooltipProvider key={tag}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedTags.includes(tag) && "bg-primary"
                    )}
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                    {selectedTags.includes(tag) && (
                      <Check className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Click to {selectedTags.includes(tag) ? 'deselect' : 'select'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {tagsResult.reasoning && (
          <p className="text-xs text-muted-foreground">{tagsResult.reasoning}</p>
        )}

        {selectedTags.length > 0 && (
          <Button size="sm" onClick={handleApply} className="w-full">
            <Check className="h-3 w-3 mr-1" />
            Apply {selectedTags.length} Tag{selectedTags.length > 1 ? 's' : ''}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExtract}
      className="gap-2"
    >
      <Tag className="h-4 w-4" />
      Extract Tags
    </Button>
  );
}
