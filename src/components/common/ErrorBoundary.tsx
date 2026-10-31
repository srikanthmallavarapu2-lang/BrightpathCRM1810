import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled application error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleReload = () => {
    window.location.href = window.location.origin;
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            padding: '1.5rem',
          }}
          role="alert"
          aria-live="assertive"
        >
          <div
            className="card fade-in-slide"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)',
              border: '1px solid #fee2e2',
              background: '#ffffff',
            }}
          >
            {/* Warning Icon Node */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#dc2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                marginBottom: '0.5rem',
              }}
            >
              Something went wrong
            </h2>

            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                marginBottom: '1.75rem',
              }}
            >
              BrightPath CRM encountered an unexpected error while rendering this view. Your saved student data in Supabase remains safe.
            </p>

            {/* Action recovery buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
                marginBottom: '1.5rem',
              }}
            >
              <button
                onClick={this.handleReset}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', padding: '0.55rem 1.25rem', gap: '6px' }}
              >
                <RotateCcw size={15} />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleReload}
                className="btn btn-outline"
                style={{ fontSize: '0.875rem', padding: '0.55rem 1.25rem', gap: '6px' }}
              >
                <Home size={15} />
                <span>Return to Home</span>
              </button>
            </div>

            {/* Collapsible diagnostic details for developers */}
            {this.state.error && (
              <div style={{ textAlign: 'left', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <button
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600,
                    margin: '0 auto',
                  }}
                  aria-expanded={this.state.showDetails}
                >
                  <span>{this.state.showDetails ? 'Hide technical details' : 'Show technical diagnostics'}</span>
                  {this.state.showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {this.state.showDetails && (
                  <div
                    className="code-box"
                    style={{
                      marginTop: '0.75rem',
                      fontSize: '0.75rem',
                      maxHeight: '180px',
                      overflowY: 'auto',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#f87171', marginBottom: '4px' }}>
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <pre style={{ whiteSpace: 'pre-wrap', color: '#94a3b8' }}>
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
