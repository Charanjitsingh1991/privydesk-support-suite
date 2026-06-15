/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useSession';
import { toast } from 'sonner';
import type { 
  EmailArchive, 
  EmailWithAttachments, 
  EmailSearchFilters, 
  EmailSortOption, 
  EmailSortDirection,
  EmailImportJob 
} from '@/types/email';

export function useEmailArchive() {
  const { organizationId } = useUser();
  const [emails, setEmails] = useState<EmailWithAttachments[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [folders, setFolders] = useState<string[]>([]);

  const fetchEmails = useCallback(async (
    filters: EmailSearchFilters = {},
    sort: EmailSortOption = 'received',
    direction: EmailSortDirection = 'desc',
    page = 1,
    pageSize = 50
  ) => {
    if (!organizationId) return;

    setLoading(true);
    try {
      let query = supabase
        .from('email_archive' as any)
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId);

      // Apply filters
      if (filters.query) {
        query = query.textSearch('search_vector', filters.query, {
          type: 'websearch',
          config: 'english'
        });
      }

      if (filters.dateFrom) {
        query = query.gte('received_datetime', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('received_datetime', filters.dateTo);
      }

      if (filters.sender) {
        query = query.ilike('from_email', `%${filters.sender}%`);
      }

      if (filters.folder) {
        query = query.eq('folder_path', filters.folder);
      }

      if (filters.hasAttachments !== undefined) {
        query = query.eq('has_attachments', filters.hasAttachments);
      }

      if (filters.linkedToTicket) {
        query = query.not('linked_ticket_id', 'is', null);
      }

      // Apply sorting
      const sortColumn = sort === 'received' ? 'received_datetime'
        : sort === 'sender' ? 'from_email'
        : sort === 'subject' ? 'subject'
        : 'received_datetime';

      query = query.order(sortColumn, { ascending: direction === 'asc' });

      // Pagination
      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      setEmails((data || []) as unknown as EmailWithAttachments[]);
      setTotalCount(count || 0);
    } catch (error) {
      toast.error('Failed to load emails');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const fetchFolders = useCallback(async () => {
    if (!organizationId) return;

    try {
      const { data, error } = await supabase
        .from('email_archive' as any)
        .select('folder_path')
        .eq('organization_id', organizationId)
        .not('folder_path', 'is', null);

      if (error) throw error;

      const uniqueFolders = [...new Set((data || []).map((e: any) => e.folder_path as string))];
      setFolders(uniqueFolders.filter(Boolean).sort());
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  }, [organizationId]);

  const getEmail = useCallback(async (emailId: string): Promise<EmailWithAttachments | null> => {
    try {
      const { data: email, error } = await supabase
        .from('email_archive' as any)
        .select('*')
        .eq('id', emailId)
        .single();

      if (error) throw error;

      // Fetch attachments
      const { data: attachments } = await supabase
        .from('email_attachments' as any)
        .select('*')
        .eq('email_archive_id', emailId);

      // Fetch linked ticket if exists
      let linkedTicket = null;
      const emailData = email as any;
      if (emailData?.linked_ticket_id) {
        const { data: ticket } = await supabase
          .from('tickets')
          .select('id, subject, status')
          .eq('id', emailData.linked_ticket_id)
          .single();
        linkedTicket = ticket;
      }

      return {
        ...(emailData as EmailArchive),
        attachments: attachments as any[] || [],
        linked_ticket: linkedTicket
      };
    } catch (error) {
      toast.error('Failed to load email');
      return null;
    }
  }, []);

  const linkToTicket = useCallback(async (emailId: string, ticketId: string) => {
    try {
      const { error } = await supabase
        .from('email_archive' as any)
        .update({ linked_ticket_id: ticketId })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(prev => prev.map(e => 
        e.id === emailId ? { ...e, linked_ticket_id: ticketId } : e
      ));

      toast.success('Email linked to ticket');
      return true;
    } catch (error) {
      toast.error('Failed to link email');
      return false;
    }
  }, []);

  const unlinkFromTicket = useCallback(async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('email_archive' as any)
        .update({ linked_ticket_id: null })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(prev => prev.map(e => 
        e.id === emailId ? { ...e, linked_ticket_id: null } : e
      ));

      toast.success('Email unlinked from ticket');
      return true;
    } catch (error) {
      toast.error('Failed to unlink email');
      return false;
    }
  }, []);

  const markAsRead = useCallback(async (emailId: string) => {
    try {
      await supabase
        .from('email_archive' as any)
        .update({ is_read: true })
        .eq('id', emailId);

      setEmails(prev => prev.map(e => 
        e.id === emailId ? { ...e, is_read: true } : e
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  return {
    emails,
    loading,
    totalCount,
    folders,
    fetchEmails,
    fetchFolders,
    getEmail,
    linkToTicket,
    unlinkFromTicket,
    markAsRead
  };
}

export function useEmailImport() {
  const { userId, organizationId } = useUser();
  const [jobs, setJobs] = useState<EmailImportJob[]>([]);
  const [activeJob, setActiveJob] = useState<EmailImportJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchJobs = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_import_jobs' as any)
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const jobsData = (data || []) as unknown as EmailImportJob[];
      setJobs(jobsData);

      // Set active job if one is processing
      const processing = jobsData.find((j) => 
        j.status === 'pending' || j.status === 'processing'
      );
      setActiveJob(processing || null);
    } catch (error) {
      toast.error('Failed to load import jobs');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const uploadPstFile = useCallback(async (file: File): Promise<string | null> => {
    if (!organizationId || !userId) {
      toast.error('Please log in to upload files');
      return null;
    }

    if (!file.name.toLowerCase().endsWith('.pst')) {
      toast.error('Please upload a PST file');
      return null;
    }

    const maxSize = 10 * 1024 * 1024 * 1024; // 10GB
    if (file.size > maxSize) {
      toast.error('File size exceeds 10GB limit');
      return null;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const jobId = crypto.randomUUID();
      const filePath = `${organizationId}/${jobId}/${file.name}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('email-imports')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Create import job
      const { data: job, error: jobError } = await supabase
        .from('email_import_jobs' as any)
        .insert({
          organization_id: organizationId,
          created_by: userId,
          pst_file_name: file.name,
          pst_file_size: file.size,
          pst_file_url: filePath,
          status: 'pending'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      setUploadProgress(100);
      toast.success('PST file uploaded. Import will begin shortly.');

      // Trigger processing edge function
      await supabase.functions.invoke('process-email-import', {
        body: { jobId: (job as any).id }
      });

      await fetchJobs();
      return (job as any).id;
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [organizationId, userId, fetchJobs]);

  const subscribeToJob = useCallback((jobId: string) => {
    const channel = supabase
      .channel(`import-job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'email_import_jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          const updated = payload.new as EmailImportJob;
          setActiveJob(updated);
          setJobs(prev => prev.map(j => j.id === jobId ? updated : j));

          if (updated.status === 'completed') {
            toast.success(`Import completed! ${updated.processed_emails} emails imported.`);
          } else if (updated.status === 'failed') {
            toast.error(`Import failed: ${updated.error_message}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const cancelJob = useCallback(async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('email_import_jobs' as any)
        .update({ status: 'failed', error_message: 'Cancelled by user' })
        .eq('id', jobId);

      if (error) throw error;

      toast.success('Import cancelled');
      await fetchJobs();
    } catch (error) {
      toast.error('Failed to cancel import');
    }
  }, [fetchJobs]);

  return {
    jobs,
    activeJob,
    loading,
    uploading,
    uploadProgress,
    fetchJobs,
    uploadPstFile,
    subscribeToJob,
    cancelJob
  };
}
