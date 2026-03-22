import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {
  SectionContentBlockPayload,
  SectionContentBlockResponse
} from './types';

function token() {
  const t = getAdminToken();
  if (!t) throw new Error('No admin token');
  return t;
}

export const getAllContentBlocks = () =>
  apiClient<SectionContentBlockResponse[]>(endpoints.admin.contentBlocks, {
    method: 'GET',
    token: token()
  });

export const getContentBlockById = (id: number) =>
  apiClient<SectionContentBlockResponse>(
    `${endpoints.admin.contentBlocks}/${id}`,
    {
      method: 'GET',
      token: token()
    }
  );

export const getContentBlocksBySection = (sectionId: number) =>
  apiClient<SectionContentBlockResponse[]>(
    `${endpoints.admin.contentBlocks}/section/${sectionId}`,
    {
      method: 'GET',
      token: token()
    }
  );

export const createContentBlock = (payload: SectionContentBlockPayload) =>
  apiClient<SectionContentBlockResponse>(endpoints.admin.contentBlocks, {
    method: 'POST',
    token: token(),
    body: payload
  });

export const updateContentBlock = (
  id: number,
  payload: SectionContentBlockPayload
) =>
  apiClient<SectionContentBlockResponse>(
    `${endpoints.admin.contentBlocks}/${id}`,
    {
      method: 'PUT',
      token: token(),
      body: payload
    }
  );

export const deleteContentBlock = (id: number) =>
  apiClient<void>(`${endpoints.admin.contentBlocks}/${id}`, {
    method: 'DELETE',
    token: token()
  });