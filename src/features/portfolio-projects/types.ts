export type PortfolioProjectResponse = {
  id: number;
  sectionId: number;

  titlePt: string;
  titleEn: string;

  shortDescriptionPt?: string | null;
  shortDescriptionEn?: string | null;

  fullDescriptionPt?: string | null;
  fullDescriptionEn?: string | null;

  clientName?: string | null;
  projectDate?: string | null;

  locationPt?: string | null;
  locationEn?: string | null;

  coverImageUrl?: string | null;
  videoUrl?: string | null;

  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;

  createdAt?: string;
  updatedAt?: string;
};

export type PortfolioProjectPayload = {
  sectionId: number;

  titlePt: string;
  titleEn: string;

  shortDescriptionPt?: string | null;
  shortDescriptionEn?: string | null;

  fullDescriptionPt?: string | null;
  fullDescriptionEn?: string | null;

  clientName?: string | null;
  projectDate?: string | null;

  locationPt?: string | null;
  locationEn?: string | null;

  coverImageUrl?: string | null;
  videoUrl?: string | null;

  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
};