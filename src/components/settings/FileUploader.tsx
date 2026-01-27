import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  label: string;
  description?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  currentFile?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => void;
  className?: string;
  previewDimensions?: { width: number; height: number };
}

export function FileUploader({
  label,
  description,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.ico'],
  },
  maxSize = 2 * 1024 * 1024, // 2MB
  currentFile,
  onUpload,
  onRemove,
  className,
  previewDimensions,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setPreview(URL.createObjectURL(file));

      try {
        await onUpload(file);
      } catch (error) {
        console.error('Upload failed:', error);
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const displayUrl = preview || currentFile;

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium">{label}</label>

      {displayUrl ? (
        <div className="relative inline-block">
          <div
            className="border rounded-lg p-2 bg-muted/50"
            style={
              previewDimensions
                ? {
                    width: previewDimensions.width,
                    height: previewDimensions.height,
                  }
                : undefined
            }
          >
            <img
              src={displayUrl}
              alt="Preview"
              className="max-h-20 object-contain"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              {...getRootProps()}
              disabled={uploading}
            >
              <input {...getInputProps()} />
              {uploading ? 'Uploading...' : 'Change'}
            </Button>
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <>
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? 'Drop file here'
                    : 'Drag & drop or click to upload'}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
