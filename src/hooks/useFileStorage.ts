import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useSession';
import { toast } from 'sonner';
import type { FileMetadata, FileWithUploader, UploadProgress, FileFilters, SortOption, SortDirection } from '@/types/files';

const BUCKET_ID = 'organization-files';

export function useFileStorage() {
  const { userId, organizationId } = useUser();
  const [files, setFiles] = useState<FileWithUploader[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  const fetchFiles = useCallback(async (
    filters?: FileFilters,
    sort: SortOption = 'date',
    direction: SortDirection = 'desc'
  ) => {
    if (!organizationId) return;

    setLoading(true);
    try {
      // Use raw query since types may not be generated yet
      let query = supabase
        .from('file_metadata' as any)
        .select(`
          *,
          uploader:uploaded_by(id, full_name, avatar_url)
        `)
        .eq('organization_id', organizationId);

      if (filters?.folder) {
        query = query.eq('folder', filters.folder);
      }

      if (filters?.mimeType) {
        query = query.ilike('mime_type', `${filters.mimeType}%`);
      }

      if (filters?.search) {
        query = query.ilike('file_name', `%${filters.search}%`);
      }

      if (filters?.tags?.length) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply sorting
      const sortColumn = sort === 'name' ? 'file_name' 
        : sort === 'date' ? 'created_at'
        : sort === 'size' ? 'file_size'
        : 'mime_type';
      
      query = query.order(sortColumn, { ascending: direction === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      setFiles((data || []) as unknown as FileWithUploader[]);
    } catch (error: any) {
      toast.error('Failed to load files');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const uploadFile = useCallback(async (
    file: File,
    folder?: string,
    description?: string,
    tags?: string[]
  ): Promise<FileMetadata | null> => {
    if (!userId || !organizationId) {
      toast.error('Please log in to upload files');
      return null;
    }

    const fileId = crypto.randomUUID();
    const filePath = `${organizationId}/${folder || 'general'}/${fileId}-${file.name}`;

    // Add to progress tracking
    setUploadProgress(prev => [...prev, {
      id: fileId,
      name: file.name,
      progress: 0,
      status: 'uploading'
    }]);

    setUploading(true);

    try {
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_ID)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Update progress
      setUploadProgress(prev => prev.map(p => 
        p.id === fileId ? { ...p, progress: 50 } : p
      ));

      // Create metadata record
      const { data: metadata, error: metadataError } = await supabase
        .from('file_metadata' as any)
        .insert({
          organization_id: organizationId,
          uploaded_by: userId,
          storage_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || 'application/octet-stream',
          bucket_id: BUCKET_ID,
          folder: folder || 'general',
          description,
          tags
        })
        .select()
        .single();

      if (metadataError) throw metadataError;

      // Complete progress
      setUploadProgress(prev => prev.map(p => 
        p.id === fileId ? { ...p, progress: 100, status: 'complete' } : p
      ));

      toast.success(`${file.name} uploaded successfully`);
      return metadata as unknown as FileMetadata;
    } catch (error: any) {
      setUploadProgress(prev => prev.map(p => 
        p.id === fileId ? { ...p, status: 'error', error: error.message } : p
      ));
      toast.error(`Failed to upload ${file.name}`);
      return null;
    } finally {
      setUploading(false);
    }
  }, [userId, organizationId]);

  const uploadMultiple = useCallback(async (
    fileList: File[],
    folder?: string
  ): Promise<FileMetadata[]> => {
    const results: FileMetadata[] = [];
    
    for (const file of fileList) {
      const result = await uploadFile(file, folder);
      if (result) results.push(result);
    }
    
    return results;
  }, [uploadFile]);

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      // Get file metadata first
      const { data: file, error: fetchError } = await supabase
        .from('file_metadata' as any)
        .select('storage_path')
        .eq('id', fileId)
        .single();

      if (fetchError) throw fetchError;

      const fileData = file as unknown as { storage_path: string };

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_ID)
        .remove([fileData.storage_path]);

      if (storageError) throw storageError;

      // Delete metadata
      const { error: deleteError } = await supabase
        .from('file_metadata' as any)
        .delete()
        .eq('id', fileId);

      if (deleteError) throw deleteError;

      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('File deleted');
      return true;
    } catch (error: any) {
      toast.error('Failed to delete file');
      return false;
    }
  }, []);

  const getDownloadUrl = useCallback(async (storagePath: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from(BUCKET_ID)
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) {
      toast.error('Failed to get download link');
      return null;
    }

    return data.signedUrl;
  }, []);

  const updateFileMetadata = useCallback(async (
    fileId: string,
    updates: Partial<Pick<FileMetadata, 'description' | 'tags' | 'folder'>>
  ) => {
    try {
      const { error } = await supabase
        .from('file_metadata' as any)
        .update(updates)
        .eq('id', fileId);

      if (error) throw error;

      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, ...updates } : f
      ));
      
      toast.success('File updated');
      return true;
    } catch (error) {
      toast.error('Failed to update file');
      return false;
    }
  }, []);

  const clearUploadProgress = useCallback(() => {
    setUploadProgress([]);
  }, []);

  return {
    files,
    loading,
    uploading,
    uploadProgress,
    fetchFiles,
    uploadFile,
    uploadMultiple,
    deleteFile,
    getDownloadUrl,
    updateFileMetadata,
    clearUploadProgress
  };
}
