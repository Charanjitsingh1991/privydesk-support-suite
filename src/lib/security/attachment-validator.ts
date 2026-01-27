import type { AttachmentScanResult } from '@/types/security';
import { 
  DANGEROUS_FILE_EXTENSIONS, 
  SAFE_FILE_EXTENSIONS 
} from '@/types/security';

// File size limits in bytes
export const FILE_SIZE_LIMITS = {
  free: 5 * 1024 * 1024, // 5 MB
  starter: 10 * 1024 * 1024, // 10 MB
  pro: 25 * 1024 * 1024, // 25 MB
  enterprise: 100 * 1024 * 1024, // 100 MB
};

// MIME type to extension mapping
const MIME_TO_EXTENSION: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'application/json': ['.json'],
  'application/xml': ['.xml'],
  'text/xml': ['.xml'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'application/x-7z-compressed': ['.7z'],
};

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.slice(lastDot).toLowerCase();
}

export function isDangerousExtension(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return DANGEROUS_FILE_EXTENSIONS.includes(ext);
}

export function isSafeExtension(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return SAFE_FILE_EXTENSIONS.includes(ext);
}

export function validateMimeType(fileName: string, mimeType: string): boolean {
  const ext = getFileExtension(fileName);
  const expectedExtensions = MIME_TO_EXTENSION[mimeType];
  
  if (!expectedExtensions) {
    // Unknown MIME type - consider it potentially unsafe
    return false;
  }
  
  return expectedExtensions.includes(ext);
}

export function validateFileSize(size: number, plan: keyof typeof FILE_SIZE_LIMITS): boolean {
  return size <= FILE_SIZE_LIMITS[plan];
}

export function scanAttachment(
  fileName: string,
  mimeType: string,
  fileSize: number,
  plan: keyof typeof FILE_SIZE_LIMITS = 'free'
): AttachmentScanResult {
  // Check for dangerous extension
  if (isDangerousExtension(fileName)) {
    return {
      fileName,
      safe: false,
      reason: `File type not allowed: ${getFileExtension(fileName)}`,
      blocked: true,
    };
  }

  // Check MIME type matches extension
  if (!validateMimeType(fileName, mimeType)) {
    return {
      fileName,
      safe: false,
      reason: 'File extension does not match content type',
      blocked: true,
    };
  }

  // Check file size
  if (!validateFileSize(fileSize, plan)) {
    const limitMB = FILE_SIZE_LIMITS[plan] / (1024 * 1024);
    return {
      fileName,
      safe: false,
      reason: `File size exceeds ${limitMB}MB limit for ${plan} plan`,
      blocked: true,
    };
  }

  // Check for suspicious double extensions
  if (hasDoubleExtension(fileName)) {
    return {
      fileName,
      safe: false,
      reason: 'Suspicious double extension detected',
      blocked: true,
    };
  }

  return {
    fileName,
    safe: true,
    blocked: false,
  };
}

function hasDoubleExtension(fileName: string): boolean {
  // Check for patterns like "document.pdf.exe" or "image.jpg.vbs"
  const dangerousPatterns = DANGEROUS_FILE_EXTENSIONS.map(ext => 
    new RegExp(`\\.[a-z]{2,4}\\${ext}$`, 'i')
  );
  
  return dangerousPatterns.some(pattern => pattern.test(fileName));
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦';
  return '📎';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
