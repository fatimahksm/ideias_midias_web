'use client';

import {useQuery} from '@tanstack/react-query';
import {adminRefresh, getCurrentAdmin} from '@/features/auth/api';
import {getAdminToken, setAdminToken} from '@/lib/auth/token';

export function useAdminSession(enabled = true) {
  return useQuery({
    queryKey: ['admin-session'],
    queryFn: async () => {
      let token = getAdminToken();

      if (!token) {
        const refreshed = await adminRefresh();
        setAdminToken(refreshed.token);
        token = refreshed.token;
      }

      return getCurrentAdmin(token);
    },
    enabled,
    retry: false,
    staleTime: 300_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });
}