import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { ErrorBoundary } from "./components/error-boundary";
import { useEffect } from "react";
import { AppStateProvider } from "./context/AppStateContext";

export default function App() {
  useEffect(() => {
    // Set RTL direction
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  }, []);

  return (
    <ErrorBoundary>
      <AppStateProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AppStateProvider>
    </ErrorBoundary>
  );
}