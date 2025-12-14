import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageLoadingState } from "@/app/components/PageLoadingState";
import { personalAgentQueryOptions } from "@/app/lib/queries/personal-agents";

export const Route = createFileRoute("/_authenticated/agents/$id")({
  loader: ({ context, params }) => {
    // Prefetch agent data for instant rendering in child routes
    context.queryClient.prefetchQuery(personalAgentQueryOptions(params.id));
  },
  pendingComponent: () => <PageLoadingState message="Loading agent..." />,
  component: () => <Outlet />,
});
