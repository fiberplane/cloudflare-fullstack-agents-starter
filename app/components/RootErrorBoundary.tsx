import { useRouter } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface RootErrorBoundaryProps {
  error: Error;
  reset?: () => void;
}

export function RootErrorBoundary({ error, reset }: RootErrorBoundaryProps) {
  const router = useRouter();

  const handleRefresh = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    router.navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Please try refreshing the page.
          </p>
        </div>

        {import.meta.env.DEV && (
          <div className="rounded-lg bg-destructive/10 p-4 text-left">
            <p className="font-mono text-sm text-destructive">{error.message}</p>
            {error.stack && (
              <pre className="mt-2 max-h-40 overflow-auto text-xs text-muted-foreground">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleRefresh}>
            Refresh Page
          </Button>
          <Button onClick={handleGoHome}>Go to Home</Button>
        </div>
      </div>
    </div>
  );
}
