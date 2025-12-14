import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createAuthClient } from "better-auth/client";
import { StrictMode, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import type { AuthContextType, User } from "./routes/__root";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

const authClient = createAuthClient({
  // baseURL: "url-if-host-different-than-the-api"
});

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    // biome-ignore lint/style/noNonNullAssertion: Auth context will be provided by RouterProvider
    auth: undefined!,
    queryClient,
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          setUser(session.data.user as User);
        }
      } catch (_) {
        // Session check failed, user not authenticated
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const auth: AuthContextType = { user, authClient };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} context={{ auth, queryClient }} />
    </QueryClientProvider>
  );
}

// Render the app
// biome-ignore lint/style/noNonNullAssertion: We know the root element is always there
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
