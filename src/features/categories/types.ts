export type SectionCategoryResponse = {
  id: number;
  sectionId: number;
  namePt: string;
  nameEn: string;
  descriptionPt?: string | null;
  descriptionEn?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SectionCategoryPayload = {
  sectionId: number;
  namePt: string;
  nameEn: string;
  descriptionPt?: string | null;
  descriptionEn?: string | null;
  isActive: boolean;
  sortOrder: number;
};