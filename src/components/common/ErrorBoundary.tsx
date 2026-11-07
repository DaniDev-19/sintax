import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorScreen } from './ErrorScreen';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error('Sintax ErrorBoundary intercepted exception:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const details = `${this.state.error?.name || 'Error'}: ${this.state.error?.message || 'Excepción no controlada'}\n\nStack:\n${this.state.errorInfo?.componentStack || this.state.error?.stack || 'No stack trace available'}`;

      return (
        <ErrorScreen
          code={500}
          title="Falla de Renderizado en la Aplicación"
          description="Se ha producido un error inesperado al renderizar la interfaz. Los datos han sido aislados para evitar pérdidas."
          details={details}
          onRetry={this.handleReset}
          onGoHome={() => {
            this.setState({ hasError: false, error: null, errorInfo: null });
            window.location.href = '/';
          }}
        />
      );
    }

    return this.props.children;
  }
}
