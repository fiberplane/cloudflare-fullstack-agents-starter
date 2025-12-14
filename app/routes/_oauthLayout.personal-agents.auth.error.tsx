import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";

const searchSchema = z.object({
  error: z.string().optional().default("Unknown error occurred"),
});

export const Route = createFileRoute("/_oauthLayout/personal-agents/auth/error")({
  validateSearch: searchSchema,
  component: OAuthErrorComponent,
});

function OAuthErrorComponent() {
  const { error } = Route.useSearch();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Authentication Failed</h1>
          <p className="text-muted-foreground">There was a problem connecting your MCP server.</p>
        </div>

        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-destructive font-medium mb-1">Error Details</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => {
              window.close();
            }}
            variant="outline"
            className="w-full"
          >
            Close Window
          </Button>
          <a href="/mcp-reviews" className="block text-sm text-primary hover:underline">
            Return to Reviews
          </a>
        </div>
      </div>
    </div>
  );
}
