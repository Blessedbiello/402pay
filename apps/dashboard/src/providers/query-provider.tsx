'use client';

/**
 * React Query Provider for 402pay Dashboard
 *
 * Configures QueryClient with optimized defaults and provides
 * React Query DevTools in development mode.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { ApiClientError } from '@/lib/api-client';

/**
 * Default query configuration
 */
const defaultQueryConfig = {
  queries: {
    // Data remains fresh for 30 seconds
    staleTime: 1000 * 30,

    // Cached data expires after 5 minutes
    gcTime: 1000 * 60 * 5,

    // Retry failed requests
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof ApiClientError && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }

      // Retry up to 2 times for other errors
      return failureCount < 2;
    },

    // Retry delay with exponential backoff
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Refetch on window focus in production only
    refetchOnWindowFocus: process.env.NODE_ENV === 'production',

    // Don't refetch on mount if data is fresh
    refetchOnMount: false,

    // Refetch on network reconnect
    refetchOnReconnect: true,
  },
  mutations: {
    // Retry mutations once on network errors
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on 4xx errors
      if (error instanceof ApiClientError && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }

      // Retry once for network errors
      return failureCount < 1;
    },
  },
};

/**
 * Query Provider Props
 */
interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Query Provider Component
 *
 * Wraps the application with QueryClientProvider and provides
 * React Query DevTools in development.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient inside component to ensure it's unique per request (SSR)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: defaultQueryConfig,
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* Show DevTools in development only */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  );
}

/**
 * Create a standalone query client for server-side use
 * (e.g., in Server Components or API routes)
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: defaultQueryConfig,
  });
}
