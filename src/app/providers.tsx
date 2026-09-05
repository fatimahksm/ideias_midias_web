'use client';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useState} from 'react';
import {ToastProvider} from '@/components/common/toast-provider';

type Props = {
  children: React.ReactNode;
};

export default function Providers({children}: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false
          },
          mutations: {
            retry: 0
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}