import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image, Film, Archive, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { UploadProgress } from '@/types/files';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  uploading?: boolean;
  uploadProgress?: UploadProgress[];
  maxSize?: number;
  maxFiles?: number;
  accept?: Record<string, string[]>;
  disabled?: boolean;
}

const FILE_ICONS: Record<string, React.ElementType> = {
  image: Image,
  video: Film,
  application: FileText,
  text: FileText,
  default: Archive
};

function getFileIcon(mimeType: string) {
  const type = mimeType.split('/')[0];
  return FILE_ICONS[type] || FILE_ICONS.default;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function FileUploadZone({
  onFilesSelected,
  uploading = false,
  uploadProgress = [],
  maxSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 10,
  accept,
  disabled = false
}: FileUploadZoneProps) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setPendingFiles(prev => [...prev, ...acceptedFiles].slice(0, maxFiles));
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    maxFiles,
    accept,
    disabled: disabled || uploading
  });

  const removeFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (pendingFiles.length > 0) {
      onFilesSelected(pendingFiles);
      setPendingFiles([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          (disabled || uploading) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-primary font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="font-medium">Drag & drop files here</p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse (max {formatFileSize(maxSize)} per file)
            </p>
          </>
        )}
      </div>

      {/* Pending Files */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Files to upload ({pendingFiles.length})
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {pendingFiles.map((file, index) => {
              const Icon = getFileIcon(file.type);
              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                >
                  <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          <Button onClick={handleUpload} disabled={uploading} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {pendingFiles.length} file{pendingFiles.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Upload Progress</div>
          {uploadProgress.map(item => (
            <div key={item.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="truncate">{item.name}</span>
                <span className={cn(
                  item.status === 'complete' && 'text-success',
                  item.status === 'error' && 'text-destructive'
                )}>
                  {item.status === 'complete' ? 'Done' : 
                   item.status === 'error' ? 'Failed' : 
                   `${item.progress}%`}
                </span>
              </div>
              <Progress 
                value={item.progress} 
                className={cn(
                  'h-1',
                  item.status === 'error' && '[&>div]:bg-destructive'
                )}
              />
              {item.error && (
                <p className="text-xs text-destructive">{item.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
