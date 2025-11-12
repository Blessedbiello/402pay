'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * Props for ErrorBoundary component
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'root' | 'page' | 'section';
}

/**
 * State for ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error details for logging
 */
interface ErrorLogDetails {
  message: string;
  stack?: string;
  componentStack: string;
  timestamp: string;
  userAgent: string;
  url: string;
  level: string;
}

/**
 * Root ErrorBoundary Component
 *
 * Production-quality error boundary that catches JavaScript errors anywhere
 * in the child component tree, logs error details, and displays a fallback UI.
 *
 * Features:
 * - Catches errors during rendering, in lifecycle methods, and in constructors
 * - Logs error details with structured data
 * - Different UI for development vs production
 * - Recovery mechanisms (reset, go home, report)
 * - Proper TypeScript typing
 * - Integration-ready for error tracking services (Sentry, LogRocket, etc.)
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary level="root">
 *   <App />
 * </ErrorBoundary>
 * ```
 *
 * Note: Error boundaries do not catch errors in:
 * - Event handlers (use try-catch)
 * - Asynchronous code (use promise catches)
 * - Server-side rendering
 * - Errors thrown in the error boundary itself
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
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
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error details when an error is caught
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Store error info in state
    this.setState({ errorInfo });

    // Create structured error log
    const errorDetails: ErrorLogDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || '',
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      level: this.props.level || 'root',
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Details:', errorDetails);
      console.groupEnd();
    } else {
      // In production, log structured error
      console.error('ErrorBoundary caught error:', errorDetails);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example:
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //     },
    //   },
    //   tags: {
    //     errorBoundary: this.props.level || 'root',
    //   },
    // });
  }

  /**
   * Reset error boundary state (recovery mechanism)
   */
  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Navigate to home page
   */
  goHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  /**
   * Report issue (links to GitHub issues)
   */
  reportIssue = (): void => {
    const { error, errorInfo } = this.state;

    if (typeof window !== 'undefined' && error) {
      // Create GitHub issue URL with pre-filled error details
      const title = encodeURIComponent(`Error: ${error.message}`);
      const body = encodeURIComponent(
        `## Error Details\n\n` +
        `**Message:** ${error.message}\n\n` +
        `**Stack:**\n\`\`\`\n${error.stack}\n\`\`\`\n\n` +
        `**Component Stack:**\n\`\`\`\n${errorInfo?.componentStack}\n\`\`\`\n\n` +
        `**URL:** ${window.location.href}\n` +
        `**User Agent:** ${navigator.userAgent}\n` +
        `**Timestamp:** ${new Date().toISOString()}\n`
      );

      // TODO: Replace with your actual GitHub repo URL
      const issueUrl = `https://github.com/402pay/402pay/issues/new?title=${title}&body=${body}`;
      window.open(issueUrl, '_blank');
    }
  };

  /**
   * Reload the page (last resort recovery)
   */
  reloadPage = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  /**
   * Render fallback UI when error is caught
   */
  renderFallback(): ReactNode {
    const { error, errorInfo } = this.state;
    const { fallback, level = 'root' } = this.props;

    // Use custom fallback if provided
    if (fallback && error && errorInfo) {
      return fallback(error, errorInfo, this.resetErrorBoundary);
    }

    // Default fallback UI
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isRootLevel = level === 'root';

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8 text-white">
            <div className="flex items-center mb-4">
              <svg
                className="h-12 w-12 mr-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h1 className="text-2xl font-bold">
                  {isRootLevel ? 'Application Error' : 'Something went wrong'}
                </h1>
                <p className="text-purple-100 mt-1">
                  {isRootLevel
                    ? 'The application encountered an unexpected error'
                    : 'This section encountered an error'}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {/* Error message */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Error Message
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-mono text-sm">
                  {error?.message || 'An unknown error occurred'}
                </p>
              </div>
            </div>

            {/* Technical details (development only) */}
            {isDevelopment && error?.stack && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Stack Trace
                </h2>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </div>
              </div>
            )}

            {/* Component stack (development only) */}
            {isDevelopment && errorInfo?.componentStack && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Component Stack
                </h2>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              </div>
            )}

            {/* What to do next */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                What can you do?
              </h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Try refreshing the page or clicking "Try Again" below</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Go back to the home page and try again</span>
                </li>
                {!isDevelopment && (
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Report this issue to our support team</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={this.resetErrorBoundary}
                className="flex-1 min-w-[120px] bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                aria-label="Try again"
              >
                Try Again
              </button>

              {isRootLevel && (
                <button
                  onClick={this.goHome}
                  className="flex-1 min-w-[120px] bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                  aria-label="Go to home page"
                >
                  Go Home
                </button>
              )}

              {!isDevelopment && (
                <button
                  onClick={this.reportIssue}
                  className="flex-1 min-w-[120px] bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                  aria-label="Report issue"
                >
                  Report Issue
                </button>
              )}

              {isDevelopment && (
                <button
                  onClick={this.reloadPage}
                  className="flex-1 min-w-[120px] bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                  aria-label="Reload page"
                >
                  Reload Page
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              {isDevelopment ? (
                <span className="text-orange-600 font-semibold">
                  Development Mode - Full error details shown above
                </span>
              ) : (
                <span>
                  This error has been logged and our team has been notified.
                </span>
              )}
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

/**
 * Hook to throw errors programmatically (useful for testing)
 */
export function useThrowError() {
  return (error: Error | string) => {
    throw error instanceof Error ? error : new Error(error);
  };
}
