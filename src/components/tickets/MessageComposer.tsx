import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useSession';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { FileUpload, UploadedFile } from '@/components/ui/FileUpload';
import { Send, Paperclip, MessageSquareText, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MessageComposerProps {
  ticketId: string;
  onMessageSent: () => void;
  disabled?: boolean;
}

const CANNED_RESPONSES = [
  {
    id: 'greeting',
    name: 'Greeting',
    content: 'Hello! Thank you for reaching out. I\'d be happy to help you with this.',
  },
  {
    id: 'more-info',
    name: 'Request More Info',
    content: 'To better assist you, could you please provide more details about the issue you\'re experiencing?',
  },
  {
    id: 'resolved',
    name: 'Issue Resolved',
    content: 'I\'m glad we could resolve this for you! Is there anything else I can help you with?',
  },
  {
    id: 'escalate',
    name: 'Escalation Notice',
    content: 'I\'m escalating this to our specialized team for further assistance. They will be in touch shortly.',
  },
];

export function MessageComposer({
  ticketId,
  onMessageSent,
  disabled = false,
}: MessageComposerProps) {
  const { userId, role } = useUser();
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const draftTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save draft
  useEffect(() => {
    if (!content) return;

    draftTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(`ticket-draft-${ticketId}`, JSON.stringify({ content, isInternal }));
    }, 5000);

    return () => {
      if (draftTimeoutRef.current) {
        clearTimeout(draftTimeoutRef.current);
      }
    };
  }, [content, isInternal, ticketId]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(`ticket-draft-${ticketId}`);
    if (draft) {
      try {
        const { content: draftContent, isInternal: draftInternal } = JSON.parse(draft);
        setContent(draftContent);
        setIsInternal(draftInternal);
      } catch {}
    }
  }, [ticketId]);

  const handleCannedResponse = (response: (typeof CANNED_RESPONSES)[0]) => {
    setContent((prev) => prev + (prev ? '\n\n' : '') + response.content);
  };

  const uploadFiles = async () => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file.status === 'complete' && file.url) {
        uploadedUrls.push(file.url);
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
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!content.trim() || !userId) return;

    setLoading(true);

    try {
      // Upload files first
      let attachmentUrls: string[] = [];
      if (files.length > 0) {
        attachmentUrls = await uploadFiles();
      }

      // Create message
      const { error } = await supabase.from('messages').insert({
        ticket_id: ticketId,
        user_id: userId,
        content: content.trim(),
        is_internal: isInternal,
        attachments: attachmentUrls.map(url => ({ url })),
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

  const canSendInternal = role === 'admin' || role === 'agent' || role === 'super_admin';

  return (
    <div className="border-t bg-background">
      <div className="p-4 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-4">
          {/* Canned responses */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <MessageSquareText className="h-4 w-4 mr-2" />
                Canned Responses
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64">
              <div className="space-y-1">
                {CANNED_RESPONSES.map((response) => (
                  <Button
                    key={response.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleCannedResponse(response)}
                  >
                    {response.name}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAttachments(!showAttachments)}
            className={cn(showAttachments && 'bg-secondary')}
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Attach
          </Button>

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
          onChange={setContent}
          placeholder={isInternal ? 'Add an internal note (only visible to your team)...' : 'Write a reply...'}
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
        <div className="flex justify-end">
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
