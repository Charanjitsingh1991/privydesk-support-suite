/**
 * Platform Support Chat Widget
 * Allows users to chat with platform support (Super Admin)
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Paperclip, Minimize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_type: 'user' | 'admin';
  sender_name: string;
  created_at: string;
  attachment_url?: string;
}

export function PlatformSupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load or create chat session
  useEffect(() => {
    if (isOpen && user) {
      loadChat();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  // Subscribe to new messages
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`support_chat_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'platform_support_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const loadChat = async () => {
    if (!user) return;

    try {
      // Check for existing open chat
      const { data: existingChat } = await supabase
        .from('platform_support_chats')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .single();

      let currentChatId = existingChat?.id;

      // Create new chat if none exists
      if (!currentChatId) {
        const { data: newChat, error } = await supabase
          .from('platform_support_chats')
          .insert({
            user_id: user.id,
            organization_id: user.organization_id,
            status: 'open',
            priority: 'medium',
          })
          .select('id')
          .single();

        if (error) throw error;
        currentChatId = newChat.id;
      }

      setChatId(currentChatId);

      // Load messages
      const { data: chatMessages } = await supabase
        .from('platform_support_messages')
        .select('*')
        .eq('chat_id', currentChatId)
        .order('created_at', { ascending: true });

      if (chatMessages) {
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('platform_support_messages').insert({
        chat_id: chatId,
        content: newMessage,
        sender_type: 'user',
        sender_id: user.id,
        sender_name: user.full_name || user.email,
      });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent-lime text-black shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-6 right-6 z-50 w-96 bg-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          height: isMinimized ? 'auto' : '600px'
        }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
      >
        {/* Header */}
        <div className="bg-accent-lime text-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5" />
            <div>
              <h3 className="font-bold">Platform Support</h3>
              <p className="text-xs opacity-80">We typically reply in minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-black/10 p-1 rounded transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-black/10 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-[440px] overflow-y-auto p-4 space-y-4 bg-black/50">
              {messages.length === 0 ? (
                <div className="text-center text-white/40 py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with our support team</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender_type === 'user'
                          ? 'bg-accent-lime text-black'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {message.sender_type === 'admin' && (
                        <p className="text-xs opacity-60 mb-1">{message.sender_name}</p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black">
              <div className="flex items-center gap-2">
                <button className="text-white/60 hover:text-white transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/5 border-white/10 text-white"
                  disabled={loading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="bg-accent-lime hover:bg-accent-lime/90 text-black"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
