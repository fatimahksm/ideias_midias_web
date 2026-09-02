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
  PublicSectionItemResponse,
  PublicSectionPageData
} from './types';

export const PUBLIC_ITEMS_PAGE_SIZE = 24;

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
    {method: 'GET'}
  );
}

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

export async function getPublicHomeData(): Promise<PublicHomeData> {
  const [siteSettings, homeCards, contactMethods] = await Promise.all([
    apiClient<SiteSettingsResponse>(endpoints.public.siteSettings, {
      method: 'GET'
    }).catch(() => null),

    apiClient<HomeCardResponse[]>(endpoints.public.homeCards, {
      method: 'GET'
    }).catch(() => []),

    apiClient<ContactMethodResponse[]>(endpoints.public.contactMethods, {
      method: 'GET'
    }).catch(() => [])
  ]);

  return {
    siteSettings,
    homeCards: sortByOrder(homeCards.filter((item) => item.isActive)),
    contactMethods: sortByOrder(
      contactMethods.filter((item) => item.isActive)
    )
  };
}

export async function getPublicSectionBySlug(
  slug: string
): Promise<SectionResponse | null> {
  return apiClient<SectionResponse>(endpoints.public.sectionBySlug(slug), {
    method: 'GET'
  }).catch(() => null);
}

export async function getPublicItemMedia(
  itemId: number
): Promise<SectionItemMediaResponse[]> {
  const media = await apiClient<SectionItemMediaResponse[]>(
    endpoints.public.itemMedia(itemId),
    {
      method: 'GET'
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
      method: 'GET'
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
    projects: [] as PortfolioProjectResponse[]
  };

  if (section.sectionType === 'CONTENT') {
    const contentBlocks = await apiClient<SectionContentBlockResponse[]>(
      endpoints.public.sectionContentBlocks(section.id),
      {method: 'GET'}
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
          {method: 'GET'}
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
    const projects = await apiClient<PortfolioProjectResponse[]>(
      endpoints.public.portfolioSectionProjects(section.id),
      {method: 'GET'}
    ).catch(() => []);

    return {
      section,
      ...empty,
      projects: sortByOrder(projects.filter((item) => item.isActive))
    };
  }

  return {
    section,
    ...empty
  };
}