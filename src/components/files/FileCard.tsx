import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  Image,
  Film,
  Archive,
  Download,
  Trash2,
  MoreVertical,
  Eye,
  Tag,
  Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { FileWithUploader } from '@/types/files';

interface FileCardProps {
  file: FileWithUploader;
  onDownload: (storagePath: string) => void;
  onDelete: (fileId: string) => void;
  onUpdate: (fileId: string, updates: { description?: string; tags?: string[] }) => void;
  canDelete?: boolean;
}

const FILE_ICONS: Record<string, React.ElementType> = {
  image: Image,
  video: Film,
  application: FileText,
  text: FileText,
  default: Archive
};

const FILE_COLORS: Record<string, string> = {
  image: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  video: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  application: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  text: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileType(mimeType: string): string {
  return mimeType.split('/')[0];
}

export function FileCard({
  file,
  onDownload,
  onDelete,
  onUpdate,
  canDelete = false
}: FileCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [description, setDescription] = useState(file.description || '');
  const [tagsInput, setTagsInput] = useState(file.tags?.join(', ') || '');

  const fileType = getFileType(file.mime_type);
  const Icon = FILE_ICONS[fileType] || FILE_ICONS.default;
  const colorClass = FILE_COLORS[fileType] || FILE_COLORS.default;

  const isImage = fileType === 'image';

  const handleSave = () => {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    onUpdate(file.id, { description, tags });
    setShowEdit(false);
  };

  return (
    <>
      <div className="group relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card">
        {/* Preview Area */}
        <div className={cn('h-32 flex items-center justify-center', colorClass)}>
          <Icon className="h-12 w-12 opacity-80" />
        </div>

        {/* File Info */}
        <div className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate" title={file.file_name}>
                {file.file_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.file_size)} • {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDownload(file.storage_path)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEdit(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(file.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tags */}
          {file.tags && file.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {file.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {file.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{file.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Uploader */}
          {file.uploader && (
            <div className="flex items-center gap-2 pt-1 border-t">
              <Avatar className="h-5 w-5">
                <AvatarImage src={file.uploader.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {file.uploader.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {file.uploader.full_name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File Details</DialogTitle>
            <DialogDescription>
              Update the description and tags for {file.file_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
