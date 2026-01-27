import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send, Smile } from 'lucide-react';
import type { WidgetConfig } from '@/types/widget';

interface WidgetComposerProps {
  config: WidgetConfig;
  onSend: (content: string, attachments?: File[]) => void;
  onTyping?: () => void;
  disabled?: boolean;
}

export function WidgetComposer({
  config,
  onSend,
  onTyping,
  disabled,
}: WidgetComposerProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping?.();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // For now, just include files with the message
      onSend(message.trim() || 'Sent an attachment', Array.from(files));
      setMessage('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-t p-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[100px] resize-none pr-16 py-2"
            disabled={disabled}
            rows={1}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            {config.emoji_picker_enabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                disabled={disabled}
              >
                <Smile className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            {config.file_upload_enabled && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleFileSelect}
                  disabled={disabled}
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </>
            )}
          </div>
        </div>
        <Button
          onClick={handleSend}
          size="icon"
          disabled={!message.trim() || disabled}
          style={{ backgroundColor: config.primary_color }}
          className="h-10 w-10 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
