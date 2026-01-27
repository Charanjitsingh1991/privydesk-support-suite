import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertCircle,
  Download,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import type { EmailImportJob } from '@/types/email';

interface EmailImportUploadProps {
  activeJob: EmailImportJob | null;
  uploading: boolean;
  uploadProgress: number;
  onUpload: (file: File) => Promise<string | null>;
  onCancel: (jobId: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function EmailImportUpload({
  activeJob,
  uploading,
  uploadProgress,
  onUpload,
  onCancel
}: EmailImportUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-outlook': ['.pst']
    },
    maxSize: 10 * 1024 * 1024 * 1024, // 10GB
    maxFiles: 1,
    disabled: uploading || !!activeJob
  });

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  // Show active job progress
  if (activeJob) {
    const progress = activeJob.total_emails > 0
      ? Math.round((activeJob.processed_emails / activeJob.total_emails) * 100)
      : 0;

    const estimatedTimeRemaining = activeJob.total_emails > 0 && activeJob.processed_emails > 0
      ? ((activeJob.total_emails - activeJob.processed_emails) / (activeJob.processed_emails / 
          (Date.now() - new Date(activeJob.started_at || activeJob.created_at).getTime()))) * 1000
      : null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {activeJob.status === 'completed' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : activeJob.status === 'failed' ? (
              <XCircle className="h-5 w-5 text-destructive" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
            Email Import {activeJob.status === 'completed' ? 'Completed' : 
                          activeJob.status === 'failed' ? 'Failed' : 'In Progress'}
          </CardTitle>
          <CardDescription>
            {activeJob.pst_file_name} ({formatFileSize(activeJob.pst_file_size || 0)})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeJob.status === 'processing' && (
            <>
              {/* Emails Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Emails</span>
                  <span>{activeJob.processed_emails.toLocaleString()} / {activeJob.total_emails.toLocaleString()}</span>
                </div>
                <Progress value={progress} />
              </div>

              {/* Attachments Progress */}
              {activeJob.total_attachments > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Attachments</span>
                    <span>{activeJob.processed_attachments.toLocaleString()} / {activeJob.total_attachments.toLocaleString()}</span>
                  </div>
                  <Progress 
                    value={Math.round((activeJob.processed_attachments / activeJob.total_attachments) * 100)} 
                  />
                </div>
              )}

              {/* Estimated Time */}
              {estimatedTimeRemaining && (
                <p className="text-sm text-muted-foreground">
                  Estimated time remaining: {formatDuration(estimatedTimeRemaining)}
                </p>
              )}

              <Button 
                variant="outline" 
                onClick={() => onCancel(activeJob.id)}
                className="w-full"
              >
                Cancel Import
              </Button>
            </>
          )}

          {activeJob.status === 'completed' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {activeJob.processed_emails.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Emails Imported</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">
                    {activeJob.processed_attachments.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Attachments</p>
                </div>
              </div>

              {activeJob.failed_emails > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {activeJob.failed_emails} emails failed to import. 
                    <Button variant="link" size="sm" className="p-0 h-auto ml-1">
                      <Download className="h-3 w-3 mr-1" />
                      Download error log
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <Button asChild className="w-full">
                <a href="/dashboard/emails">View Email Archive</a>
              </Button>
            </div>
          )}

          {activeJob.status === 'failed' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {activeJob.error_message || 'Import failed. Please try again.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Import Outlook Emails</CardTitle>
          <CardDescription>
            Import your organization's email history from Outlook PST files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="step1">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                  Export from Outlook
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>Open Outlook Desktop</li>
                  <li>Go to <strong>File → Open & Export → Import/Export</strong></li>
                  <li>Select <strong>Export to a file</strong></li>
                  <li>Choose <strong>Outlook Data File (.pst)</strong></li>
                  <li>Select the folders you want to export</li>
                  <li>Choose a save location and click Finish</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step2">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                  Upload PST File
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>Drag and drop your PST file below or click to browse. Maximum file size is 10GB.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step3">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
                  Monitor Progress
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>Once uploaded, the import will process automatically. You can monitor progress in real-time and continue using the app while it imports.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50',
              (uploading) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input {...getInputProps()} />
            
            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                <div className="space-y-2">
                  <p className="font-medium">Uploading...</p>
                  <Progress value={uploadProgress} className="w-48 mx-auto" />
                </div>
              </div>
            ) : selectedFile ? (
              <div className="space-y-4">
                <FileText className="h-10 w-10 mx-auto text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>
                    Choose Different File
                  </Button>
                  <Button onClick={(e) => { e.stopPropagation(); handleUpload(); }}>
                    <Upload className="h-4 w-4 mr-2" />
                    Start Import
                  </Button>
                </div>
              </div>
            ) : isDragActive ? (
              <>
                <Upload className="h-10 w-10 mx-auto mb-4 text-primary" />
                <p className="text-primary font-medium">Drop your PST file here...</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium">Drag & drop your PST file here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse (max 10GB)
                </p>
              </>
            )}
          </div>

          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your PST file will be securely processed and deleted after import. 
              Only the extracted emails and attachments will be stored.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
