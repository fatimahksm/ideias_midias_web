export type SectionType =
  | 'CONTENT'
  | 'CATEGORY_ITEMS'
  | 'DIRECT_ITEMS'
  | 'PORTFOLIO';

export type SectionResponse = {
  id: number;
  slug: string;
  namePt: string;
  nameEn: string;
  descriptionPt?: string | null;
  descriptionEn?: string | null;
  sectionType: SectionType;
  coverImageUrl?: string | null;
  coverVideoUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SectionPayload = {
  slug: string;
  namePt: string;
  nameEn: string;
  descriptionPt?: string | null;
  descriptionEn?: string | null;
  sectionType: SectionType;
  coverImageUrl?: string | null;
  coverVideoUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
};