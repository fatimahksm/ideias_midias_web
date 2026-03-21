import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import type {AdminLoginPayload, AdminLoginResponse} from './types';

export async function adminLogin(payload: AdminLoginPayload) {
  return apiClient<AdminLoginResponse>(endpoints.auth.adminLogin, {
    method: 'POST',
    body: payload
  });
}