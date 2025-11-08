# Error Handling Documentation

## Overview

The 402pay Dashboard implements comprehensive error boundaries and global error handling to ensure a robust user experience. This document describes the error handling architecture, components, and best practices.

## Architecture

### Error Handling Layers

```
┌─────────────────────────────────────────────────┐
│          Root Error Boundary (App-level)        │
│  - Catches all React component errors           │
│  - Full-screen error UI                         │
│  - Provides recovery mechanisms                 │
└─────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼──────────┐          ┌────────▼─────────┐
│ Page Error       │          │ Global Error     │
│ Boundary         │          │ Handler          │
│ - Page-level     │          │ - Async errors   │
│ - Less severe UI │          │ - Promise rejects│
│ - In-page errors │          │ - React Query    │
└──────────────────┘          └──────────────────┘
```

## Components

### 1. ErrorBoundary

**Location:** `/home/bprime/Hackathons/402pay/apps/dashboard/src/components/ErrorBoundary.tsx`

**Purpose:** Root-level error boundary that catches all React component errors.

**Features:**
- Catches errors during rendering, in lifecycle methods, and in constructors
- Full-screen error UI with gradient design
- Different UI for development vs production
- Error logging with structured data
- Recovery mechanisms (reset, go home, report issue, reload)
- Integration-ready for error tracking services

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary level="root">
  <App />
</ErrorBoundary>
```

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'root' | 'page' | 'section';
}
```

**Custom Fallback Example:**
```tsx
<ErrorBoundary
  level="section"
  fallback={(error, errorInfo, reset) => (
    <div>
      <h2>Section Error: {error.message}</h2>
      <button onClick={reset}>Try Again</button>
    </div>
  )}
>
  <CriticalSection />
</ErrorBoundary>
```

### 2. PageErrorBoundary

**Location:** `/home/bprime/Hackathons/402pay/apps/dashboard/src/components/PageErrorBoundary.tsx`

**Purpose:** Page-level error boundary that isolates errors to specific pages without crashing the entire app.

**Features:**
- Less severe UI than root error boundary
- Maintains app navigation (sidebar, header)
- In-page error display
- Quick navigation to safe pages
- Page-specific error context

**Usage:**
```tsx
import { PageErrorBoundary } from '@/components/PageErrorBoundary';

function TransactionsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <PageErrorBoundary pageName="Transactions">
          <TransactionsContent />
        </PageErrorBoundary>
      </main>
    </div>
  );
}
```

**When to Use:**
- Wrap individual page content
- Protect critical sections
- When you want to maintain navigation during errors
- For better error isolation

### 3. GlobalErrorHandler

**Location:** `/home/bprime/Hackathons/402pay/apps/dashboard/src/components/GlobalErrorHandler.tsx`

**Purpose:** Catches errors that occur outside React's error boundaries.

**Features:**
- Handles unhandled promise rejections
- Handles window error events
- React Query global error handling
- Toast notifications for background errors
- Auto-dismiss after timeout
- Non-blocking UI

**Catches:**
- Unhandled promise rejections
- Window errors
- React Query errors
- Async/await errors
- Network errors

**Usage:**
```tsx
import { GlobalErrorHandler } from '@/components/GlobalErrorHandler';

<GlobalErrorHandler />
```

**Manual Error Notifications:**
```tsx
import { useErrorNotification } from '@/components/GlobalErrorHandler';

function MyComponent() {
  const { showError, showWarning } = useErrorNotification();

  const handleAction = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      showError('Operation failed: ' + error.message);
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

### 4. ErrorTest Component

**Location:** `/home/bprime/Hackathons/402pay/apps/dashboard/src/components/ErrorTest.tsx`

**Purpose:** Development-only component for testing error boundaries.

**Features:**
- Only renders in development mode
- Buttons to trigger different error types
- Visual feedback panel
- Testing utilities

**Available Test Scenarios:**
1. **Synchronous Error** - Caught by ErrorBoundary
2. **Hook Error** - Caught by ErrorBoundary
3. **Async Error** - Caught by GlobalErrorHandler
4. **Promise Rejection** - Caught by GlobalErrorHandler
5. **Network Error** - Tests network error handling

## Error Types and Handling

### Errors Caught by Error Boundaries

Error boundaries catch errors during:
- ✅ Rendering
- ✅ Lifecycle methods
- ✅ Constructors of child components

Example:
```tsx
function BrokenComponent() {
  // This will be caught by error boundary
  throw new Error('Component error');
}
```

### Errors NOT Caught by Error Boundaries

Error boundaries do NOT catch:
- ❌ Event handlers (use try-catch)
- ❌ Asynchronous code (use promise catches)
- ❌ Server-side rendering
- ❌ Errors in error boundary itself

**Event Handler Example:**
```tsx
function MyComponent() {
  const handleClick = () => {
    try {
      // Risky operation
      riskyOperation();
    } catch (error) {
      console.error('Error:', error);
      // Or use error notification
    }
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

**Async Example:**
```tsx
function MyComponent() {
  const fetchData = async () => {
    try {
      const data = await fetch('/api/data');
      return data.json();
    } catch (error) {
      console.error('Fetch error:', error);
      // This will be caught by GlobalErrorHandler
      throw error;
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

## Integration with React Query

React Query has built-in error handling. The GlobalErrorHandler integrates with it:

```tsx
// In query-provider.tsx
const defaultQueryConfig = {
  queries: {
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on 4xx errors
      if (error instanceof ApiClientError &&
          error.statusCode >= 400 &&
          error.statusCode < 500) {
        return false;
      }
      return failureCount < 2;
    },
  },
};

// GlobalErrorHandler automatically logs React Query errors
queryClient.getQueryCache().config.onError = handleQueryError;
```

## Error Logging

### Development Mode

In development, errors are logged with full details:
- Error message
- Stack trace
- Component stack
- Error details object
- Console groups for organization

### Production Mode

In production, errors are logged with structured data ready for error tracking services:

```typescript
interface ErrorLogDetails {
  message: string;
  stack?: string;
  componentStack: string;
  timestamp: string;
  userAgent: string;
  url: string;
  level: string;
}
```

### Integration with Error Tracking Services

To integrate with Sentry, LogRocket, or other services:

**In ErrorBoundary.tsx:**
```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  // ...existing code...

  // Add your error tracking service
  if (typeof window !== 'undefined' && window.Sentry) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: this.props.level || 'root',
      },
    });
  }
}
```

**In GlobalErrorHandler.tsx:**
```typescript
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  // ...existing code...

  // Add your error tracking service
  if (typeof window !== 'undefined' && window.Sentry) {
    Sentry.captureException(event.reason);
  }
};
```

## Recovery Strategies

### 1. Reset Error Boundary

Attempts to re-render the failed component tree:

```typescript
resetErrorBoundary = (): void => {
  this.setState({
    hasError: false,
    error: null,
    errorInfo: null,
  });
};
```

**When to use:** Component errors that might be transient.

### 2. Navigate Away

Navigate to a safe page (home/dashboard):

```typescript
goHome = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};
```

**When to use:** Page-specific errors, data corruption.

### 3. Reload Page

Full page reload as last resort:

```typescript
reloadPage = (): void => {
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};
```

**When to use:** Severe errors, state corruption.

### 4. Report Issue

Links to GitHub issues for user reporting:

```typescript
reportIssue = (): void => {
  const issueUrl = `https://github.com/402pay/402pay/issues/new?title=${title}&body=${body}`;
  window.open(issueUrl, '_blank');
};
```

**When to use:** Production errors that need investigation.

## Best Practices

### 1. Error Boundary Placement

```tsx
// ✅ Good: Root level for app-wide errors
<ErrorBoundary level="root">
  <QueryProvider>
    <App />
  </QueryProvider>
</ErrorBoundary>

// ✅ Good: Page level for isolation
<PageErrorBoundary pageName="Dashboard">
  <DashboardContent />
</PageErrorBoundary>

// ⚠️ Caution: Don't wrap QueryProvider in error boundary
// QueryProvider has its own error handling
<ErrorBoundary>
  <QueryProvider>  {/* Don't do this */}
    <App />
  </QueryProvider>
</ErrorBoundary>
```

### 2. Event Handler Errors

```tsx
// ❌ Bad: Error not caught
function MyComponent() {
  const handleClick = () => {
    throw new Error('Not caught by error boundary');
  };

  return <button onClick={handleClick}>Click</button>;
}

// ✅ Good: Try-catch in event handler
function MyComponent() {
  const handleClick = () => {
    try {
      riskyOperation();
    } catch (error) {
      console.error('Error:', error);
      // Or show notification
    }
  };

  return <button onClick={handleClick}>Click</button>;
}
```

### 3. Async Error Handling

```tsx
// ❌ Bad: Unhandled promise rejection
function MyComponent() {
  const fetchData = async () => {
    const data = await fetch('/api/data'); // Might fail
    return data.json();
  };

  return <button onClick={fetchData}>Fetch</button>;
}

// ✅ Good: Proper error handling
function MyComponent() {
  const fetchData = async () => {
    try {
      const data = await fetch('/api/data');
      return data.json();
    } catch (error) {
      console.error('Fetch error:', error);
      // GlobalErrorHandler will show toast
      throw error;
    }
  };

  return <button onClick={() => fetchData().catch(console.error)}>
    Fetch
  </button>;
}
```

### 4. React Query Error Handling

```tsx
// ✅ Good: Use React Query's error handling
function MyComponent() {
  const { data, error, isError, refetch } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });

  if (isError) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  return <div>{data}</div>;
}
```

## Testing

### Manual Testing

1. **Start development server:**
```bash
cd apps/dashboard
npm run dev
```

2. **Test error boundaries:**
   - Look for the yellow "Development Error Testing" panel in bottom-left
   - Click "Throw Sync Error" - Should show ErrorBoundary UI
   - Click "Throw Hook Error" - Should show ErrorBoundary UI
   - Click "Throw Async Error" - Should show toast notification
   - Click "Trigger Promise Rejection" - Should show toast notification

3. **Test recovery:**
   - Trigger an error
   - Click "Try Again" - Should reset and re-render
   - Click "Go Home" - Should navigate to dashboard
   - Click "Reload Page" - Should reload page

### Automated Testing

```typescript
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function ThrowError() {
  throw new Error('Test error');
}

test('ErrorBoundary catches errors', () => {
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/application error/i)).toBeInTheDocument();
});
```

## Troubleshooting

### Error boundary not catching errors

**Problem:** Errors not being caught by error boundary.

**Solutions:**
1. Check if error occurs in event handler (use try-catch)
2. Check if error is async (will be caught by GlobalErrorHandler)
3. Verify error boundary is properly placed in component tree
4. Check browser console for uncaught errors

### GlobalErrorHandler not showing toasts

**Problem:** Toast notifications not appearing for async errors.

**Solutions:**
1. Verify GlobalErrorHandler is mounted
2. Check browser console for errors
3. Verify error is actually being thrown
4. Check z-index conflicts

### Errors still crashing the app

**Problem:** App crashes despite error boundaries.

**Solutions:**
1. Check if error occurs during SSR (error boundaries only work client-side)
2. Verify error boundary is at root level
3. Check for errors in error boundary itself
4. Verify QueryProvider is inside error boundary

## Future Enhancements

1. **Error Tracking Integration:**
   - Sentry setup
   - LogRocket integration
   - Custom error reporting API

2. **Advanced Recovery:**
   - Retry with exponential backoff
   - Partial state recovery
   - Optimistic UI rollback

3. **Analytics:**
   - Error frequency tracking
   - User impact analysis
   - Error pattern detection

4. **User Feedback:**
   - Error report form
   - Screenshot capture
   - Session replay integration

## File Locations

All error handling components are located in:

```
/home/bprime/Hackathons/402pay/apps/dashboard/src/components/
├── ErrorBoundary.tsx        # Root error boundary
├── PageErrorBoundary.tsx    # Page-level error boundary
├── GlobalErrorHandler.tsx   # Global async error handler
└── ErrorTest.tsx            # Development testing component
```

Layout integration:
```
/home/bprime/Hackathons/402pay/apps/dashboard/src/app/layout.tsx
```

## Support

For issues or questions about error handling:
1. Check this documentation
2. Test with ErrorTest component in development
3. Check browser console for error details
4. Review component stack traces
5. Report issues via GitHub with error details
