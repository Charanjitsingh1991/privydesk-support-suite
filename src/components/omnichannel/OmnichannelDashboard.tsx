import { useState, useEffect } from 'react';
import { MessageSquare, Phone, Mail, MessageCircle, Send } from 'lucide-react';
import { OmnichannelService } from '@/lib/services/omnichannelService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Conversation {
  id: string;
  channel_type: string;
  customer_identifier: string;
  customer_name?: string;
  status: string;
  last_message_at?: string;
  created_at: string;
}

interface Message {
  id: string;
  content: string;
  from_user_id: string;
  direction: string;
  sent_at: string;
}

export function OmnichannelDashboard({ organizationId }: { organizationId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState<string>('all');

  useEffect(() => {
    loadConversations();
  }, [organizationId, activeChannel]);

  const loadConversations = async () => {
    setLoading(true);
    const data = await OmnichannelService.getConversations(organizationId, {
      channelType: activeChannel === 'all' ? undefined : activeChannel,
      status: 'active',
      limit: 50,
    });
    setConversations(data);
    setLoading(false);
  };

  const loadMessages = async (conversationId: string) => {
    // Load messages for selected conversation
    // This would need a getMessages method in OmnichannelService
    setMessages([]);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    await OmnichannelService.sendMessage(
      organizationId,
      'channel-config-id', // Would come from conversation
      selectedConversation.channel_type,
      selectedConversation.customer_identifier,
      newMessage
    );

    setNewMessage('');
    loadMessages(selectedConversation.id);
  };

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'voice':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channelType: string) => {
    switch (channelType) {
      case 'whatsapp':
        return 'bg-green-500';
      case 'sms':
        return 'bg-blue-500';
      case 'voice':
        return 'bg-purple-500';
      case 'email':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Omnichannel Dashboard</h2>
        <p className="text-muted-foreground">Unified messaging across all channels</p>
      </div>

      <Tabs value={activeChannel} onValueChange={setActiveChannel}>
        <TabsList>
          <TabsTrigger value="all">All Channels</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value={activeChannel} className="mt-6">
          <div className="grid grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <CardDescription>
                  {conversations.length} active conversation{conversations.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[480px]">
                  {loading ? (
                    <div className="text-center py-12">Loading...</div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No active conversations
                    </div>
                  ) : (
                    <div className="space-y-1 p-4">
                      {conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv)}
                          className={`w-full text-left p-3 rounded-lg hover:bg-accent transition-colors ${
                            selectedConversation?.id === conv.id ? 'bg-accent' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <div className={`p-2 rounded-full ${getChannelColor(conv.channel_type)}`}>
                                {getChannelIcon(conv.channel_type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {conv.customer_name || conv.customer_identifier}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {conv.customer_identifier}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {conv.channel_type}
                            </Badge>
                          </div>
                          {conv.last_message_at && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(conv.last_message_at).toLocaleTimeString()}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Messages Area */}
            <Card className="col-span-2">
              {selectedConversation ? (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <div className={`p-2 rounded-full ${getChannelColor(selectedConversation.channel_type)}`}>
                            {getChannelIcon(selectedConversation.channel_type)}
                          </div>
                          {selectedConversation.customer_name || selectedConversation.customer_identifier}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {selectedConversation.customer_identifier}
                        </CardDescription>
                      </div>
                      <Badge>{selectedConversation.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px] p-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          No messages yet
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  msg.direction === 'outbound'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm">{msg.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(msg.sent_at).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button onClick={handleSendMessage}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
