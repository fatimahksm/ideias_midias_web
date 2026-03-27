'use client';

import {useQuery} from '@tanstack/react-query';
import {getCurrentAdmin} from '@/features/auth/api';

export function useAdminSession(enabled = true) {
  return useQuery({
    queryKey: ['admin-session'],
    queryFn: () => getCurrentAdmin(),
    enabled,
    retry: false,
    staleTime: 300_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });
}