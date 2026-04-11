import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-8">
          <div className="w-20 h-20 bg-destructive/10 border border-destructive/30 flex items-center justify-center relative">
            <AlertTriangle className="w-10 h-10 text-destructive" />
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-destructive/50" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-destructive/50" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tighter uppercase text-foreground">System Breach Detected</h2>
            <p className="text-sm text-muted-foreground uppercase tracking-widest max-w-md mx-auto">
              An unexpected runtime exception has occurred. Protocol integrity may be compromised.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-12 px-8 font-bold uppercase tracking-widest text-[10px]"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Re-initialize System
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="border-border hover:bg-secondary text-foreground rounded-none h-12 px-8 font-bold uppercase tracking-widest text-[10px]"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Base
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 p-4 bg-secondary border border-border text-left text-[10px] font-mono overflow-auto max-w-full text-muted-foreground">
              {error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return children;
  }
}
