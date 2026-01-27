import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareText, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CannedResponse {
  id: string;
  name: string;
  content: string;
  category: string;
}

const CANNED_RESPONSES: CannedResponse[] = [
  // Greetings
  {
    id: 'greeting-1',
    name: 'Welcome',
    content: 'Hello! Thank you for reaching out. I\'d be happy to help you with this.',
    category: 'Greetings',
  },
  {
    id: 'greeting-2',
    name: 'Thanks for patience',
    content: 'Thank you for your patience while we looked into this. I have an update for you.',
    category: 'Greetings',
  },
  // Common Issues
  {
    id: 'common-1',
    name: 'Request More Info',
    content: 'To better assist you, could you please provide more details about the issue you\'re experiencing? Specifically:\n\n- What steps did you take before the issue occurred?\n- What error message (if any) are you seeing?\n- What browser/device are you using?',
    category: 'Common Issues',
  },
  {
    id: 'common-2',
    name: 'Try clearing cache',
    content: 'This issue can often be resolved by clearing your browser cache and cookies. Here\'s how:\n\n1. Open your browser settings\n2. Navigate to Privacy & Security\n3. Clear browsing data\n4. Select "Cached images and files"\n5. Click "Clear data"\n\nPlease try this and let me know if the issue persists.',
    category: 'Common Issues',
  },
  {
    id: 'common-3',
    name: 'Password reset',
    content: 'You can reset your password by following these steps:\n\n1. Go to the login page\n2. Click "Forgot Password"\n3. Enter your email address\n4. Check your inbox for the reset link\n5. Follow the link to set a new password\n\nThe link expires in 24 hours. Let me know if you need further assistance!',
    category: 'Common Issues',
  },
  // Closing
  {
    id: 'closing-1',
    name: 'Issue Resolved',
    content: 'I\'m glad we could resolve this for you! Is there anything else I can help you with today?',
    category: 'Closing',
  },
  {
    id: 'closing-2',
    name: 'Follow up',
    content: 'I wanted to follow up on your recent support request. Has the issue been resolved, or do you need any additional assistance?',
    category: 'Closing',
  },
  {
    id: 'closing-3',
    name: 'Closing ticket',
    content: 'Since we haven\'t heard back from you, I\'ll be closing this ticket for now. If you need any further assistance, please don\'t hesitate to create a new ticket or reply to this thread. Thank you!',
    category: 'Closing',
  },
  // Escalation
  {
    id: 'escalation-1',
    name: 'Escalation Notice',
    content: 'I\'m escalating this to our specialized team for further assistance. They have more expertise in this area and will be able to help you better. You should hear from them within 24 hours.',
    category: 'Escalation',
  },
  {
    id: 'escalation-2',
    name: 'Manager review',
    content: 'I understand this is a priority for you. I\'m flagging this for review by our team lead to ensure we find the best solution. I\'ll update you as soon as I have more information.',
    category: 'Escalation',
  },
];

const CATEGORIES = ['All', 'Greetings', 'Common Issues', 'Closing', 'Escalation'];

interface CannedResponsesProps {
  onSelect: (content: string) => void;
}

export function CannedResponses({ onSelect }: CannedResponsesProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filteredResponses = CANNED_RESPONSES.filter((response) => {
    const matchesSearch =
      search === '' ||
      response.name.toLowerCase().includes(search.toLowerCase()) ||
      response.content.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === 'All' || response.category === category;

    return matchesSearch && matchesCategory;
  });

  const handleSelect = (content: string) => {
    onSelect(content);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquareText className="h-4 w-4 mr-2" />
          Canned Responses
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[400px] p-0">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search responses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="w-full justify-start h-auto flex-wrap gap-1 p-2 bg-transparent">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="text-xs px-2 py-1 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="h-[300px]">
            <div className="p-2 space-y-1">
              {filteredResponses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No responses found
                </p>
              ) : (
                filteredResponses.map((response) => (
                  <button
                    key={response.id}
                    onClick={() => handleSelect(response.content)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg hover:bg-muted transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-ring'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{response.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {response.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {response.content}
                    </p>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
