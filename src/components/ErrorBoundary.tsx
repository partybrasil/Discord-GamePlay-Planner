import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong</h1>
          <p className="text-gray-300 mb-4">The application crashed attempting to start.</p>
          <div className="bg-slate-800 p-4 rounded text-left font-mono text-sm text-red-300 overflow-auto max-w-full max-h-96 border border-red-900/50">
            {this.state.error?.toString()}
          </div>
          <button 
            className="mt-8 px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
