import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '2rem',
                    maxWidth: '800px',
                    margin: '2rem auto',
                    textAlign: 'center',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    <h1 style={{ color: '#d32f2f', marginBottom: '1rem' }}>
                        Something went wrong
                    </h1>
                    <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                        We encountered an error while loading the philosophy explorer.
                        Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '500'
                        }}
                    >
                        Reload Page
                    </button>
                    {import.meta.env.DEV && this.state.error && (
                        <details style={{
                            marginTop: '2rem',
                            textAlign: 'left',
                            backgroundColor: '#f5f5f5',
                            padding: '1rem',
                            borderRadius: '4px'
                        }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                Error Details (Development Only)
                            </summary>
                            <pre style={{
                                fontSize: '0.875rem',
                                overflow: 'auto',
                                color: '#d32f2f'
                            }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
