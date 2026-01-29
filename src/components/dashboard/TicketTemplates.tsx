import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TicketTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  priority: string;
  category: string;
  usage_count: number;
  is_active: boolean;
}

interface TicketTemplatesProps {
  organizationId: string;
}

export function TicketTemplates({ organizationId }: TicketTemplatesProps) {
  const [templates, setTemplates] = useState<TicketTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_templates')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ticket templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('ticket_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== templateId));
      
      toast({
        title: 'Success',
        description: 'Template deleted',
      });
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-500';
      case 'high': return 'bg-orange-500/10 text-orange-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500';
      case 'low': return 'bg-green-500/10 text-green-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [organizationId]);

  return (
    <Card className="bg-[#1a1a1a] border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Ticket Templates</CardTitle>
            <CardDescription className="text-gray-400">
              Create tickets faster with predefined templates
            </CardDescription>
          </div>
          <Button className="bg-lime-500 text-black hover:bg-lime-400">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No templates created yet</p>
            <Button
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              Create Your First Template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{template.name}</h3>
                    {template.description && (
                      <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTemplate(template.id);
                      }}
                      className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getPriorityColor(template.priority)}>
                    {template.priority}
                  </Badge>
                  {template.category && (
                    <Badge className="bg-blue-500/10 text-blue-500">
                      {template.category}
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  <div className="mb-1">
                    <span className="font-medium">Subject:</span> {template.subject}
                  </div>
                  <div className="text-xs">
                    Used {template.usage_count} times
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
