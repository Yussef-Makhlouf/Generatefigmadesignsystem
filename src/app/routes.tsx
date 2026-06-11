import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout";
import { ProtectedRoute } from "./components/protected-route";
import { PageLoader } from "./components/page-loader";
import { ErrorBoundary } from "./components/error-boundary";

// ── Eagerly-loaded (tiny, needed immediately on first paint) ──────────────────
import { HomePage }           from "./pages/home";
import { LoginPage }          from "./pages/login";
import { RegisterPage }       from "./pages/register";
import { ForgotPasswordPage } from "./pages/forgot-password";
import { ResetPasswordPage }  from "./pages/reset-password";
import { NotFoundPage }       from "./pages/not-found";

// ── Lazily-loaded (split into separate chunks, loaded on demand) ──────────────
const QuestionDetailPage = lazy(() =>
  import("./pages/question-detail").then((m) => ({ default: m.QuestionDetailPage }))
);
const ProfilePage = lazy(() =>
  import("./pages/profile").then((m) => ({ default: m.ProfilePage }))
);
const SettingsPage = lazy(() =>
  import("./pages/settings").then((m) => ({ default: m.SettingsPage }))
);
const NewQuestionPage = lazy(() =>
  import("./pages/new-question").then((m) => ({ default: m.NewQuestionPage }))
);
const AdminPage = lazy(() =>
  import("./pages/admin").then((m) => ({ default: m.AdminPage }))
);
const ReputationPage = lazy(() =>
  import("./pages/reputation").then((m) => ({ default: m.ReputationPage }))
);

// ── Lazily-loaded (medium weight, not on the critical path) ───────────────────
const SearchPage        = lazy(() => import("./pages/search").then((m) => ({ default: m.SearchPage })));
const LeaderboardPage   = lazy(() => import("./pages/leaderboard").then((m) => ({ default: m.LeaderboardPage })));
const SpacesPage        = lazy(() => import("./pages/spaces").then((m) => ({ default: m.SpacesPage })));
const HelpPage          = lazy(() => import("./pages/help").then((m) => ({ default: m.HelpPage })));
const AboutPage         = lazy(() => import("./pages/about").then((m) => ({ default: m.AboutPage })));
const PrivacyPage       = lazy(() => import("./pages/privacy").then((m) => ({ default: m.PrivacyPage })));
const TermsPage         = lazy(() => import("./pages/terms").then((m) => ({ default: m.TermsPage })));
const TagDetailPage     = lazy(() => import("./pages/tags").then((m) => ({ default: m.TagDetailPage })));
const NotificationsPage = lazy(() => import("./pages/notifications").then((m) => ({ default: m.NotificationsPage })));
const SavedPage         = lazy(() => import("./pages/saved").then((m) => ({ default: m.SavedPage })));

/** Wraps a lazy component in a Suspense with the global page skeleton fallback */
function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

/** Wraps a route in an ErrorBoundary so a page crash renders a fallback instead of white-screening the app */
function E({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // ── Public routes ─────────────────────────────────────────────
      { index: true,             element: <E><HomePage /></E> },
      { path: "search",          element: <E><S><SearchPage /></S></E> },
      { path: "leaderboard",     element: <E><S><LeaderboardPage /></S></E> },
      { path: "spaces",          element: <E><S><SpacesPage /></S></E> },
      { path: "help",            element: <E><S><HelpPage /></S></E> },
      { path: "about",           element: <E><S><AboutPage /></S></E> },
      { path: "privacy",         element: <E><S><PrivacyPage /></S></E> },
      { path: "terms",           element: <E><S><TermsPage /></S></E> },
      { path: "tags/:tag",       element: <E><S><TagDetailPage /></S></E> },
      { path: "profile/:username", element: <E><S><ProfilePage /></S></E> },
      { path: "questions/:id/:slug?", element: <E><S><QuestionDetailPage /></S></E> },

      // ── Authenticated-user routes ──────────────────────────────────
      {
        path: "questions/new",
        element: (
          <ProtectedRoute require="user">
            <E><S><NewQuestionPage /></S></E>
          </ProtectedRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute require="user">
            <E><S><NotificationsPage /></S></E>
          </ProtectedRoute>
        ),
      },
      {
        path: "saved",
        element: (
          <ProtectedRoute require="user">
            <E><S><SavedPage /></S></E>
          </ProtectedRoute>
        ),
      },
      {
        path: "reputation",
        element: (
          <ProtectedRoute require="user">
            <E><S><ReputationPage /></S></E>
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute require="user">
            <E><S><SettingsPage /></S></E>
          </ProtectedRoute>
        ),
      },

      // ── Admin-only routes ──────────────────────────────────────────
      {
        path: "admin",
        element: (
          <ProtectedRoute require="admin">
            <E><S><AdminPage /></S></E>
          </ProtectedRoute>
        ),
      },

      // ── Fallback ───────────────────────────────────────────────────
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/auth",
    children: [
      { path: "login",           element: <E><LoginPage /></E> },
      { path: "register",        element: <E><RegisterPage /></E> },
      { path: "forgot-password", element: <E><ForgotPasswordPage /></E> },
      { path: "reset-password",  element: <E><ResetPasswordPage /></E> },
    ],
  },
]);
