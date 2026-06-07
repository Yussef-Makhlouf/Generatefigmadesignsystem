import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { ErrorBoundary } from "./components/error-boundary";
import { useEffect, useState } from "react";
import { AuthSessionProvider } from "../lib/hooks/use-auth-session";
import { SplashScreen } from "./components/splash-screen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});

export default function App() {
  // const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Set RTL direction
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider>
          {/* {showSplash && (
            <SplashScreen 
              duration={2200} 
              onComplete={() => setShowSplash(false)} 
            />
          )} */}
          <RouterProvider router={router} />
          <Toaster />
        </AuthSessionProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}