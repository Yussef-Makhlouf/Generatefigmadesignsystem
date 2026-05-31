import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout";
import { ProtectedRoute } from "./components/protected-route";
import { PageLoader } from "./components/page-loader";

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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // ── Public routes ─────────────────────────────────────────────
      { index: true,             element: <HomePage /> },
      { path: "search",          element: <S><SearchPage /></S> },
      { path: "leaderboard",     element: <S><LeaderboardPage /></S> },
      { path: "spaces",          element: <S><SpacesPage /></S> },
      { path: "help",            element: <S><HelpPage /></S> },
      { path: "about",           element: <S><AboutPage /></S> },
      { path: "privacy",         element: <S><PrivacyPage /></S> },
      { path: "terms",           element: <S><TermsPage /></S> },
      { path: "tags/:tag",       element: <S><TagDetailPage /></S> },
      { path: "profile/:username", element: <S><ProfilePage /></S> },
      { path: "questions/:id",   element: <S><QuestionDetailPage /></S> },

      // ── Authenticated-user routes ──────────────────────────────────
      {
        path: "questions/new",
        element: (
          <ProtectedRoute require="user">
            <S><NewQuestionPage /></S>
          </ProtectedRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute require="user">
            <S><NotificationsPage /></S>
          </ProtectedRoute>
        ),
      },
      {
        path: "saved",
        element: (
          <ProtectedRoute require="user">
            <S><SavedPage /></S>
          </ProtectedRoute>
        ),
      },
      {
        path: "reputation",
        element: (
          <ProtectedRoute require="user">
            <S><ReputationPage /></S>
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute require="user">
            <S><SettingsPage /></S>
          </ProtectedRoute>
        ),
      },

      // ── Admin-only routes ──────────────────────────────────────────
      {
        path: "admin",
        element: (
          <ProtectedRoute require="admin">
            <S><AdminPage /></S>
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
      { path: "login",           element: <LoginPage /> },
      { path: "register",        element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password",  element: <ResetPasswordPage /> },
    ],
  },
]);
