import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { ErrorBoundary } from "./components/error-boundary";
import { useEffect } from "react";
import { AuthSessionProvider } from "../lib/hooks/use-auth-session";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});

export default function App() {
  useEffect(() => {
    // Set RTL direction
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthSessionProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}