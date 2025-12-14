import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";

const searchSchema = z.object({
  fitCheckId: z.string().optional(),
});

export const Route = createFileRoute("/_oauthLayout/personal-agents/auth/success")({
  validateSearch: searchSchema,
  component: OAuthSuccessComponent,
});

function OAuthSuccessComponent() {
  const { fitCheckId } = Route.useSearch();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Authentication Successful!</h1>
          <p className="text-muted-foreground">Your MCP server has been successfully connected.</p>
        </div>

        <div className="rounded-lg border bg-muted/20 p-4">
          <p className="text-sm text-muted-foreground">
            You can now close this window and return to the main application.
          </p>
        </div>

        {fitCheckId && (
          <div className="space-y-2">
            <Button
              onClick={() => {
                window.close();
              }}
              className="w-full"
            >
              Close Window
            </Button>
            <a
              href={`/mcp-reviews/${fitCheckId}`}
              className="block text-sm text-primary hover:underline"
            >
              or go back to the review page
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
