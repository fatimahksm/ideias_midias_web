import type {HomeCardResponse} from '@/features/home-cards/types';
import type {ContactMethodResponse} from '@/features/contact-methods/types';
import type {SectionContentBlockResponse} from '@/features/content-blocks/types';
import type {SectionCategoryResponse} from '@/features/categories/types';
import type {SectionResponse} from '@/features/sections/types';
import type {SiteSettingsResponse} from '@/features/site-settings/types';
import type {PortfolioProjectResponse} from '@/features/portfolio-projects/types';
import type {PageResponse} from '@/types/api';

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

export type PublicHomeGalleryImage = {
  id: number;
  imageUrl: string | null;
  titlePt: string;
  titleEn: string;
  isFeatured: boolean;
  /** Whether this image's own section wants item names shown under it. */
  showCaption: boolean;
  /** Section this image belongs to, so the card can link to the right page. */
  sectionSlug: string;
};

export type PublicHomeData = {
  siteSettings: SiteSettingsResponse | null;
  homeCards: HomeCardResponse[];
  contactMethods: ContactMethodResponse[];
  /** Items from every non-portfolio featured section, merged into one gallery. */
  servicesImages: PublicHomeGalleryImage[];
  /** Projects from every portfolio-type featured section, merged into one gallery. */
  ourWorkImages: PublicHomeGalleryImage[];
};

export type PublicSectionPageData = {
  section: SectionResponse;
  contentBlocks: SectionContentBlockResponse[];
  categories: SectionCategoryResponse[];
  /**
   * First page of the selection the page opens on, rendered on the server so
   * the visitor sees items immediately. Further pages, and other categories,
   * are fetched in the browser.
   */
  initialItems: PageResponse<PublicSectionItemResponse> | null;
  /** Whether the "uncategorized" tab has anything behind it. */
  hasUncategorizedItems: boolean;
  /** First page of the section's projects, rendered on the server. */
  initialProjects: PageResponse<PortfolioProjectResponse> | null;
};