import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Search, Edit, Trash2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CannedResponse {
  id: string;
  title: string;
  shortcut: string;
  content: string;
  category: string;
  is_public: boolean;
  usage_count: number;
}

interface CannedResponsesProps {
  organizationId: string;
}

export function CannedResponses({ organizationId }: CannedResponsesProps) {
  const [responses, setResponses] = useState<CannedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('canned_responses')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Failed to fetch canned responses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load canned responses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (content: string, responseId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      
      // Increment usage count
      const response = responses.find(r => r.id === responseId);
      if (response) {
        await supabase
          .from('canned_responses')
          .update({ usage_count: (response.usage_count || 0) + 1 })
          .eq('id', responseId);
      }

      toast({
        title: 'Copied',
        description: 'Response copied to clipboard',
      });

      // Refresh to show updated usage count
      fetchResponses();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy response',
        variant: 'destructive',
      });
    }
  };

  const deleteResponse = async (responseId: string) => {
    if (!confirm('Are you sure you want to delete this canned response?')) return;

    try {
      const { error } = await supabase
        .from('canned_responses')
        .delete()
        .eq('id', responseId);

      if (error) throw error;

      setResponses(responses.filter(r => r.id !== responseId));
      
      toast({
        title: 'Success',
        description: 'Canned response deleted',
      });
    } catch (error) {
      console.error('Failed to delete canned response:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete canned response',
        variant: 'destructive',
      });
    }
  };

  const filteredResponses = responses.filter((response) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      response.title.toLowerCase().includes(searchLower) ||
      response.content.toLowerCase().includes(searchLower) ||
      response.shortcut?.toLowerCase().includes(searchLower) ||
      response.category?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    fetchResponses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  return (
    <Card className="bg-[#1a1a1a] border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Canned Responses</CardTitle>
            <CardDescription className="text-gray-400">
              Quick replies for common questions
            </CardDescription>
          </div>
          <Button className="bg-lime-500 text-black hover:bg-lime-400">
            <Plus className="w-4 h-4 mr-2" />
            New Response
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search responses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/20 border-white/10 text-white"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading responses...</div>
        ) : filteredResponses.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              {searchTerm ? 'No responses found' : 'No canned responses created yet'}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5"
              >
                Create Your First Response
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResponses.map((response) => (
              <div
                key={response.id}
                className="p-4 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{response.title}</h3>
                      {response.shortcut && (
                        <Badge className="bg-purple-500/10 text-purple-500 text-xs">
                          {response.shortcut}
                        </Badge>
                      )}
                      {response.category && (
                        <Badge className="bg-blue-500/10 text-blue-500 text-xs">
                          {response.category}
                        </Badge>
                      )}
                      {!response.is_public && (
                        <Badge className="bg-gray-500/10 text-gray-500 text-xs">
                          Private
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(response.content, response.id)}
                      className="text-gray-400 hover:text-lime-500 h-8 w-8 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white h-8 w-8 p-0"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteResponse(response.id)}
                      className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                  {response.content}
                </p>

                <div className="text-xs text-gray-500">
                  Used {response.usage_count} times
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
