import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { auth } = Route.useRouteContext();
  const { user } = auth;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Dashboard</h1>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {user?.image && (
            <img
              src={user.image}
              alt={user.name}
              className="h-16 w-16 rounded-full border-2 border-primary md:h-20 md:w-20"
            />
          )}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-card-foreground md:text-2xl">
              Welcome, {user?.name}!
            </h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {user?.githubUsername && (
              <p className="text-sm font-medium text-primary">@{user.githubUsername}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">Protected Dashboard</h3>
        <div className="space-y-2 text-muted-foreground">
          <p>This route is only accessible to authenticated users!</p>
          <p>
            This page uses the{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">_authenticated</code> layout
            route which checks authentication in the{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">beforeLoad</code> function and
            redirects to the home page if not authenticated.
          </p>
        </div>
      </div>
    </div>
  );
}
