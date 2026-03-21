import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {
  AdminLoginPayload,
  AdminLoginResponse,
  AdminMeResponse
} from './types';

export async function adminLogin(payload: AdminLoginPayload) {
  return apiClient<AdminLoginResponse>(endpoints.auth.adminLogin, {
    method: 'POST',
    body: payload
  });
}

export async function getCurrentAdmin(token?: string | null) {
  const finalToken = token ?? getAdminToken();

  if (!finalToken) {
    throw new Error('No admin token found.');
  }

  return apiClient<AdminMeResponse>(endpoints.auth.adminMe, {
    method: 'GET',
    token: finalToken
  });
}