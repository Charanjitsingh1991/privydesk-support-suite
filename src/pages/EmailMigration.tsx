import { useEffect } from 'react';
import { useEmailImport } from '@/hooks/useEmailArchive';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmailImportUpload } from '@/components/emails/EmailImportUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import type { EmailImportJob } from '@/types/email';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getStatusIcon(status: EmailImportJob['status']) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'processing':
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusBadge(status: EmailImportJob['status']) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    case 'processing':
      return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}

export default function EmailMigration() {
  const {
    jobs,
    activeJob,
    loading,
    uploading,
    uploadProgress,
    fetchJobs,
    uploadPstFile,
    subscribeToJob,
    cancelJob
  } = useEmailImport();

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Subscribe to active job updates
  useEffect(() => {
    if (activeJob) {
      const unsubscribe = subscribeToJob(activeJob.id);
      return unsubscribe;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJob?.id, subscribeToJob]);

  const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'failed');

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Email Migration</h1>
          <p className="text-muted-foreground">
            Import your organization's Outlook email history into PRIVYDESK
          </p>
        </div>

        {/* Upload Section */}
        <EmailImportUpload
          activeJob={activeJob}
          uploading={uploading}
          uploadProgress={uploadProgress}
          onUpload={uploadPstFile}
          onCancel={cancelJob}
        />

        {/* Import History */}
        {completedJobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>
                Previous email imports for your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {completedJobs.map(job => (
                  <div key={job.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {getStatusIcon(job.status)}
                      <div className="min-w-0">
                        <p className="font-medium truncate">{job.pst_file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(job.pst_file_size || 0)} • {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      {job.status === 'completed' && (
                        <div className="text-right">
                          <p className="text-sm font-medium">{job.processed_emails.toLocaleString()} emails</p>
                          <p className="text-xs text-muted-foreground">{job.processed_attachments.toLocaleString()} attachments</p>
                        </div>
                      )}
                      {getStatusBadge(job.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
