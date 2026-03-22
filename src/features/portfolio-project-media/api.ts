import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {
  PortfolioProjectMediaPayload,
  PortfolioProjectMediaResponse,
  PortfolioProjectMediaType
} from './types';

function token() {
  const t = getAdminToken();
  if (!t) throw new Error('No admin token');
  return t;
}

export const getAllPortfolioProjectMedia = () =>
  apiClient<PortfolioProjectMediaResponse[]>(
    endpoints.admin.portfolioProjectMedia,
    {
      method: 'GET',
      token: token()
    }
  );

export const getPortfolioProjectMediaById = (id: number) =>
  apiClient<PortfolioProjectMediaResponse>(
    `${endpoints.admin.portfolioProjectMedia}/${id}`,
    {
      method: 'GET',
      token: token()
    }
  );

export const getPortfolioProjectMediaByProject = (projectId: number) =>
  apiClient<PortfolioProjectMediaResponse[]>(
    `${endpoints.admin.portfolioProjectMedia}/project/${projectId}`,
    {
      method: 'GET',
      token: token()
    }
  );

export const getActivePortfolioProjectMediaByProject = (projectId: number) =>
  apiClient<PortfolioProjectMediaResponse[]>(
    `${endpoints.admin.portfolioProjectMedia}/project/${projectId}/active`,
    {
      method: 'GET',
      token: token()
    }
  );

export const getPortfolioProjectMediaByProjectAndType = (
  projectId: number,
  mediaType: PortfolioProjectMediaType
) =>
  apiClient<PortfolioProjectMediaResponse[]>(
    `${endpoints.admin.portfolioProjectMedia}/project/${projectId}/type/${mediaType}`,
    {
      method: 'GET',
      token: token()
    }
  );

export const createPortfolioProjectMedia = (
  payload: PortfolioProjectMediaPayload
) =>
  apiClient<PortfolioProjectMediaResponse>(
    endpoints.admin.portfolioProjectMedia,
    {
      method: 'POST',
      token: token(),
      body: payload
    }
  );

export const updatePortfolioProjectMedia = (
  id: number,
  payload: PortfolioProjectMediaPayload
) =>
  apiClient<PortfolioProjectMediaResponse>(
    `${endpoints.admin.portfolioProjectMedia}/${id}`,
    {
      method: 'PUT',
      token: token(),
      body: payload
    }
  );

export const deletePortfolioProjectMedia = (id: number) =>
  apiClient<void>(`${endpoints.admin.portfolioProjectMedia}/${id}`, {
    method: 'DELETE',
    token: token()
  });