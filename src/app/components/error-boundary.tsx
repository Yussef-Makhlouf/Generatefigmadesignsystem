import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { useNavigate } from "react-router";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="p-8 text-center border-destructive/50">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold mb-2">حدث خطأ ما</h1>
          <p className="text-muted-foreground mb-6">
            عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
          </p>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === "development" && error && (
            <details className="mb-6 text-right">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-2">
                تفاصيل الخطأ (للمطورين)
              </summary>
              <Card className="p-4 bg-muted text-xs font-mono text-left overflow-auto max-h-40">
                <pre className="whitespace-pre-wrap break-words">
                  {error.toString()}
                  {error.stack}
                </pre>
              </Card>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onReset}
              className="flex-1 rounded-xl"
              variant="default"
            >
              <RefreshCcw className="h-4 w-4 ml-2" />
              إعادة المحاولة
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="flex-1 rounded-xl"
              variant="outline"
            >
              <Home className="h-4 w-4 ml-2" />
              العودة للرئيسية
            </Button>
          </div>

          {/* Help Link */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              إذا استمرت المشكلة،{" "}
              <button
                onClick={() => navigate("/help")}
                className="text-primary hover:underline font-semibold"
              >
                تواصل مع الدعم
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
