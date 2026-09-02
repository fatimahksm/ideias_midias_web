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
export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};
