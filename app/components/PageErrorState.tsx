import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface PageErrorStateProps {
  title?: string;
  message?: string;
  backTo?: string;
  backLabel?: string;
  onRetry?: () => void;
}

export function PageErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  backTo,
  backLabel = "Go Back",
  onRetry,
}: PageErrorStateProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-destructive" />

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{message}</p>
        </div>

        <div className="flex gap-3 justify-center">
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Try Again
            </Button>
          )}
          {backTo && (
            <Button asChild>
              <Link to={backTo}>{backLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
