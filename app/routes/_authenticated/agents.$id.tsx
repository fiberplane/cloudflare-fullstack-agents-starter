import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageErrorState } from "@/app/components/PageErrorState";
import { PageLoadingState } from "@/app/components/PageLoadingState";
import { personalAgentQueryOptions } from "@/app/lib/queries/personal-agents";

export const Route = createFileRoute("/_authenticated/agents/$id")({
  loader: ({ context, params }) => {
    // Prefetch agent data for instant rendering in child routes
    context.queryClient.prefetchQuery(personalAgentQueryOptions(params.id));
  },
  pendingComponent: () => <PageLoadingState message="Loading agent..." />,
  errorComponent: ({ error, reset }) => (
    <PageErrorState
      title="Error Loading Agent"
      message={error instanceof Error ? error.message : "Failed to load agent"}
      onRetry={reset}
      backTo="/agents"
      backLabel="Back to Agents"
    />
  ),
  component: () => <Outlet />,
});
