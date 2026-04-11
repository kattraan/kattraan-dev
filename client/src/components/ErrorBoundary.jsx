import React from 'react';
import { logger } from '@/utils/logger';

/**
 * Root-level error boundary. Catches React render/commit errors in the tree below,
 * logs them, and shows a fallback UI with retry. Does not affect routing.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryKey: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught an error', error, errorInfo?.componentStack);
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryKey: prev.retryKey + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen bg-gray-50 dark:bg-[#0c091a] flex flex-col items-center justify-center text-gray-900 dark:text-white p-8 transition-colors duration-300"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-red-500 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
            <p className="text-gray-600 dark:text-white/60 text-sm">
              An unexpected error occurred. You can try again or refresh the page.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-6 py-3 rounded-xl bg-primary-purple hover:bg-indigo-600 text-white font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-purple focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-[#0c091a]"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return <React.Fragment key={this.state.retryKey}>{this.props.children}</React.Fragment>;
  }
}

export default ErrorBoundary;
