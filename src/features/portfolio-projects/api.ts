import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {
  PortfolioProjectPayload,
  PortfolioProjectResponse
} from './types';

function token() {
  const t = getAdminToken();
  if (!t) throw new Error('No admin token');
  return t;
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