import { Component, type ReactNode } from 'react';
import { Button } from './ui/Button';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('UI error boundary:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h1>
          <p className="text-sm text-slate-600 mb-6 max-w-sm">
            Please refresh the page. If the problem continues, contact CareerJob on WhatsApp.
          </p>
          <Button onClick={() => window.location.assign('/')}>Go home</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
