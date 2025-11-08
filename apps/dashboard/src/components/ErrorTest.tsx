'use client';

import { useState } from 'react';
import { useThrowError } from './ErrorBoundary';

/**
 * Error Test Component (Development Only)
 *
 * Provides buttons to test different error scenarios:
 * - Synchronous render errors
 * - Asynchronous errors
 * - Promise rejections
 * - Network errors
 *
 * Only renders in development mode.
 */
export function ErrorTest() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const throwError = useThrowError();

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  /**
   * Trigger synchronous error (caught by error boundary)
   */
  const triggerSyncError = () => {
    setShouldThrow(true);
  };

  /**
   * Trigger async error (caught by global error handler)
   */
  const triggerAsyncError = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    throw new Error('Test async error - This should be caught by GlobalErrorHandler');
  };

  /**
   * Trigger promise rejection (caught by global error handler)
   */
  const triggerPromiseRejection = () => {
    Promise.reject(new Error('Test promise rejection - This should show a toast notification'));
  };

  /**
   * Trigger network error simulation
   */
  const triggerNetworkError = async () => {
    try {
      await fetch('https://httpstat.us/500');
    } catch (error) {
      console.error('Network error (expected):', error);
    }
  };

  /**
   * Trigger error from hook
   */
  const triggerHookError = () => {
    throwError('Test error from hook - This should be caught by ErrorBoundary');
  };

  // Throw error if state is set
  if (shouldThrow) {
    throw new Error('Test synchronous error - This should be caught by ErrorBoundary');
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-center mb-3">
        <svg
          className="h-5 w-5 text-yellow-600 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <h3 className="text-sm font-bold text-yellow-800">
          Development Error Testing
        </h3>
      </div>

      <p className="text-xs text-yellow-700 mb-3">
        Test error boundaries and global error handling:
      </p>

      <div className="space-y-2">
        {/* Sync error button */}
        <button
          onClick={triggerSyncError}
          className="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 px-3 rounded transition-colors duration-200"
        >
          Throw Sync Error
        </button>

        {/* Hook error button */}
        <button
          onClick={triggerHookError}
          className="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 px-3 rounded transition-colors duration-200"
        >
          Throw Hook Error
        </button>

        {/* Async error button */}
        <button
          onClick={() => {
            triggerAsyncError().catch(() => {
              // Error will be caught by global handler
            });
          }}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 px-3 rounded transition-colors duration-200"
        >
          Throw Async Error
        </button>

        {/* Promise rejection button */}
        <button
          onClick={triggerPromiseRejection}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 px-3 rounded transition-colors duration-200"
        >
          Trigger Promise Rejection
        </button>

        {/* Network error button */}
        <button
          onClick={triggerNetworkError}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold py-2 px-3 rounded transition-colors duration-200"
        >
          Simulate Network Error
        </button>
      </div>

      <p className="text-xs text-yellow-600 mt-3 italic">
        This panel only appears in development mode.
      </p>
    </div>
  );
}

/**
 * Component that always throws an error (for testing)
 */
export function AlwaysThrows() {
  throw new Error('This component always throws an error');
  return null;
}

/**
 * Component that throws after a delay
 */
export function ThrowsAfterDelay({ delay = 2000 }: { delay?: number }) {
  const [shouldThrow, setShouldThrow] = useState(false);

  useState(() => {
    setTimeout(() => {
      setShouldThrow(true);
    }, delay);
  });

  if (shouldThrow) {
    throw new Error(`Error thrown after ${delay}ms delay`);
  }

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <p className="text-sm text-yellow-800">
        This component will throw an error in {delay}ms...
      </p>
    </div>
  );
}
