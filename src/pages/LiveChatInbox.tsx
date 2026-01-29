import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageCircle, Circle, Users, Clock, Send, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { WidgetConversation, WidgetMessage, WidgetVisitor } from '@/types/widget';

interface ConversationWithVisitor extends WidgetConversation {
  visitor?: WidgetVisitor;
  unread_count?: number;
  last_message?: WidgetMessage;
}

type AgentStatus = 'online' | 'busy' | 'offline';

export default function LiveChatInbox() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithVisitor[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithVisitor | null>(null);
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('offline');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const orgId = profile?.organization_id;

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!orgId) return;

    const { data } = await supabase
      .from('widget_conversations')
      .select(`
        *,
        visitor:widget_visitors(*)
      `)
      .eq('organization_id', orgId)
      .in('status', ['pending', 'active'])
      .order('updated_at', { ascending: false });

    if (data) {
      // Fetch last message and unread count for each conversation
      const conversationsWithDetails = await Promise.all(
        data.map(async (conv) => {
          const { data: lastMsg } = await supabase
            .from('widget_messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const { count } = await supabase
            .from('widget_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('sender_type', 'visitor')
            .eq('is_read', false);

          return {
            ...conv,
            status: conv.status as WidgetConversation['status'],
            visitor: conv.visitor as unknown as WidgetVisitor,
            last_message: lastMsg as WidgetMessage | undefined,
            unread_count: count || 0,
          };
        })
      );

      setConversations(conversationsWithDetails as ConversationWithVisitor[]);
    }

    setIsLoading(false);
  }, [orgId]);

  // Fetch agent status
  useEffect(() => {
    const fetchStatus = async () => {
      if (!profile?.id || !orgId) return;

      const { data } = await supabase
        .from('agent_availability')
        .select('status')
        .eq('agent_id', profile.id)
        .eq('organization_id', orgId)
        .single();

      if (data) {
        setAgentStatus(data.status as AgentStatus);
      }
    };

    fetchStatus();
  }, [profile?.id, orgId]);

  // Update agent status
  const handleStatusChange = async (status: AgentStatus) => {
    if (!profile?.id || !orgId) return;

    const { error } = await supabase.from('agent_availability').upsert(
      {
        agent_id: profile.id,
        organization_id: orgId,
        status,
        last_activity_at: new Date().toISOString(),
      },
      { onConflict: 'agent_id,organization_id' }
    );

    if (!error) {
      setAgentStatus(status);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Subscribe to new conversations and messages
  useEffect(() => {
    if (!orgId) return;

    const channel = supabase
      .channel('live_chat_inbox')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'widget_conversations',
          filter: `organization_id=eq.${orgId}`,
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'widget_messages',
        },
        (payload) => {
          const newMsg = payload.new as WidgetMessage;
          // Update messages if this conversation is selected
          if (selectedConversation?.id === newMsg.conversation_id) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
          // Refresh conversations list
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId, selectedConversation?.id, fetchConversations]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) {
        setMessages([]);
        return;
      }

      const { data } = await supabase
        .from('widget_messages')
        .select('*')
        .eq('conversation_id', selectedConversation.id)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data as WidgetMessage[]);

        // Mark messages as read
        await supabase
          .from('widget_messages')
          .update({ is_read: true })
          .eq('conversation_id', selectedConversation.id)
          .eq('sender_type', 'visitor')
          .eq('is_read', false);
      }
    };

    fetchMessages();
  }, [selectedConversation?.id]);

  // Assign conversation to self
  const handleAssign = async () => {
    if (!selectedConversation || !profile?.id) return;

    await supabase
      .from('widget_conversations')
      .update({
        assigned_agent_id: profile.id,
        status: 'active',
      })
      .eq('id', selectedConversation.id);

    setSelectedConversation({
      ...selectedConversation,
      assigned_agent_id: profile.id,
      status: 'active',
    });

    fetchConversations();
  };

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation || !profile?.id || isSending) return;

    setIsSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase.from('widget_messages').insert({
      conversation_id: selectedConversation.id,
      sender_type: 'agent',
      sender_id: profile.id,
      content,
    });

    if (error) {
      setNewMessage(content);
      console.error('Failed to send:', error);
    }

    setIsSending(false);
  };

  // Close conversation
  const handleClose = async () => {
    if (!selectedConversation) return;

    await supabase
      .from('widget_conversations')
      .update({
        status: 'closed',
        ended_at: new Date().toISOString(),
      })
      .eq('id', selectedConversation.id);

    setSelectedConversation(null);
    fetchConversations();
  };

  const pendingCount = conversations.filter((c) => c.status === 'pending').length;
  const activeCount = conversations.filter((c) => c.status === 'active').length;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Live Chat Inbox</h1>
            <p className="text-muted-foreground">
              Manage real-time customer conversations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={agentStatus} onValueChange={(v) => handleStatusChange(v as AgentStatus)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">
                  <div className="flex items-center gap-2">
                    <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                    Online
                  </div>
                </SelectItem>
                <SelectItem value="busy">
                  <div className="flex items-center gap-2">
                    <Circle className="h-2 w-2 fill-yellow-500 text-yellow-500" />
                    Busy
                  </div>
                </SelectItem>
                <SelectItem value="offline">
                  <div className="flex items-center gap-2">
                    <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />
                    Offline
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Waiting</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{conversations.length}</p>
                <p className="text-sm text-muted-foreground">Total Open</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-3 gap-4 h-[calc(100%-10rem)]">
          {/* Conversations List */}
          <Card className="col-span-1 overflow-hidden">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm">Conversations</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100%-3rem)]">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No active conversations</p>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={cn(
                        'p-3 cursor-pointer hover:bg-muted/50 transition-colors',
                        selectedConversation?.id === conv.id && 'bg-muted'
                      )}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs">
                            {conv.visitor?.name?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm truncate">
                              {conv.visitor?.name || 'Unknown Visitor'}
                            </p>
                            {conv.unread_count && conv.unread_count > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-[20px] text-xs">
                                {conv.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.last_message?.content || conv.topic || 'New conversation'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={conv.status === 'pending' ? 'outline' : 'secondary'}
                              className="text-xs h-5"
                            >
                              {conv.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="col-span-2 flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedConversation.visitor?.name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {selectedConversation.visitor?.name || 'Unknown Visitor'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.visitor?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedConversation.status === 'pending' && (
                      <Button size="sm" onClick={handleAssign}>
                        Assign to Me
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={handleClose}>
                      <X className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex',
                          msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] px-4 py-2 rounded-lg',
                            msg.sender_type === 'agent'
                              ? 'bg-primary text-primary-foreground'
                              : msg.sender_type === 'system'
                              ? 'bg-muted text-center w-full max-w-full text-sm'
                              : 'bg-muted'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your reply..."
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      disabled={selectedConversation.status === 'pending'}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || isSending || selectedConversation.status === 'pending'}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedConversation.status === 'pending' && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Assign this conversation to yourself to start replying
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
