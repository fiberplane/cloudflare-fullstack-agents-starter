import { createFileRoute, type SearchSchemaInput, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type SearchInput = {
  redirect?: string;
};

type SearchOutput = {
  redirect: string | undefined;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: SearchInput & SearchSchemaInput): SearchOutput => {
    return {
      redirect: search.redirect || undefined,
    };
  },
  component: Index,
});

function Index() {
  const { auth } = Route.useRouteContext();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const { user, authClient } = auth;

  // If user is logged in, redirect to agents or the specified redirect
  useEffect(() => {
    if (user) {
      navigate({ to: redirect || "/agents" });
    }
  }, [user, redirect, navigate]);

  const handleGitHubSignIn = async () => {
    setIsSigningIn(true);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: redirect || "/",
      });
    } catch (_) {
      // Sign in failed, keep UI state for retry
      setIsSigningIn(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome to the Personal Agent Launcher System (PALS)
            </h2>
            <p className="text-base text-muted-foreground">Please sign in to continue.</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f2937] px-6 py-3 text-base font-medium text-white transition-all hover:bg-[#111827] hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleGitHubSignIn}
            disabled={isSigningIn}
          >
            {isSigningIn ? "Signing in..." : "Sign in with GitHub"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {user.image && (
            <img
              src={user.image}
              alt={user.name}
              className="h-16 w-16 rounded-full border-2 border-primary md:h-20 md:w-20"
            />
          )}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-card-foreground md:text-2xl">
              Welcome, {user.name}!
            </h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.githubUsername && (
              <p className="text-sm font-medium text-primary">@{user.githubUsername}</p>
            )}
          </div>
        </div>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold text-card-foreground">Dashboard</h3>
        <p className="text-muted-foreground">
          You are now logged in and can access the console features.
        </p>
      </div>
    </div>
  );
}
