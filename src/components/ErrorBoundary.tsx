import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-rose/10 dark:bg-rose/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-rose" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-plum dark:text-lavender">Something went wrong</h2>
                <p className="text-sm text-plum/70 dark:text-lavender/70">We're sorry for the inconvenience</p>
              </div>
            </div>
            <p className="text-plum/80 dark:text-lavender/80 mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-plum dark:bg-lavender text-white py-3 rounded-xl font-medium hover:bg-plum-dark dark:hover:bg-lavender-dark transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
