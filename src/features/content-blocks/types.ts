export type ContentBlockType =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'TEXT_IMAGE'
  | 'GALLERY';

export type SectionContentBlockResponse = {
  id: number;
  sectionId: number;
  blockType: ContentBlockType;

  titlePt?: string | null;
  titleEn?: string | null;

  subtitlePt?: string | null;
  subtitleEn?: string | null;

  contentPt?: string | null;
  contentEn?: string | null;

  imageUrl?: string | null;
  videoUrl?: string | null;

  isActive: boolean;
  sortOrder: number;

  createdAt?: string;
  updatedAt?: string;
};

export type SectionContentBlockPayload = {
  sectionId: number;
  blockType: ContentBlockType;

  titlePt?: string | null;
  titleEn?: string | null;

  subtitlePt?: string | null;
  subtitleEn?: string | null;

  contentPt?: string | null;
  contentEn?: string | null;

  imageUrl?: string | null;
  videoUrl?: string | null;

  isActive: boolean;
  sortOrder: number;
};