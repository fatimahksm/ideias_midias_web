export type PortfolioProjectMediaType = 'IMAGE' | 'VIDEO';

export type PortfolioProjectMediaResponse = {
  id: number;
  projectId: number;
  mediaType: PortfolioProjectMediaType;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  altTextPt?: string | null;
  altTextEn?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PortfolioProjectMediaPayload = {
  projectId: number;
  mediaType: PortfolioProjectMediaType;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  altTextPt?: string | null;
  altTextEn?: string | null;
  isActive: boolean;
  sortOrder: number;
};