import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {ThemeSettings} from '@/lib/theme/types';

export async function getPublicThemeSettings() {
  return apiClient<ThemeSettings>(endpoints.public.themeSettings, {
    method: 'GET'
  });
}

export async function getAdminThemeSettings() {
  return apiClient<ThemeSettings>(endpoints.admin.themeSettings, {
    method: 'GET',
    token: getAdminToken()
  });
}

export async function updateAdminThemeSettings(payload: ThemeSettings) {
  return apiClient<ThemeSettings>(endpoints.admin.themeSettings, {
    method: 'PUT',
    token: getAdminToken(),
    body: payload
  });
}