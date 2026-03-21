import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {SiteSettingsPayload, SiteSettingsResponse} from './types';

export async function getAdminSiteSettings(): Promise<SiteSettingsResponse> {
  const token = getAdminToken();

  if (!token) {
    throw new Error('No admin token found.');
  }

  return apiClient<SiteSettingsResponse>(endpoints.admin.siteSettings, {
    method: 'GET',
    token
  });
}

export async function updateAdminSiteSettings(
  payload: SiteSettingsPayload
): Promise<SiteSettingsResponse> {
  const token = getAdminToken();

  if (!token) {
    throw new Error('No admin token found.');
  }

  return apiClient<SiteSettingsResponse>(endpoints.admin.siteSettings, {
    method: 'PUT',
    token,
    body: payload
  });
}

export async function getPublicSiteSettings(): Promise<SiteSettingsResponse> {
  return apiClient<SiteSettingsResponse>(endpoints.public.siteSettings, {
    method: 'GET'
  });
}