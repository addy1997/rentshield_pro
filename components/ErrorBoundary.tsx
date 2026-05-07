import React from 'react';
import { NeuButton } from './ui';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[200px]">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <div>
            <p className="font-bold text-sm text-black dark:text-white">Something went wrong</p>
            <p className="text-xs text-gray-500 mt-1">Tap to retry</p>
          </div>
          <NeuButton variant="secondary" onClick={this.handleRetry} className="h-9 px-4 text-xs">
            Retry
          </NeuButton>
        </div>
      );
    }
    return this.props.children;
  }
}
