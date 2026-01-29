import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, ExternalLink, MessageCircle, Code, Palette, Settings, Clock } from 'lucide-react';
import type { WidgetConfig } from '@/types/widget';

const DEFAULT_TOPICS = [
  'Sales Inquiry',
  'Technical Support',
  'Billing Question',
  'General Question',
];

export default function ChatWidgetSettings() {
  const { profile } = useAuth();
  const [config, setConfig] = useState<Partial<WidgetConfig>>({
    is_enabled: true,
    primary_color: '#6366f1',
    position: 'bottom-right',
    welcome_message: 'Hi there! How can we help you today?',
    trigger_text: 'Chat with us',
    offline_message: "We're currently offline. Leave a message and we'll get back to you soon!",
    pre_chat_form_enabled: true,
    file_upload_enabled: true,
    emoji_picker_enabled: true,
    topics: DEFAULT_TOPICS,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newTopic, setNewTopic] = useState('');

  const orgId = profile?.organization_id;
  const widgetUrl = `${window.location.origin}/widget/${orgId}`;

  useEffect(() => {
    const fetchConfig = async () => {
      if (!orgId) return;

      const { data, error } = await supabase
        .from('widget_config')
        .select('*')
        .eq('organization_id', orgId)
        .single();

      if (data) {
        setConfig(data as unknown as WidgetConfig);
      } else if (error && error.code !== 'PGRST116') {
        console.error('Error fetching config:', error);
      }

      setIsLoading(false);
    };

    fetchConfig();
  }, [orgId]);

  const handleSave = async () => {
    if (!orgId) return;
    setIsSaving(true);

    try {
      const { error } = await supabase.from('widget_config').upsert(
        {
          organization_id: orgId,
          ...config,
        },
        { onConflict: 'organization_id' }
      );

      if (error) throw error;
      toast.success('Widget settings saved');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyEmbedCode = () => {
    const embedCode = `<script>
  (function(w,d,s,o,f,js,fjs){
    w['PrivyWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','privyWidget','${window.location.origin}/api/widget.js'));
  privyWidget('init', {orgId: '${orgId}'});
</script>`;

    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard');
  };

  const handleAddTopic = () => {
    if (!newTopic.trim()) return;
    const topics = [...(config.topics || []), newTopic.trim()];
    setConfig({ ...config, topics });
    setNewTopic('');
  };

  const handleRemoveTopic = (topic: string) => {
    const topics = (config.topics || []).filter((t) => t !== topic);
    setConfig({ ...config, topics });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chat Widget</h1>
            <p className="text-muted-foreground">
              Configure and embed a live chat widget on your website
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Widget</Label>
                    <p className="text-sm text-muted-foreground">
                      Show the chat widget on your website
                    </p>
                  </div>
                  <Switch
                    checked={config.is_enabled}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, is_enabled: checked })
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Widget Position</Label>
                    <Select
                      value={config.position}
                      onValueChange={(value: 'bottom-right' | 'bottom-left') =>
                        setConfig({ ...config, position: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Trigger Text</Label>
                    <Input
                      value={config.trigger_text}
                      onChange={(e) =>
                        setConfig({ ...config, trigger_text: e.target.value })
                      }
                      placeholder="Chat with us"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Welcome Message</Label>
                  <Textarea
                    value={config.welcome_message}
                    onChange={(e) =>
                      setConfig({ ...config, welcome_message: e.target.value })
                    }
                    placeholder="Hi there! How can we help you today?"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Offline Message</Label>
                  <Textarea
                    value={config.offline_message}
                    onChange={(e) =>
                      setConfig({ ...config, offline_message: e.target.value })
                    }
                    placeholder="We're currently offline..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.primary_color}
                      onChange={(e) =>
                        setConfig({ ...config, primary_color: e.target.value })
                      }
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={config.primary_color}
                      onChange={(e) =>
                        setConfig({ ...config, primary_color: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pre-Chat Form</Label>
                    <p className="text-sm text-muted-foreground">
                      Collect visitor info before chat starts
                    </p>
                  </div>
                  <Switch
                    checked={config.pre_chat_form_enabled}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, pre_chat_form_enabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>File Uploads</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow visitors to upload files
                    </p>
                  </div>
                  <Switch
                    checked={config.file_upload_enabled}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, file_upload_enabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Emoji Picker</Label>
                    <p className="text-sm text-muted-foreground">
                      Show emoji picker in chat
                    </p>
                  </div>
                  <Switch
                    checked={config.emoji_picker_enabled}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, emoji_picker_enabled: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Chat Topics
                </CardTitle>
                <CardDescription>
                  Topics visitors can choose when starting a chat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(config.topics || []).map((topic) => (
                    <Badge
                      key={topic}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveTopic(topic)}
                    >
                      {topic} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Add a topic..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                  />
                  <Button onClick={handleAddTopic} variant="outline">
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Embed Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Embed Code
                </CardTitle>
                <CardDescription>
                  Add this code to your website's HTML
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-3 rounded-lg">
                  <code className="text-xs break-all">
                    {`<script src="${window.location.origin}/api/widget.js" data-org="${orgId}"></script>`}
                  </code>
                </div>
                <Button onClick={handleCopyEmbedCode} className="w-full" variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Embed Code
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  Test your widget configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <a href={widgetUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Widget Preview
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Widget Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Widget Button</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-110"
                  style={{ backgroundColor: config.primary_color }}
                >
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
