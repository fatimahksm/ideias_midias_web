export type SectionItemResponse = {
  id: number;
  sectionId: number;
  categoryId?: number | null;

  titlePt: string;
  titleEn: string;

  shortDescriptionPt?: string | null;
  shortDescriptionEn?: string | null;

  fullDescriptionPt?: string | null;
  fullDescriptionEn?: string | null;

  coverImageUrl?: string | null;
  videoUrl?: string | null;

  itemType?: string | null;
  specificationsPt?: string | null;
  specificationsEn?: string | null;

  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;

  createdAt?: string;
  updatedAt?: string;
};

export type SectionItemPayload = {
  sectionId: number;
  categoryId?: number | null;

  titlePt: string;
  titleEn: string;

  shortDescriptionPt?: string | null;
  shortDescriptionEn?: string | null;

  fullDescriptionPt?: string | null;
  fullDescriptionEn?: string | null;

  coverImageUrl?: string | null;
  videoUrl?: string | null;

  itemType?: string | null;
  specificationsPt?: string | null;
  specificationsEn?: string | null;

  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
};