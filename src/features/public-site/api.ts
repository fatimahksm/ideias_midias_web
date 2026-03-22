import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import type {HomeCardResponse} from '@/features/home-cards/types';
import type {ContactMethodResponse} from '@/features/contact-methods/types';
import type {SectionContentBlockResponse} from '@/features/content-blocks/types';
import type {SectionCategoryResponse} from '@/features/categories/types';
import type {SectionResponse, SectionType} from '@/features/sections/types';
import type {SiteSettingsResponse} from '@/features/site-settings/types';
import type {PortfolioProjectResponse} from '@/features/portfolio-projects/types';
import type {
  PublicHomeData,
  PublicSectionItemResponse,
  PublicSectionPageData
} from './types';

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
    items: [] as PublicSectionItemResponse[],
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
    const [categories, items] = await Promise.all([
      apiClient<SectionCategoryResponse[]>(
        endpoints.public.sectionCategories(section.id),
        {method: 'GET'}
      ).catch(() => []),
      apiClient<PublicSectionItemResponse[]>(
        endpoints.public.sectionItems(section.id),
        {method: 'GET'}
      ).catch(() => [])
    ]);

    return {
      section,
      ...empty,
      categories: sortByOrder(categories.filter((item) => item.isActive)),
      items: sortByOrder(items.filter((item) => item.isActive))
    };
  }

  if (section.sectionType === 'DIRECT_ITEMS') {
    const items = await apiClient<PublicSectionItemResponse[]>(
      endpoints.public.sectionItems(section.id),
      {method: 'GET'}
    ).catch(() => []);

    return {
      section,
      ...empty,
      items: sortByOrder(items.filter((item) => item.isActive))
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