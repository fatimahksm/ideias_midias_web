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
    body: payload
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
    token: finalToken
  });
}

export function logoutAdminLocal() {
  clearAdminSession();
}