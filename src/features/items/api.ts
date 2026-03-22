import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
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