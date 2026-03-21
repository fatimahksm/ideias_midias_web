import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import type {ThemeSettings} from  '@/lib/theme/types';

export async function getPublicThemeSettings() {
  return apiClient<ThemeSettings>(endpoints.public.themeSettings, {
    method: 'GET'
  });
}