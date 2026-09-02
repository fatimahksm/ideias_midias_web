import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {ContentStatsResponse} from './types';

/**
 * Counts for the dashboard. The dashboard used to fetch every row of nine
 * tables to show how many there were; this is one request of nine counts.
 */
export async function getContentStats() {
  const token = getAdminToken();

  if (!token) {
    throw new Error('No admin token found.');
  }

  return apiClient<ContentStatsResponse>(endpoints.admin.statsSummary, {
    method: 'GET',
    token
  });
}
