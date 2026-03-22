'use client';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useState} from 'react';
import ThemeBootstrap from '@/features/theme/theme-bootstrap';
import ThemeProvider from '@/lib/theme/theme-provider';

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
      <ThemeProvider>
        <ThemeBootstrap />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}