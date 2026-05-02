import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken, clearAdminSession} from '@/lib/auth/token';
import type {
  AdminLoginPayload,
  AdminLoginResponse,
  AdminMeResponse
} from './types';

function resolveAdminToken(token?: string | null) {
  if (typeof token === 'string' && token.trim()) {
    return token.trim();
  }

  return getAdminToken();
}

export async function adminLogin(payload: AdminLoginPayload) {
  return apiClient<AdminLoginResponse>(endpoints.auth.adminLogin, {
    method: 'POST',
    body: payload,
    credentials: 'include'
  });
}

export async function adminRefresh() {
  return apiClient<AdminLoginResponse>(endpoints.auth.adminRefresh, {
    method: 'POST',
    credentials: 'include',
    skipAuthRefresh: true
  });
}

export async function adminLogout() {
  return apiClient<void>(endpoints.auth.adminLogout, {
    method: 'POST',
    credentials: 'include',
    skipAuthRefresh: true
  });
}

export async function getCurrentAdmin(token?: string | null) {
  const finalToken = resolveAdminToken(token);

  if (!finalToken) {
    clearAdminSession();
    throw new Error('No admin token found.');
  }

  return apiClient<AdminMeResponse>(endpoints.auth.adminMe, {
    method: 'GET',
    token: finalToken,
    credentials: 'include'
  });
}

export function logoutAdminLocal() {
  clearAdminSession();
}