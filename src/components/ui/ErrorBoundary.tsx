import { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TENFLOW Uncaught Exception caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-midnight-deep text-paper-primary flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-2xl bg-midnight-panel border border-status-risk/40 shadow-risk-glow text-center space-y-5">
            <div className="inline-flex p-3 rounded-xl bg-status-risk/15 text-status-risk border border-status-risk/30">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold font-display text-paper-primary">
                Telemetry Circuit Interrupted
              </h1>
              <p className="text-xs text-paper-secondary">
                TENFLOW encountered an unexpected rendering error. Your financial data is safely persisted in local browser storage.
              </p>
            </div>

            {this.state.error && (
              <pre className="p-3 bg-midnight-deep rounded-lg text-[11px] font-mono text-status-risk/90 overflow-x-auto text-left max-h-32 border border-midnight-border">
                {this.state.error.message}
              </pre>
            )}

            <Button
              variant="primary"
              className="w-full justify-center"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={this.handleReset}
            >
              Restart Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
