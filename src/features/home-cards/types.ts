
export type HomeCardResponse = {
  id: number;
  sectionId: number;
  sectionSlug?: string | null;
  titlePt: string;
  titleEn: string;
  shortDescriptionPt?: string | null;
  shortDescriptionEn?: string | null;
  imageUrl?: string | null;
  iconName?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type HomeCardPayload = {
  sectionId: number;
  titlePt: string;
  titleEn: string;
  shortDescriptionPt?: string | null;
  shortDescriptionEn?: string | null;
  imageUrl?: string | null;
  iconName?: string | null;
  sortOrder: number;
  isActive: boolean;
};

