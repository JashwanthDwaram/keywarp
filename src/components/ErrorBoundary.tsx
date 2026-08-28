import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('KeyWarp Uncaught Render Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('keywarp_discovery_completed');
      localStorage.removeItem('typepulse_discovery_completed');
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg text-ink-100 flex flex-col items-center justify-center p-6 font-sans select-none">
          <div className="max-w-md w-full rounded-xl border border-accent/40 bg-surface p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center text-accent mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-ink-100">Display Recovery</h2>
              <p className="text-xs text-ink-400 font-normal">
                An unexpected state occurred while rendering this session view.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded bg-bg/90 border border-ink-400/15 text-left font-mono text-[11px] text-incorrect max-h-32 overflow-y-auto break-all">
                {this.state.error.toString()}
              </div>
            )}

            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-2 px-4 rounded-lg bg-accent text-accent-contrast text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Arena & Reload</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
