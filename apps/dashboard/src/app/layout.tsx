import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GlobalErrorHandler } from '@/components/GlobalErrorHandler';

export const metadata: Metadata = {
  title: '402pay Dashboard',
  description: 'Unified payment infrastructure for x402 on Solana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        {/*
          Root Error Boundary - Catches all errors in the app
          Must wrap everything except QueryProvider (which has its own error handling)
        */}
        <ErrorBoundary level="root">
          <QueryProvider>
            {/*
              Global Error Handler - Catches async errors, promise rejections,
              and React Query errors
            */}
            <GlobalErrorHandler />

            {/* Main application content */}
            {children}
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
