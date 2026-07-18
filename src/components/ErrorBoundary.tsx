'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="my-4 flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8">
          <h2 className="mb-2 text-xl font-semibold text-red-800">Something went wrong</h2>
          <p className="mb-4 text-center text-sm text-red-600">
            The AI interface encountered an unexpected error. This has been logged for our team.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
          >
            Reload Interface
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
