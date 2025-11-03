import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">About Fiberplane</h1>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-muted-foreground">
            Fiberplane Console helps make MCP servers more useful for agents.
          </p>
        </div>
      </div>
    </div>
  );
}
