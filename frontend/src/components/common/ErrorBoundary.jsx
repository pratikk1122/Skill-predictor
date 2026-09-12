import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/student';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.handleReset,
        });
      }

      return (
        <div className="min-h-[500px] w-full flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-rose-200 dark:border-rose-900/50 p-8 sm:p-10 shadow-2xl text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto mb-6 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <span className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest text-rose-500 block mb-2">
              RUNTIME EXCEPTION CAUGHT
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">
              Something went unexpectedly wrong
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mb-8 leading-relaxed">
              Our safety boundary intercepted this issue to keep your session secure. You can reload this component or return to the dashboard.
            </p>

            {/* Error message snippet (collapsed/safe) */}
            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-left font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate">
                <span className="text-rose-500 font-bold">Error:</span> {this.state.error.message}
              </div>
            )}

            {/* Recovery Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <RefreshCw size={16} />
                <span>Try Again</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Home size={16} />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
