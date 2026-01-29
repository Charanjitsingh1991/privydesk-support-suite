import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { FileUpload, UploadedFile } from '@/components/ui/FileUpload';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Profile, TicketPriority } from '@/types/database';

interface CreateTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'billing', label: 'Billing' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'bug', label: 'Bug Report' },
];

export function CreateTicketModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateTicketModalProps) {
  const navigate = useNavigate();
  const { userId, organizationId, role } = useUser();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Profile[]>([]);

  // Form state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [category, setCategory] = useState('general');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && (role === 'admin' || role === 'agent' || role === 'super_admin')) {
      fetchAgents();
    }
  }, [open, role]);

  async function fetchAgents() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'agent'])
      .eq('is_active', true);
    if (data) setAgents(data as Profile[]);
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (subject.length > 200) {
      newErrors.subject = 'Subject must be less than 200 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFiles = async (ticketId: string) => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file.status === 'complete' && file.url) {
        uploadedUrls.push(file.url);
        continue;
      }

      const filePath = `${organizationId}/${ticketId}/${file.id}-${file.name}`;

      // Update file status
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
        )
      );

      const { data, error } = await supabase.storage
        .from('ticket-attachments')
        .upload(filePath, file.file);

      if (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: 'error', error: 'Upload failed' }
              : f
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

  const handleSubmit = async (isDraft = false) => {
    if (!validate()) return;

    if (!userId || !organizationId) {
      toast.error('Please log in to create a ticket');
      return;
    }

    setLoading(true);

    try {
      // Create ticket
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          organization_id: organizationId,
          subject: subject.trim(),
          description: description.trim(),
          priority,
          category,
          assigned_to: assignedTo || null,
          due_date: dueDate?.toISOString() || null,
          created_by: userId,
          status: 'open',
          metadata: { is_draft: isDraft },
        })
        .select()
        .single();

      if (error) throw error;

      // Upload attachments if any
      if (files.length > 0 && ticket) {
        const attachmentUrls = await uploadFiles(ticket.id);
        
        // Update ticket with attachment URLs
        const existingMetadata = typeof ticket.metadata === 'object' && ticket.metadata !== null 
          ? ticket.metadata 
          : {};
        await supabase
          .from('tickets')
          .update({
            metadata: { ...existingMetadata, attachments: attachmentUrls },
          })
          .eq('id', ticket.id);
      }

      toast.success(isDraft ? 'Draft saved' : 'Ticket created successfully');
      
      // Reset form
      setSubject('');
      setDescription('');
      setPriority('medium');
      setCategory('general');
      setAssignedTo('');
      setDueDate(undefined);
      setFiles([]);
      setErrors({});

      onOpenChange(false);
      onSuccess?.();

      // Navigate to ticket detail
      if (!isDraft && ticket) {
        navigate(`/dashboard/tickets/${ticket.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const canAssign = role === 'admin' || role === 'agent' || role === 'super_admin';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>
            Describe your issue and we'll help you resolve it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              maxLength={200}
              className={cn(errors.subject && 'border-destructive')}
            />
            <div className="flex justify-between text-xs">
              <span className="text-destructive">{errors.subject}</span>
              <span className={cn('text-muted-foreground', subject.length > 180 && 'text-warning')}>
                {subject.length}/200
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Provide details about your issue..."
              minHeight="150px"
              className={cn(errors.description && 'border-destructive')}
            />
            {errors.description && (
              <span className="text-xs text-destructive">{errors.description}</span>
            )}
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignment and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            {canAssign && (
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={agent.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {agent.full_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {agent.full_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Attachments</Label>
            <FileUpload
              files={files}
              onFilesChange={setFiles}
              maxFiles={5}
              maxSize={10 * 1024 * 1024}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => handleSubmit(true)} disabled={loading}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit(false)} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
