import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_oauthLayout")({
  component: OAuthLayoutComponent,
});

function OAuthLayoutComponent() {
  return <Outlet />;
}
