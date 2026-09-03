import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {ThemeSettings} from '@/lib/theme/types';

/**
 * Read on the server so the owner's colours are in the first paint. It is
 * cached like the other public reads, so a burst of visitors costs one call.
 */
export async function getPublicThemeSettings() {
  return apiClient<ThemeSettings>(endpoints.public.themeSettings, {
    method: 'GET',
    revalidate: 60
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