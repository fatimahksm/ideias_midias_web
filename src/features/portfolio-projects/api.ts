import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {PageResponse} from '@/types/api';
import type {
  PortfolioProjectPayload,
  PortfolioProjectResponse
} from './types';

function token() {
  const t = getAdminToken();
  if (!t) throw new Error('No admin token');
  return t;
}

export const PORTFOLIO_PAGE_SIZE = 24;

export type PortfolioPageQuery = {
  sectionId?: number | null;
  status?: string;
  featured?: boolean | null;
  search?: string;
  sort?: string;
  page: number;
  size?: number;
};

/** One page of projects, filtered and sorted by the server. */
export function getPortfolioProjectsPage(query: PortfolioPageQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size ?? PORTFOLIO_PAGE_SIZE)
  });

  if (query.sectionId != null) params.set('sectionId', String(query.sectionId));
  if (query.status && query.status !== 'ALL') params.set('status', query.status);
  if (query.featured != null) params.set('featured', String(query.featured));
  if (query.search) params.set('search', query.search);
  if (query.sort) params.set('sort', query.sort);

  return apiClient<PageResponse<PortfolioProjectResponse>>(
    `${endpoints.admin.portfolioProjects}/page?${params.toString()}`,
    {method: 'GET', token: token()}
  );
}

export type PortfolioStats = {
  total: number;
  active: number;
  featured: number;
};

/** Counts for the stat cards, scoped like the listing. */
export function getPortfolioProjectStats(sectionId?: number | null) {
  const query = sectionId != null ? `?sectionId=${sectionId}` : '';

  return apiClient<PortfolioStats>(
    `${endpoints.admin.portfolioProjects}/stats${query}`,
    {method: 'GET', token: token()}
  );
}

export const getAllPortfolioProjects = () =>
  apiClient<PortfolioProjectResponse[]>(endpoints.admin.portfolioProjects, {
    method: 'GET',
    token: token()
  });

export const getPortfolioProjectById = (id: number) =>
  apiClient<PortfolioProjectResponse>(
    `${endpoints.admin.portfolioProjects}/${id}`,
    {
      method: 'GET',
      token: token()
    }
  );

export const getPortfolioProjectsBySection = (sectionId: number) =>
  apiClient<PortfolioProjectResponse[]>(
    `${endpoints.admin.portfolioProjects}/section/${sectionId}`,
    {
      method: 'GET',
      token: token()
    }
  );

export const createPortfolioProject = (payload: PortfolioProjectPayload) =>
  apiClient<PortfolioProjectResponse>(endpoints.admin.portfolioProjects, {
    method: 'POST',
    token: token(),
    body: payload
  });

export const updatePortfolioProject = (
  id: number,
  payload: PortfolioProjectPayload
) =>
  apiClient<PortfolioProjectResponse>(
    `${endpoints.admin.portfolioProjects}/${id}`,
    {
      method: 'PUT',
      token: token(),
      body: payload
    }
  );

export const deletePortfolioProject = (id: number) =>
  apiClient<void>(`${endpoints.admin.portfolioProjects}/${id}`, {
    method: 'DELETE',
    token: token()
  });