import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import type {HomeCardResponse} from '@/features/home-cards/types';
import type {ContactMethodResponse} from '@/features/contact-methods/types';
import type {SectionContentBlockResponse} from '@/features/content-blocks/types';
import type {SectionCategoryResponse} from '@/features/categories/types';
import type {SectionResponse} from '@/features/sections/types';
import type {SiteSettingsResponse} from '@/features/site-settings/types';
import type {PortfolioProjectResponse} from '@/features/portfolio-projects/types';
import type {SectionItemMediaResponse} from '@/features/item-media/types';
import type {PortfolioProjectMediaResponse} from '@/features/portfolio-project-media/types';
import type {PageResponse} from '@/types/api';
import type {
  PublicHomeData,
  PublicHomeGalleryImage,
  PublicSectionItemResponse,
  PublicSectionPageData
} from './types';

/**
 * The homepage shows every active item/project directly, no "view all"
 * click-through, so this is a generous cap rather than a small preview size.
 */
const HOME_GALLERY_IMAGE_COUNT = 60;

export const PUBLIC_ITEMS_PAGE_SIZE = 24;

/**
 * How long the server may reuse a public response. Public content changes when
 * the owner edits it, so a short window turns a burst of visitors into one
 * backend call while an edit still appears within the minute.
 */
const PUBLIC_REVALIDATE_SECONDS = 60;

/**
 * One page of a section's active items, optionally narrowed to a category.
 * The public page reads items this way so a section with hundreds of them
 * does not ship all of them on first load.
 */
export async function getPublicSectionItemsPage(
  sectionId: number,
  categoryId: number | 'uncategorized' | null,
  page: number,
  size: number = PUBLIC_ITEMS_PAGE_SIZE
): Promise<PageResponse<PublicSectionItemResponse>> {
  const params = new URLSearchParams({page: String(page), size: String(size)});

  if (categoryId === 'uncategorized') {
    params.set('uncategorized', 'true');
  } else if (typeof categoryId === 'number') {
    params.set('categoryId', String(categoryId));
  }

  return apiClient<PageResponse<PublicSectionItemResponse>>(
    `${endpoints.public.sectionItemsPage(sectionId)}?${params.toString()}`,
    {method: 'GET', revalidate: PUBLIC_REVALIDATE_SECONDS}
  );
}

/** One page of a portfolio section's active projects. */
export async function getPublicPortfolioProjectsPage(
  sectionId: number,
  page: number,
  size: number = PUBLIC_ITEMS_PAGE_SIZE
): Promise<PageResponse<PortfolioProjectResponse>> {
  const params = new URLSearchParams({page: String(page), size: String(size)});

  return apiClient<PageResponse<PortfolioProjectResponse>>(
    `${endpoints.public.portfolioSectionProjectsPage(sectionId)}?${params.toString()}`,
    {method: 'GET', revalidate: PUBLIC_REVALIDATE_SECONDS}
  );
}

const EMPTY_PROJECTS_PAGE: PageResponse<PortfolioProjectResponse> = {
  content: [],
  page: 0,
  size: PUBLIC_ITEMS_PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
  hasNext: false
};

const EMPTY_ITEMS_PAGE: PageResponse<PublicSectionItemResponse> = {
  content: [],
  page: 0,
  size: PUBLIC_ITEMS_PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
  hasNext: false
};

function sortByOrder<T extends {sortOrder: number}>(items: T[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Every portfolio project as a homepage gallery image, always caption-free —
 * "Our Work" is a pure photo wall regardless of the section's own toggle.
 */
async function getSectionWorkImages(
  section: SectionResponse
): Promise<PublicHomeGalleryImage[]> {
  const page = await getPublicPortfolioProjectsPage(
    section.id,
    0,
    HOME_GALLERY_IMAGE_COUNT
  ).catch(() => EMPTY_PROJECTS_PAGE);

  return page.content.map((project) => ({
    id: project.id,
    imageUrl: project.coverImageUrl ?? null,
    titlePt: project.titlePt,
    titleEn: project.titleEn,
    isFeatured: project.isFeatured,
    showCaption: false,
    sectionSlug: section.slug
  }));
}

/**
 * Every item in one non-portfolio section as a homepage gallery image, its
 * caption shown or hidden per that section's own "Homepage preview" toggle.
 */
async function getSectionServiceImages(
  section: SectionResponse
): Promise<PublicHomeGalleryImage[]> {
  const page = await getPublicSectionItemsPage(
    section.id,
    null,
    0,
    HOME_GALLERY_IMAGE_COUNT
  ).catch(() => EMPTY_ITEMS_PAGE);

  return page.content.map((item) => ({
    id: item.id,
    imageUrl: item.coverImageUrl ?? null,
    titlePt: item.titlePt,
    titleEn: item.titleEn,
    isFeatured: item.isFeatured,
    showCaption: section.showItemDetails,
    sectionSlug: section.slug
  }));
}

/**
 * Merges every featured section's items/projects into exactly two homepage
 * galleries — "Services" (everything except portfolio sections) and
 * "Our Work" (portfolio sections) — rather than one row per section.
 */
async function getPublicHomeGalleries(homeCards: HomeCardResponse[]): Promise<{
  servicesImages: PublicHomeGalleryImage[];
  ourWorkImages: PublicHomeGalleryImage[];
}> {
  const sections = await apiClient<SectionResponse[]>(endpoints.public.sections, {
    method: 'GET',
    revalidate: PUBLIC_REVALIDATE_SECONDS
  }).catch(() => []);

  const sectionsById = new Map(sections.map((section) => [section.id, section]));

  const featuredSections = homeCards
    .map((homeCard) => sectionsById.get(homeCard.sectionId))
    .filter((section): section is SectionResponse => Boolean(section));

  const workSections = featuredSections.filter(
    (section) => section.sectionType === 'PORTFOLIO'
  );
  const serviceSections = featuredSections.filter(
    (section) => section.sectionType === 'DIRECT_ITEMS' || section.sectionType === 'CATEGORY_ITEMS'
  );

  const [servicesGroups, workGroups] = await Promise.all([
    Promise.all(serviceSections.map(getSectionServiceImages)),
    Promise.all(workSections.map(getSectionWorkImages))
  ]);

  return {
    servicesImages: servicesGroups.flat(),
    ourWorkImages: workGroups.flat()
  };
}

export async function getPublicHomeData(): Promise<PublicHomeData> {
  const [siteSettings, homeCardsRaw, contactMethods] = await Promise.all([
    apiClient<SiteSettingsResponse>(endpoints.public.siteSettings, {
      method: 'GET',
      revalidate: PUBLIC_REVALIDATE_SECONDS
    }).catch(() => null),

    apiClient<HomeCardResponse[]>(endpoints.public.homeCards, {
      method: 'GET',
      revalidate: PUBLIC_REVALIDATE_SECONDS
    }).catch(() => []),

    apiClient<ContactMethodResponse[]>(endpoints.public.contactMethods, {
      method: 'GET',
      revalidate: PUBLIC_REVALIDATE_SECONDS
    }).catch(() => [])
  ]);

  const homeCards = sortByOrder(homeCardsRaw.filter((item) => item.isActive));
  const {servicesImages, ourWorkImages} = await getPublicHomeGalleries(homeCards);

  return {
    siteSettings,
    homeCards,
    contactMethods: sortByOrder(
      contactMethods.filter((item) => item.isActive)
    ),
    servicesImages,
    ourWorkImages
  };
}

export async function getPublicSectionBySlug(
  slug: string
): Promise<SectionResponse | null> {
  return apiClient<SectionResponse>(endpoints.public.sectionBySlug(slug), {
    method: 'GET',
    revalidate: PUBLIC_REVALIDATE_SECONDS
  }).catch(() => null);
}

export async function getPublicItemMedia(
  itemId: number
): Promise<SectionItemMediaResponse[]> {
  const media = await apiClient<SectionItemMediaResponse[]>(
    endpoints.public.itemMedia(itemId),
    {
      method: 'GET',
      revalidate: PUBLIC_REVALIDATE_SECONDS
    }
  ).catch(() => []);

  return sortByOrder(media.filter((item) => item.isActive));
}

export async function getPublicPortfolioProjectMedia(
  projectId: number
): Promise<PortfolioProjectMediaResponse[]> {
  const media = await apiClient<PortfolioProjectMediaResponse[]>(
    endpoints.public.portfolioProjectMedia(projectId),
    {
      method: 'GET',
      revalidate: PUBLIC_REVALIDATE_SECONDS
    }
  ).catch(() => []);

  return sortByOrder(media.filter((item) => item.isActive));
}

export async function getPublicSectionPageData(
  slug: string
): Promise<PublicSectionPageData | null> {
  const section = await getPublicSectionBySlug(slug);

  if (!section || !section.isActive) {
    return null;
  }

  const empty = {
    contentBlocks: [] as SectionContentBlockResponse[],
    categories: [] as SectionCategoryResponse[],
    initialItems: null as PageResponse<PublicSectionItemResponse> | null,
    hasUncategorizedItems: false,
    initialProjects: null as PageResponse<PortfolioProjectResponse> | null
  };

  if (section.sectionType === 'CONTENT') {
    const contentBlocks = await apiClient<SectionContentBlockResponse[]>(
      endpoints.public.sectionContentBlocks(section.id),
      {method: 'GET', revalidate: PUBLIC_REVALIDATE_SECONDS}
    ).catch(() => []);

    return {
      section,
      ...empty,
      contentBlocks: sortByOrder(contentBlocks.filter((item) => item.isActive))
    };
  }

  if (section.sectionType === 'CATEGORY_ITEMS') {
    const categories = sortByOrder(
      (
        await apiClient<SectionCategoryResponse[]>(
          endpoints.public.sectionCategories(section.id),
          {method: 'GET', revalidate: PUBLIC_REVALIDATE_SECONDS}
        ).catch(() => [])
      ).filter((item) => item.isActive)
    );

    // The page opens on the first category, or on the uncategorized items when
    // there are no categories — so that is the page rendered on the server.
    const [uncategorizedProbe, initialItems] = await Promise.all([
      getPublicSectionItemsPage(section.id, 'uncategorized', 0, 1).catch(
        () => EMPTY_ITEMS_PAGE
      ),
      getPublicSectionItemsPage(
        section.id,
        categories.length ? categories[0].id : 'uncategorized',
        0
      ).catch(() => EMPTY_ITEMS_PAGE)
    ]);

    return {
      section,
      ...empty,
      categories,
      initialItems,
      hasUncategorizedItems: uncategorizedProbe.totalElements > 0
    };
  }

  if (section.sectionType === 'DIRECT_ITEMS') {
    const initialItems = await getPublicSectionItemsPage(
      section.id,
      null,
      0
    ).catch(() => EMPTY_ITEMS_PAGE);

    return {
      section,
      ...empty,
      initialItems
    };
  }

  if (section.sectionType === 'PORTFOLIO') {
    const initialProjects = await getPublicPortfolioProjectsPage(
      section.id,
      0
    ).catch(() => EMPTY_PROJECTS_PAGE);

    return {
      section,
      ...empty,
      initialProjects
    };
  }

  return {
    section,
    ...empty
  };
}