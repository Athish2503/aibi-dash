import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{
          margin: '32px 0',
          borderColor: 'var(--danger-border)',
          background: 'var(--danger-bg)',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="#f87171">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f87171' }}>
              Interface Rendering Error
            </h3>
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: '14px' }}>
            {this.state.error?.message || 'An unexpected rendering error occurred while loading this view.'}
          </p>
          {this.state.errorInfo && (
            <pre style={{
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-default)',
              padding: '12px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              maxHeight: '160px',
              overflowY: 'auto',
              marginBottom: '16px',
            }}>
              {this.state.errorInfo.componentStack}
            </pre>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={this.handleReset}
            style={{ fontSize: '0.8125rem' }}
          >
            Reset View & Continue
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
