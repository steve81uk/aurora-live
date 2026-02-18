import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-black text-white font-mono">
          <div className="max-w-2xl p-8 bg-red-900/20 border border-red-500 rounded-lg">
            <h1 className="text-3xl font-bold text-red-500 mb-4">⚠️ Application Error</h1>
            <p className="text-gray-300 mb-4">SKÖLL-TRACK encountered an error and couldn't render.</p>
            
            <div className="bg-black/50 p-4 rounded mb-4 overflow-auto max-h-64">
              <p className="text-red-400 font-bold mb-2">Error:</p>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {this.state.error?.toString()}
              </pre>
              
              {this.state.errorInfo && (
                <>
                  <p className="text-red-400 font-bold mt-4 mb-2">Component Stack:</p>
                  <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
