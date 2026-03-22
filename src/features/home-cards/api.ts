import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {HomeCardPayload, HomeCardResponse} from './types';

function getRequiredToken() {
  const token = getAdminToken();

  if (!token) {
    throw new Error('No admin token found.');
  }

  return token;
}

export async function getAllHomeCards() {
  return apiClient<HomeCardResponse[]>(endpoints.admin.homeCards, {
    method: 'GET',
    token: getRequiredToken()
  });
}



export async function getHomeCardById(id: number) {
  return apiClient<HomeCardResponse>(`${endpoints.admin.homeCards}/${id}`, {
    method: 'GET',
    token: getRequiredToken()
  });
}

export async function createHomeCard(payload: HomeCardPayload) {
  return apiClient<HomeCardResponse>(endpoints.admin.homeCards, {
    method: 'POST',
    token: getRequiredToken(),
    body: payload
  });
}

export async function updateHomeCard(id: number, payload: HomeCardPayload) {
  return apiClient<HomeCardResponse>(`${endpoints.admin.homeCards}/${id}`, {
    method: 'PUT',
    token: getRequiredToken(),
    body: payload
  });
}

export async function deleteHomeCard(id: number) {
  return apiClient<void>(`${endpoints.admin.homeCards}/${id}`, {
    method: 'DELETE',
    token: getRequiredToken()
  });
}