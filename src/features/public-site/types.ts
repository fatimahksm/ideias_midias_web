import type {HomeCardResponse} from '@/features/home-cards/types';
import type {ContactMethodResponse} from '@/features/contact-methods/types';
import type {SectionContentBlockResponse} from '@/features/content-blocks/types';
import type {SectionCategoryResponse} from '@/features/categories/types';
import type {SectionResponse} from '@/features/sections/types';
import type {SiteSettingsResponse} from '@/features/site-settings/types';
import type {PortfolioProjectResponse} from '@/features/portfolio-projects/types';

export type PublicSectionItemResponse = {
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

export type PublicHomeData = {
  siteSettings: SiteSettingsResponse | null;
  homeCards: HomeCardResponse[];
  contactMethods: ContactMethodResponse[];
};

export type PublicSectionPageData = {
  section: SectionResponse;
  contentBlocks: SectionContentBlockResponse[];
  categories: SectionCategoryResponse[];
  items: PublicSectionItemResponse[];
  projects: PortfolioProjectResponse[];
};