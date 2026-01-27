export interface FileMetadata {
  id: string;
  organization_id: string;
  uploaded_by: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  bucket_id: string;
  folder: string | null;
  description: string | null;
  tags: string[] | null;
  is_public: boolean;
  download_count: number;
  last_accessed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FileWithUploader extends FileMetadata {
  uploader?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface UploadProgress {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export type SortOption = 'name' | 'date' | 'size' | 'type';
export type SortDirection = 'asc' | 'desc';

export interface FileFilters {
  folder?: string;
  mimeType?: string;
  search?: string;
  tags?: string[];
}
