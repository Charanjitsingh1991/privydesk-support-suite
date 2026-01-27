import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  X,
  Download,
  Link2,
  Unlink,
  Ticket,
  Forward,
  Paperclip,
  ChevronDown,
  ChevronUp,
  FileText,
  Image,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { EmailWithAttachments, EmailRecipient } from '@/types/email';
import { LinkToTicketModal } from './LinkToTicketModal';

interface EmailDetailProps {
  email: EmailWithAttachments | null;
  onClose: () => void;
  onLinkToTicket: (emailId: string, ticketId: string) => Promise<boolean>;
  onUnlinkFromTicket: (emailId: string) => Promise<boolean>;
  onCreateTicket?: (email: EmailWithAttachments) => void;
}

function formatRecipients(recipients: EmailRecipient[]): string {
  return recipients
    .map(r => r.name ? `${r.name} <${r.email}>` : r.email)
    .join(', ');
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileIcon(contentType: string) {
  if (contentType.startsWith('image/')) return Image;
  return FileText;
}

export function EmailDetail({
  email,
  onClose,
  onLinkToTicket,
  onUnlinkFromTicket,
  onCreateTicket
}: EmailDetailProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linking, setLinking] = useState(false);

  if (!email) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select an email to view
      </div>
    );
  }

  const handleDownloadAttachment = async (fileUrl: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('email-attachments')
        .createSignedUrl(fileUrl, 3600);

      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Failed to download attachment:', error);
    }
  };

  const handleLink = async (ticketId: string) => {
    setLinking(true);
    const success = await onLinkToTicket(email.id, ticketId);
    setLinking(false);
    if (success) {
      setShowLinkModal(false);
    }
  };

  const handleUnlink = async () => {
    setLinking(true);
    await onUnlinkFromTicket(email.id);
    setLinking(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold truncate">
            {email.subject || '(No Subject)'}
          </h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {email.importance === 'high' && (
              <Badge variant="destructive">High Priority</Badge>
            )}
            {email.folder_path && (
              <Badge variant="outline">{email.folder_path}</Badge>
            )}
            {email.linked_ticket && (
              <Badge variant="default">
                <Link2 className="h-3 w-3 mr-1" />
                Linked to: {email.linked_ticket.subject.slice(0, 30)}...
              </Badge>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Email Metadata */}
      <div className="p-4 border-b bg-muted/30">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">
                {email.from_name || email.from_email}
              </p>
              <p className="text-sm text-muted-foreground">
                {email.from_email}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(email.received_datetime), 'PPpp')}
            </p>
          </div>

          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <div className="flex items-center gap-2">
              <p className="text-sm">
                <span className="text-muted-foreground">To: </span>
                {formatRecipients(email.to_recipients).slice(0, 50)}
                {formatRecipients(email.to_recipients).length > 50 && '...'}
              </p>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  {showDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="space-y-1 mt-2">
              {email.to_recipients.length > 0 && (
                <p className="text-sm">
                  <span className="text-muted-foreground">To: </span>
                  {formatRecipients(email.to_recipients)}
                </p>
              )}
              {email.cc_recipients.length > 0 && (
                <p className="text-sm">
                  <span className="text-muted-foreground">CC: </span>
                  {formatRecipients(email.cc_recipients)}
                </p>
              )}
              {email.bcc_recipients.length > 0 && (
                <p className="text-sm">
                  <span className="text-muted-foreground">BCC: </span>
                  {formatRecipients(email.bcc_recipients)}
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4">
          {email.linked_ticket_id ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <a href={`/dashboard/tickets/${email.linked_ticket_id}`} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Ticket
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUnlink}
                disabled={linking}
              >
                <Unlink className="h-4 w-4 mr-2" />
                Unlink
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowLinkModal(true)}
            >
              <Link2 className="h-4 w-4 mr-2" />
              Link to Ticket
            </Button>
          )}

          {onCreateTicket && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onCreateTicket(email)}
            >
              <Ticket className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          )}
        </div>
      </div>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <Paperclip className="h-4 w-4" />
            <span className="font-medium text-sm">
              {email.attachments.length} Attachment{email.attachments.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {email.attachments.map(attachment => {
              const Icon = getFileIcon(attachment.content_type);
              return (
                <Button
                  key={attachment.id}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 px-3"
                  onClick={() => attachment.file_url && handleDownloadAttachment(attachment.file_url, attachment.file_name)}
                  disabled={!attachment.file_url}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <p className="text-xs font-medium truncate max-w-[150px]">
                      {attachment.file_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.file_size)}
                    </p>
                  </div>
                  <Download className="h-3 w-3 ml-2" />
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Email Body */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {email.body_content_type === 'html' ? (
            <div 
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: email.body_content || '' }}
            />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {email.body_content || email.body_preview || 'No content'}
            </pre>
          )}
        </div>
      </ScrollArea>

      {/* Link to Ticket Modal */}
      <LinkToTicketModal
        open={showLinkModal}
        onOpenChange={setShowLinkModal}
        onLink={handleLink}
        loading={linking}
      />
    </div>
  );
}
