import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {
  SectionItemMediaPayload,
  SectionItemMediaResponse,
  ItemMediaType
} from './types';

function token() {
  const t = getAdminToken();
  if (!t) throw new Error('No admin token');
  return t;
}

export const getAllItemMedia = () =>
  apiClient<SectionItemMediaResponse[]>(endpoints.admin.itemMedia, {
    method: 'GET',
    token: token()
  });

export const getItemMediaById = (id: number) =>
  apiClient<SectionItemMediaResponse>(`${endpoints.admin.itemMedia}/${id}`, {
    method: 'GET',
    token: token()
  });

export const getItemMediaByItem = (itemId: number) =>
  apiClient<SectionItemMediaResponse[]>(
    `${endpoints.admin.itemMedia}/item/${itemId}`,
    {
      method: 'GET',
      token: token()
    }
  );

export const getActiveItemMediaByItem = (itemId: number) =>
  apiClient<SectionItemMediaResponse[]>(
    `${endpoints.admin.itemMedia}/item/${itemId}/active`,
    {
      method: 'GET',
      token: token()
    }
  );

export const getItemMediaByItemAndType = (
  itemId: number,
  mediaType: ItemMediaType
) =>
  apiClient<SectionItemMediaResponse[]>(
    `${endpoints.admin.itemMedia}/item/${itemId}/type/${mediaType}`,
    {
      method: 'GET',
      token: token()
    }
  );

export const createItemMedia = (payload: SectionItemMediaPayload) =>
  apiClient<SectionItemMediaResponse>(endpoints.admin.itemMedia, {
    method: 'POST',
    token: token(),
    body: payload
  });

export const updateItemMedia = (
  id: number,
  payload: SectionItemMediaPayload
) =>
  apiClient<SectionItemMediaResponse>(`${endpoints.admin.itemMedia}/${id}`, {
    method: 'PUT',
    token: token(),
    body: payload
  });

export const deleteItemMedia = (id: number) =>
  apiClient<void>(`${endpoints.admin.itemMedia}/${id}`, {
    method: 'DELETE',
    token: token()
  });