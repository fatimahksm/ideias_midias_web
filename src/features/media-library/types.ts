export type MediaFileType = 'IMAGE' | 'VIDEO';

export type MediaLibraryItem = {
  id: number;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: MediaFileType;
  mimeType: string;
  fileSize: number;
  uploadedById?: number | null;
  createdAt?: string;
  updatedAt?: string;
};