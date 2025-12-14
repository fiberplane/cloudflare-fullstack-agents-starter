import { createFileRoute, Outlet } from "@tanstack/react-router";
import { personalAgentQueryOptions } from "@/app/lib/queries/personal-agents";

export const Route = createFileRoute("/_authenticated/agents/$id")({
  loader: ({ context, params }) => {
    // Prefetch agent data for instant rendering in child routes
    context.queryClient.prefetchQuery(personalAgentQueryOptions(params.id));
  },
  component: () => <Outlet />,
});
