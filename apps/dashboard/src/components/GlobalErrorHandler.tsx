'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Error notification data
 */
interface ErrorNotification {
  id: string;
  message: string;
  timestamp: number;
  type: 'error' | 'warning';
  source: 'unhandledrejection' | 'error' | 'react-query';
}

/**
 * Global Error Handler Component
 *
 * Handles global errors that occur outside of React's error boundaries:
 * - Unhandled promise rejections
 * - Window error events
 * - React Query global errors
 *
 * Features:
 * - Catches background/async errors
 * - Shows toast notifications for errors
 * - Logs errors for monitoring
 * - Doesn't block user interaction
 * - Auto-dismisses after timeout
 *
 * Usage:
 * ```tsx
 * <GlobalErrorHandler />
 * ```
 */
export function GlobalErrorHandler() {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    /**
     * Handle unhandled promise rejections
     */
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault(); // Prevent default browser error handling

      const error = event.reason;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Log error
      console.error('Unhandled Promise Rejection:', {
        reason: error,
        promise: event.promise,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      });

      // Show notification
      addNotification({
        message: `Background Error: ${errorMessage}`,
        type: 'error',
        source: 'unhandledrejection',
      });

      // TODO: Send to error tracking service
    };

    /**
     * Handle global window errors
     */
    const handleError = (event: ErrorEvent) => {
      event.preventDefault(); // Prevent default browser error handling

      const { message, filename, lineno, colno, error } = event;

      // Log error
      console.error('Global Window Error:', {
        message,
        filename,
        lineno,
        colno,
        error,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      });

      // Show notification
      addNotification({
        message: `Error: ${message}`,
        type: 'error',
        source: 'error',
      });

      // TODO: Send to error tracking service
    };

    /**
     * React Query global error handler
     */
    const handleQueryError = (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Log error
      console.error('React Query Global Error:', {
        error,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      });

      // Show notification (less severe for query errors)
      addNotification({
        message: `Failed to load data: ${errorMessage}`,
        type: 'warning',
        source: 'react-query',
      });

      // TODO: Send to error tracking service
    };

    /**
     * Add error notification
     */
    const addNotification = (
      notification: Omit<ErrorNotification, 'id' | 'timestamp'>
    ) => {
      const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newNotification: ErrorNotification = {
        ...notification,
        id,
        timestamp: Date.now(),
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        dismissNotification(id);
      }, 10000);
    };

    /**
     * Dismiss notification
     */
    const dismissNotification = (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    // Register global error handlers
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Register React Query global error handler
    queryClient.getQueryCache().config.onError = handleQueryError;
    queryClient.getMutationCache().config.onError = handleQueryError;

    // Cleanup on unmount
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      queryClient.getQueryCache().config.onError = undefined;
      queryClient.getMutationCache().config.onError = undefined;
    };
  }, [queryClient]);

  /**
   * Dismiss notification manually
   */
  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Don't render anything if no notifications
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full pointer-events-none"
      role="region"
      aria-label="Error notifications"
      aria-live="polite"
    >
      {notifications.map((notification) => (
        <ErrorNotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissNotification(notification.id)}
        />
      ))}
    </div>
  );
}

/**
 * Error notification toast component
 */
function ErrorNotificationToast({
  notification,
  onDismiss,
}: {
  notification: ErrorNotification;
  onDismiss: () => void;
}) {
  const isError = notification.type === 'error';

  return (
    <div
      className="pointer-events-auto bg-white rounded-lg shadow-lg border-l-4 overflow-hidden transition-all duration-300 animate-slide-in-right"
      style={{
        borderLeftColor: isError ? '#EF4444' : '#F59E0B',
      }}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className="flex-shrink-0">
            {isError ? (
              <svg
                className="h-6 w-6 text-red-500"
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
            ) : (
              <svg
                className="h-6 w-6 text-yellow-500"
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
            )}
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              {isError ? 'Error' : 'Warning'}
            </h3>
            <p className="mt-1 text-sm text-gray-600 line-clamp-3">
              {notification.message}
            </p>

            {/* Source label (development only) */}
            {process.env.NODE_ENV === 'development' && (
              <p className="mt-1 text-xs text-gray-400">
                Source: {notification.source}
              </p>
            )}
          </div>

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss notification"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full transition-all duration-[10000ms] ease-linear"
          style={{
            width: '0%',
            backgroundColor: isError ? '#EF4444' : '#F59E0B',
            animation: 'progress 10s linear forwards',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

/**
 * Hook to manually trigger error notifications
 */
export function useErrorNotification() {
  return {
    showError: (message: string) => {
      // Trigger a custom event that the GlobalErrorHandler will catch
      window.dispatchEvent(
        new CustomEvent('app-error', {
          detail: { message, type: 'error' },
        })
      );
    },
    showWarning: (message: string) => {
      window.dispatchEvent(
        new CustomEvent('app-error', {
          detail: { message, type: 'warning' },
        })
      );
    },
  };
}
