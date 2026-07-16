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
 hasError: false
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
 <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-xl my-4">
 <h2 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h2>
 <p className="text-sm text-red-600 mb-4 text-center">
 The AI interface encountered an unexpected error. This has been logged for our team.
 </p>
 <button
 onClick={() => window.location.reload()}
 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
 >
 Reload Interface
 </button>
 </div>
 );
 }

 return this.props.children;
 }
}
