import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import type {AnalyticsRangeDays} from './constants';
import type {AnalyticsSummaryResponse} from './types';

function getRequiredToken() {
  const token = getAdminToken();

  if (!token) {
    throw new Error('No admin token found.');
  }

  return token;
}

export async function getAnalyticsSummary(rangeDays: AnalyticsRangeDays) {
  return apiClient<AnalyticsSummaryResponse>(
    `${endpoints.admin.analyticsSummary}?rangeDays=${rangeDays}`,
    {
      method: 'GET',
      token: getRequiredToken()
    }
  );
}
