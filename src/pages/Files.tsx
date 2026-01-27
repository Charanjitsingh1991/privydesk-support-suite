import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/hooks/useSession';
import { useFileStorage } from '@/hooks/useFileStorage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileUploadZone } from '@/components/files/FileUploadZone';
import { FileGrid } from '@/components/files/FileGrid';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Upload, HardDrive } from 'lucide-react';
import type { SortOption, SortDirection, FileFilters } from '@/types/files';

const FOLDERS = [
  { value: 'general', label: 'General' },
  { value: 'documents', label: 'Documents' },
  { value: 'images', label: 'Images' },
  { value: 'templates', label: 'Templates' },
];

export default function Files() {
  const { role } = useUser();
  const {
    files,
    loading,
    uploading,
    uploadProgress,
    fetchFiles,
    uploadMultiple,
    deleteFile,
    getDownloadUrl,
    updateFileMetadata,
    clearUploadProgress
  } = useFileStorage();

  const [showUpload, setShowUpload] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('general');
  const [filters, setFilters] = useState<FileFilters>({});
  const [sort, setSort] = useState<SortOption>('date');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchFiles(filters, sort, sortDir);
  }, [fetchFiles, filters, sort, sortDir]);

  const handleFilesSelected = async (fileList: File[]) => {
    await uploadMultiple(fileList, selectedFolder);
    await fetchFiles(filters, sort, sortDir);
    setShowUpload(false);
    clearUploadProgress();
  };

  const handleDownload = async (storagePath: string) => {
    const url = await getDownloadUrl(storagePath);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleDelete = async (fileId: string) => {
    const success = await deleteFile(fileId);
    if (success) {
      fetchFiles(filters, sort, sortDir);
    }
  };

  const handleUpdate = async (fileId: string, updates: { description?: string; tags?: string[] }) => {
    await updateFileMetadata(fileId, updates);
  };

  const handleSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search: search || undefined }));
  }, []);

  const handleSort = useCallback((newSort: SortOption, newDir: SortDirection) => {
    setSort(newSort);
    setSortDir(newDir);
  }, []);

  const handleFilterType = useCallback((type: string | undefined) => {
    setFilters(prev => ({ ...prev, mimeType: type }));
  }, []);

  const canDelete = role === 'admin' || role === 'super_admin' || role === 'agent';

  // Calculate storage stats
  const totalSize = files.reduce((sum, f) => sum + f.file_size, 0);
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Files</h1>
            <p className="text-muted-foreground">
              Manage your organization's files and documents
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Storage Usage */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              <span>{formatSize(totalSize)} used</span>
            </div>

            {/* Upload Button */}
            <Dialog open={showUpload} onOpenChange={setShowUpload}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Upload Files</DialogTitle>
                  <DialogDescription>
                    Upload files to your organization's storage
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Folder</Label>
                    <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FOLDERS.map(folder => (
                          <SelectItem key={folder.value} value={folder.value}>
                            {folder.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <FileUploadZone
                    onFilesSelected={handleFilesSelected}
                    uploading={uploading}
                    uploadProgress={uploadProgress}
                    maxSize={50 * 1024 * 1024}
                    maxFiles={10}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Folder Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilters(prev => ({ ...prev, folder: undefined }))}>
              All Files
            </TabsTrigger>
            {FOLDERS.map(folder => (
              <TabsTrigger 
                key={folder.value} 
                value={folder.value}
                onClick={() => setFilters(prev => ({ ...prev, folder: folder.value }))}
              >
                {folder.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* File Grid */}
        <FileGrid
          files={files}
          loading={loading}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onSearch={handleSearch}
          onSort={handleSort}
          onFilterType={handleFilterType}
          canDelete={canDelete}
        />
      </div>
    </DashboardLayout>
  );
}
