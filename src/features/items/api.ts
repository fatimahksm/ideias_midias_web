import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {PageResponse} from '@/types/api';
import type {SectionItemPayload, SectionItemResponse} from './types';

function token() {
  const t = getAdminToken();
  if (!t) throw new Error('No admin token');
  return t;
}

export const getAllItems = () =>
  apiClient<SectionItemResponse[]>(endpoints.admin.items, {
    method: 'GET',
    token: token()
  });

export const ITEMS_PAGE_SIZE = 24;

export type ItemsPageQuery = {
  sectionId?: number | null;
  categoryId?: number | null;
  status?: string;
  featured?: boolean | null;
  search?: string;
  sort?: string;
  page: number;
  size?: number;
};

/**
 * One page of items. Search, filters and sorting are all applied by the
 * server, so paging never hides rows a filter should have matched.
 */
export function getItemsPage(query: ItemsPageQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size ?? ITEMS_PAGE_SIZE)
  });

  if (query.sectionId != null) params.set('sectionId', String(query.sectionId));
  if (query.categoryId != null) params.set('categoryId', String(query.categoryId));
  if (query.status && query.status !== 'ALL') params.set('status', query.status);
  if (query.featured != null) params.set('featured', String(query.featured));
  if (query.search) params.set('search', query.search);
  if (query.sort) params.set('sort', query.sort);

  return apiClient<PageResponse<SectionItemResponse>>(
    `${endpoints.admin.items}/page?${params.toString()}`,
    {method: 'GET', token: token()}
  );
}

export type ItemStats = {
  total: number;
  active: number;
  featured: number;
};

/** Counts for the stat cards, scoped like the listing. */
export function getItemStats(sectionId?: number | null, categoryId?: number | null) {
  const params = new URLSearchParams();

  if (sectionId != null) params.set('sectionId', String(sectionId));
  if (categoryId != null) params.set('categoryId', String(categoryId));

  const query = params.toString();

  return apiClient<ItemStats>(
    `${endpoints.admin.items}/stats${query ? `?${query}` : ''}`,
    {method: 'GET', token: token()}
  );
}

export const getItemById = (id: number) =>
  apiClient<SectionItemResponse>(`${endpoints.admin.items}/${id}`, {
    method: 'GET',
    token: token()
  });

export const createItem = (payload: SectionItemPayload) =>
  apiClient<SectionItemResponse>(endpoints.admin.items, {
    method: 'POST',
    token: token(),
    body: payload
  });

export const updateItem = (id: number, payload: SectionItemPayload) =>
  apiClient<SectionItemResponse>(`${endpoints.admin.items}/${id}`, {
    method: 'PUT',
    token: token(),
    body: payload
  });

export const deleteItem = (id: number) =>
  apiClient<void>(`${endpoints.admin.items}/${id}`, {
    method: 'DELETE',
    token: token()
  });