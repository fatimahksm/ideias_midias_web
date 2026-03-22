export type ItemMediaType = 'IMAGE' | 'VIDEO';

export type SectionItemMediaResponse = {
  id: number;
  itemId: number;
  mediaType: ItemMediaType;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  altTextPt?: string | null;
  altTextEn?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SectionItemMediaPayload = {
  itemId: number;
  mediaType: ItemMediaType;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  altTextPt?: string | null;
  altTextEn?: string | null;
  isActive: boolean;
  sortOrder: number;
};