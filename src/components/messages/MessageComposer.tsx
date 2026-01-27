import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useSession';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { FileUpload, UploadedFile } from '@/components/ui/FileUpload';
import { CannedResponses } from '@/components/messages/CannedResponses';
import {
  Send,
  Paperclip,
  Loader2,
  Eye,
  EyeOff,
  Smile,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MessageComposerProps {
  ticketId: string;
  onMessageSent: () => void;
  onTyping?: () => void;
  disabled?: boolean;
}

const DRAFT_SAVE_INTERVAL = 3000; // 3 seconds

export function MessageComposer({
  ticketId,
  onMessageSent,
  onTyping,
  disabled = false,
}: MessageComposerProps) {
  const { userId, role, fullName } = useUser();
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const draftTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTypingRef = useRef<number>(0);

  // Auto-save draft
  useEffect(() => {
    if (!content && !files.length) {
      localStorage.removeItem(`ticket-draft-${ticketId}`);
      setDraftSaved(false);
      return;
    }

    draftTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(
        `ticket-draft-${ticketId}`,
        JSON.stringify({ content, isInternal, files: files.map(f => ({ name: f.name, url: f.url })) })
      );
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, DRAFT_SAVE_INTERVAL);

    return () => {
      if (draftTimeoutRef.current) {
        clearTimeout(draftTimeoutRef.current);
      }
    };
  }, [content, isInternal, files, ticketId]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(`ticket-draft-${ticketId}`);
    if (draft) {
      try {
        const { content: draftContent, isInternal: draftInternal } = JSON.parse(draft);
        setContent(draftContent || '');
        setIsInternal(draftInternal || false);
      } catch {}
    }
  }, [ticketId]);

  // Handle content change with typing indicator
  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value);

      // Trigger typing indicator (throttled)
      const now = Date.now();
      if (onTyping && now - lastTypingRef.current > 2000) {
        lastTypingRef.current = now;
        onTyping();
      }
    },
    [onTyping]
  );

  const handleCannedResponse = (response: string) => {
    // Replace variables
    const processed = response
      .replace(/\{\{customer_name\}\}/g, fullName || 'Customer')
      .replace(/\{\{ticket_id\}\}/g, ticketId.slice(0, 8));
    
    setContent((prev) => prev + (prev ? '\n\n' : '') + processed);
  };

  const uploadFiles = async () => {
    const uploadedUrls: { url: string; name: string }[] = [];

    for (const file of files) {
      if (file.status === 'complete' && file.url) {
        uploadedUrls.push({ url: file.url, name: file.name });
        continue;
      }

      const filePath = `${ticketId}/messages/${file.id}-${file.name}`;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: 'uploading', progress: 50 } : f
        )
      );

      const { error } = await supabase.storage
        .from('ticket-attachments')
        .upload(filePath, file.file);

      if (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'error', error: 'Upload failed' } : f
          )
        );
      } else {
        const { data: urlData } = supabase.storage
          .from('ticket-attachments')
          .getPublicUrl(filePath);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: 'complete', progress: 100, url: urlData.publicUrl }
              : f
          )
        );
        uploadedUrls.push({ url: urlData.publicUrl, name: file.name });
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!content.trim() || !userId) return;

    setLoading(true);

    try {
      // Upload files first
      let attachments: { url: string; name?: string }[] = [];
      if (files.length > 0) {
        attachments = await uploadFiles();
      }

      // Create message
      const { error } = await supabase.from('messages').insert({
        ticket_id: ticketId,
        user_id: userId,
        content: content.trim(),
        is_internal: isInternal,
        attachments: attachments,
      });

      if (error) throw error;

      // Clear form
      setContent('');
      setFiles([]);
      setIsInternal(false);
      setShowAttachments(false);
      localStorage.removeItem(`ticket-draft-${ticketId}`);

      toast.success(isInternal ? 'Internal note added' : 'Reply sent');
      onMessageSent();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Handle Cmd+Enter shortcut
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const canSendInternal = role === 'admin' || role === 'agent' || role === 'super_admin';

  return (
    <div className="border-t bg-background" onKeyDown={handleKeyDown}>
      <div className="p-4 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Canned responses */}
          <CannedResponses onSelect={handleCannedResponse} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAttachments(!showAttachments)}
            className={cn(showAttachments && 'bg-secondary')}
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Attach
          </Button>

          {/* Draft saved indicator */}
          {draftSaved && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Save className="h-3 w-3" />
              Draft saved
            </span>
          )}

          {canSendInternal && (
            <div className="flex items-center gap-2 ml-auto">
              <Switch
                id="internal"
                checked={isInternal}
                onCheckedChange={setIsInternal}
              />
              <Label
                htmlFor="internal"
                className={cn(
                  'text-sm flex items-center gap-1 cursor-pointer',
                  isInternal ? 'text-warning' : 'text-muted-foreground'
                )}
              >
                {isInternal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                Internal Note
              </Label>
            </div>
          )}
        </div>

        {/* Editor */}
        <RichTextEditor
          value={content}
          onChange={handleContentChange}
          placeholder={
            isInternal
              ? 'Add an internal note (only visible to your team)...'
              : 'Write a reply... (Cmd+Enter to send)'
          }
          minHeight="100px"
          disabled={disabled}
          className={cn(isInternal && 'border-warning/50')}
        />

        {/* Attachments */}
        {showAttachments && (
          <FileUpload
            files={files}
            onFilesChange={setFiles}
            maxFiles={5}
            maxSize={10 * 1024 * 1024}
          />
        )}

        {/* Submit */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {content.length} characters
          </span>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || loading || disabled}
            className={cn(isInternal && 'bg-warning hover:bg-warning/90')}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="mr-2 h-4 w-4" />
            {isInternal ? 'Add Note' : 'Send Reply'}
          </Button>
        </div>
      </div>
    </div>
  );
}
