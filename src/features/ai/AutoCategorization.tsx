import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Tag, CheckCircle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  confidence: number;
  color: string;
}

interface AutoCategorizationProps {
  title: string;
  description: string;
  onCategorySelect: (category: string) => void;
}

export function AutoCategorization({
  title,
  description,
  onCategorySelect,
}: AutoCategorizationProps) {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (title && description) {
      categorizeTicket(title, description);
    }
  }, [title, description]);

  const categorizeTicket = async (ticketTitle: string, ticketDesc: string) => {
    setLoading(true);

    // Simulate AI categorization
    // In production, this would use OpenAI, Hugging Face, or custom ML model
    setTimeout(() => {
      const categories: Category[] = [
        { id: 'technical', name: 'Technical Support', confidence: 0.85, color: 'blue' },
        { id: 'billing', name: 'Billing', confidence: 0.65, color: 'green' },
        { id: 'feature', name: 'Feature Request', confidence: 0.45, color: 'purple' },
      ];

      // Simple keyword-based categorization (replace with AI in production)
      const content = (ticketTitle + ' ' + ticketDesc).toLowerCase();
      
      if (content.includes('bug') || content.includes('error') || content.includes('not working')) {
        categories[0].confidence = 0.95;
      } else if (content.includes('payment') || content.includes('invoice') || content.includes('billing')) {
        categories[1].confidence = 0.92;
        categories.sort((a, b) => b.confidence - a.confidence);
      } else if (content.includes('feature') || content.includes('add') || content.includes('improve')) {
        categories[2].confidence = 0.88;
        categories.sort((a, b) => b.confidence - a.confidence);
      }

      setSuggestions(categories.sort((a, b) => b.confidence - a.confidence));
      setLoading(false);
    }, 1500);
  };

  const handleSelectCategory = (category: Category) => {
    setSelected(category.id);
    onCategorySelect(category.name);
    toast({
      title: 'Category Applied',
      description: `Ticket categorized as "${category.name}"`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-lg">
        <div className="w-4 h-4 border-2 border-accent-lime border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white/60 text-sm">AI is analyzing and categorizing...</span>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-white/80">
        <Sparkles className="w-4 h-4 text-accent-lime" />
        <span className="text-sm font-medium">AI-Suggested Categories</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((category) => (
          <Button
            key={category.id}
            variant={selected === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSelectCategory(category)}
            className={`
              ${selected === category.id 
                ? 'bg-accent-lime text-black' 
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }
            `}
          >
            {selected === category.id && <CheckCircle className="w-3 h-3 mr-1" />}
            <Tag className="w-3 h-3 mr-1" />
            {category.name}
            <Badge 
              variant="secondary" 
              className="ml-2 text-xs bg-black/20"
            >
              {(category.confidence * 100).toFixed(0)}%
            </Badge>
          </Button>
        ))}
      </div>

      <p className="text-xs text-white/40">
        Powered by AI • Confidence scores indicate accuracy
      </p>
    </div>
  );
}

/**
 * Bulk categorization for multiple tickets
 */
export function BulkCategorization({ ticketIds }: { ticketIds: string[] }) {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleBulkCategorize = async () => {
    setProcessing(true);
    
    // Simulate bulk AI categorization
    setTimeout(() => {
      setProcessing(false);
      toast({
        title: 'Bulk Categorization Complete',
        description: `${ticketIds.length} tickets have been automatically categorized.`,
      });
    }, 2000);
  };

  return (
    <Button
      onClick={handleBulkCategorize}
      disabled={processing}
      className="bg-accent-lime text-black hover:bg-accent-lime/90"
    >
      <Sparkles className="w-4 h-4 mr-2" />
      {processing ? 'Processing...' : `Auto-Categorize ${ticketIds.length} Tickets`}
    </Button>
  );
}
