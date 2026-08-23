import React, { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('VIREON RUNTIME ERROR:', error);
    console.error('VIREON ERROR INFO:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;

      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#080B14',
            color: '#fff',
            padding: '40px 20px',
            fontFamily: 'Arial, sans-serif',
            direction: 'rtl',
          }}
        >
          <div
            style={{
              maxWidth: '900px',
              margin: '0 auto',
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <h1
              style={{
                color: '#f87171',
                marginBottom: '16px',
              }}
            >
              VIREON — خطأ في تشغيل التطبيق
            </h1>

            <p style={{ color: '#d1d5db' }}>
              الموقع تم تحميله، ولكن حدث خطأ داخل تطبيق React.
            </p>

            <pre
              style={{
                marginTop: '20px',
                padding: '16px',
                background: '#030712',
                borderRadius: '10px',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                direction: 'ltr',
                textAlign: 'left',
                color: '#fca5a5',
              }}
            >
              {error?.stack || error?.message || String(error)}
            </pre>

            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: '#7c3aed',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              إعادة تحميل VIREON
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('VIREON: لم يتم العثور على عنصر #root في index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
