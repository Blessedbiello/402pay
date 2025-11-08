import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';

/**
 * Props for PageErrorBoundary component
 */
interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

/**
 * State for PageErrorBoundary component
 */
interface PageErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Page-level Error Boundary Component
 *
 * Specialized error boundary for page-level errors that doesn't crash
 * the entire application. Shows error within the page layout while
 * maintaining the sidebar and header.
 *
 * Features:
 * - Less severe UI than root error boundary
 * - Maintains app navigation (sidebar, header)
 * - Allows navigation back to home
 * - Page-specific error handling
 * - Proper recovery mechanisms
 *
 * Usage:
 * ```tsx
 * <PageErrorBoundary pageName="Dashboard">
 *   <DashboardContent />
 * </PageErrorBoundary>
 * ```
 */
export class PageErrorBoundary extends Component<
  PageErrorBoundaryProps,
  PageErrorBoundaryState
> {
  constructor(props: PageErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<PageErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error details when an error is caught
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error details
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      page: this.props.pageName || 'Unknown page',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Page Error Boundary - ${this.props.pageName || 'Page'}`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Details:', errorDetails);
      console.groupEnd();
    } else {
      console.error('PageErrorBoundary caught error:', errorDetails);
    }

    // TODO: Send to error tracking service
  }

  /**
   * Reset error boundary state
   */
  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Render fallback UI when error is caught
   */
  renderFallback(): ReactNode {
    const { error, errorInfo } = this.state;
    const { fallback, pageName = 'Page' } = this.props;

    // Use custom fallback if provided
    if (fallback && error) {
      return fallback(error, this.resetErrorBoundary);
    }

    // Default fallback UI (less severe than root error boundary)
    const isDevelopment = process.env.NODE_ENV === 'development';

    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-2xl w-full">
          {/* Error card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-6 text-white">
              <div className="flex items-center">
                <svg
                  className="h-10 w-10 mr-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h2 className="text-xl font-bold">
                    {pageName} Error
                  </h2>
                  <p className="text-red-100 text-sm mt-1">
                    This page encountered an error while loading
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {/* Error message */}
              <div className="mb-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-red-800">
                        Error Message
                      </h3>
                      <p className="mt-2 text-sm text-red-700 font-mono">
                        {error?.message || 'An unknown error occurred'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical details (development only) */}
              {isDevelopment && (
                <>
                  {error?.stack && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Stack Trace (Development Only)
                      </h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto max-h-48">
                        <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                          {error.stack}
                        </pre>
                      </div>
                    </div>
                  )}

                  {errorInfo?.componentStack && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Component Stack (Development Only)
                      </h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto max-h-48">
                        <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Suggestions */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  What can you do?
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm text-gray-600">
                    <svg
                      className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Try reloading this page using the button below</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <svg
                      className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Navigate to a different page using the sidebar</span>
                  </li>
                  <li className="flex items-start text-sm text-gray-600">
                    <svg
                      className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Return to the dashboard home page</span>
                  </li>
                  {!isDevelopment && (
                    <li className="flex items-start text-sm text-gray-600">
                      <svg
                        className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>If the problem persists, contact our support team</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={this.resetErrorBoundary}
                  className="flex-1 min-w-[140px] bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  aria-label="Try again"
                >
                  Reload Page
                </button>

                <Link
                  href="/"
                  className="flex-1 min-w-[140px] bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 text-center"
                  aria-label="Go to dashboard"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>

            {/* Footer */}
            {!isDevelopment && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  Error ID: {Date.now().toString(36).toUpperCase()} • This error has been logged
                </p>
              </div>
            )}
          </div>

          {/* Additional help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              The rest of your dashboard is still available. You can navigate using the sidebar on the left.
            </p>
          </div>
        </div>
      </div>
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}
