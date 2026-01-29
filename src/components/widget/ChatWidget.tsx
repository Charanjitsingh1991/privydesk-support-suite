import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { MessageCircle, Minus, X, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PreChatForm } from './PreChatForm';
import { OfflineForm } from './OfflineForm';
import { ChatWindow } from './ChatWindow';
import type {
  WidgetConfig,
  WidgetVisitor,
  WidgetConversation,
  PreChatFormData,
} from '@/types/widget';

interface ChatWidgetProps {
  orgId: string;
}

const DEFAULT_CONFIG: WidgetConfig = {
  id: '',
  organization_id: '',
  is_enabled: true,
  primary_color: '#6366f1',
  position: 'bottom-right',
  welcome_message: 'Hi there! How can we help you today?',
  trigger_text: 'Chat with us',
  offline_message: "We're currently offline. Leave a message and we'll get back to you soon!",
  business_hours: { enabled: false, timezone: 'UTC', hours: {} },
  pre_chat_form_enabled: true,
  file_upload_enabled: true,
  emoji_picker_enabled: true,
  notification_sound: 'default',
  topics: ['Sales Inquiry', 'Technical Support', 'Billing Question', 'General Question'],
  created_at: '',
  updated_at: '',
};

export function ChatWidget({ orgId }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [isOnline, setIsOnline] = useState(false);
  const [visitor, setVisitor] = useState<WidgetVisitor | null>(null);
  const [conversation, setConversation] = useState<WidgetConversation | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreChat, setShowPreChat] = useState(true);
  const [orgName, setOrgName] = useState('Support');

  // Get or create session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('privy_widget_session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('privy_widget_session', sessionId);
    }
    return sessionId;
  };

  // Fetch widget config and org info
  useEffect(() => {
    const fetchConfig = async () => {
      // Fetch organization
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', orgId)
        .single();

      if (orgData) {
        setOrgName(orgData.name);
      }

      // Fetch widget config
      const { data } = await supabase
        .from('widget_config')
        .select('*')
        .eq('organization_id', orgId)
        .single();

      if (data) {
        setConfig(data as unknown as WidgetConfig);
      }
    };

    fetchConfig();
  }, [orgId]);

  // Check agent availability
  useEffect(() => {
    const checkAvailability = async () => {
      const { data } = await supabase
        .from('agent_availability')
        .select('*')
        .eq('organization_id', orgId)
        .eq('status', 'online');

      setIsOnline((data?.length || 0) > 0);
    };

    checkAvailability();

    // Subscribe to availability changes
    const channel = supabase
      .channel('agent_availability')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_availability',
          filter: `organization_id=eq.${orgId}`,
        },
        () => {
          checkAvailability();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId]);

  // Check for existing visitor and conversation
  useEffect(() => {
    const checkExistingSession = async () => {
      const sessionId = getSessionId();

      // Check for existing visitor
      const { data: visitorData } = await supabase
        .from('widget_visitors')
        .select('*')
        .eq('organization_id', orgId)
        .eq('session_id', sessionId)
        .single();

      if (visitorData) {
        setVisitor(visitorData as unknown as WidgetVisitor);
        setShowPreChat(false);

        // Check for active conversation
        const { data: convData } = await supabase
          .from('widget_conversations')
          .select('*')
          .eq('visitor_id', visitorData.id)
          .in('status', ['pending', 'active'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (convData) {
          setConversation(convData as unknown as WidgetConversation);

          // Count unread messages
          const { count } = await supabase
            .from('widget_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', convData.id)
            .eq('sender_type', 'agent')
            .eq('is_read', false);

          setUnreadCount(count || 0);
        }
      }
    };

    checkExistingSession();
  }, [orgId]);

  const handlePreChatSubmit = async (data: PreChatFormData) => {
    setIsLoading(true);
    const sessionId = getSessionId();

    try {
      // Create or update visitor
      const { data: visitorData, error: visitorError } = await supabase
        .from('widget_visitors')
        .upsert(
          {
            organization_id: orgId,
            session_id: sessionId,
            name: data.name,
            email: data.email,
            metadata: {
              user_agent: navigator.userAgent,
              referrer: document.referrer,
            },
          },
          { onConflict: 'organization_id,session_id' }
        )
        .select()
        .single();

      if (visitorError) throw visitorError;

      const newVisitor = visitorData as unknown as WidgetVisitor;
      setVisitor(newVisitor);

      // Create conversation
      const { data: convData, error: convError } = await supabase
        .from('widget_conversations')
        .insert({
          organization_id: orgId,
          visitor_id: newVisitor.id,
          topic: data.topic,
          page_url: window.location.href,
          referrer: document.referrer,
          user_agent: navigator.userAgent,
        })
        .select()
        .single();

      if (convError) throw convError;

      const newConversation = convData as unknown as WidgetConversation;
      setConversation(newConversation);

      // Add welcome message
      await supabase.from('widget_messages').insert({
        conversation_id: newConversation.id,
        sender_type: 'system',
        content: config.welcome_message,
      });

      // Add initial message if provided
      if (data.message?.trim()) {
        await supabase.from('widget_messages').insert({
          conversation_id: newConversation.id,
          sender_type: 'visitor',
          sender_id: newVisitor.id,
          content: data.message,
        });
      }

      setShowPreChat(false);
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfflineSubmit = async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    setIsLoading(true);
    const sessionId = getSessionId();

    try {
      // Create visitor
      const { data: visitorData, error: visitorError } = await supabase
        .from('widget_visitors')
        .upsert(
          {
            organization_id: orgId,
            session_id: sessionId,
            name: data.name,
            email: data.email,
          },
          { onConflict: 'organization_id,session_id' }
        )
        .select()
        .single();

      if (visitorError) throw visitorError;

      const newVisitor = visitorData as unknown as WidgetVisitor;

      // Create conversation as pending (will be converted to ticket)
      const { data: convData, error: convError } = await supabase
        .from('widget_conversations')
        .insert({
          organization_id: orgId,
          visitor_id: newVisitor.id,
          topic: data.subject,
          page_url: window.location.href,
          status: 'pending',
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add the message
      await supabase.from('widget_messages').insert({
        conversation_id: convData.id,
        sender_type: 'visitor',
        sender_id: newVisitor.id,
        content: data.message,
      });
    } catch (error) {
      console.error('Error submitting offline form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const renderContent = () => {
    if (!isOnline && config.pre_chat_form_enabled && showPreChat) {
      return (
        <OfflineForm
          config={config}
          onSubmit={handleOfflineSubmit}
          isLoading={isLoading}
        />
      );
    }

    if (config.pre_chat_form_enabled && showPreChat) {
      return (
        <PreChatForm
          config={config}
          onSubmit={handlePreChatSubmit}
          isLoading={isLoading}
        />
      );
    }

    if (visitor && conversation) {
      return (
        <ChatWindow
          config={config}
          visitor={visitor}
          conversation={conversation}
          onConversationUpdate={setConversation}
        />
      );
    }

    // If pre-chat is disabled, start chat immediately
    return (
      <PreChatForm
        config={config}
        onSubmit={handlePreChatSubmit}
        isLoading={isLoading}
      />
    );
  };

  if (!config.is_enabled) return null;

  const position = config.position === 'bottom-left' ? 'left-4' : 'right-4';

  return (
    <div className={cn('fixed bottom-4 z-50', position)}>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="mb-4 bg-background border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
          style={{ width: 350, height: 500 }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ backgroundColor: config.primary_color }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{orgName}</h3>
                <div className="flex items-center gap-1.5 text-xs opacity-90">
                  <Circle
                    className={cn('w-2 h-2', isOnline ? 'fill-green-400 text-green-400' : 'fill-red-400 text-red-400')}
                  />
                  {isOnline ? "We're online" : "We're offline"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="h-[calc(100%-56px)]">{renderContent()}</div>
        </div>
      )}

      {/* Trigger Button */}
      <Button
        onClick={handleOpen}
        className={cn(
          'h-14 w-14 rounded-full shadow-lg relative',
          isOpen && 'hidden'
        )}
        style={{ backgroundColor: config.primary_color }}
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
}
