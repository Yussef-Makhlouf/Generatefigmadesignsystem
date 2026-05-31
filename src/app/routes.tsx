import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/home";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";
import { ForgotPasswordPage } from "./pages/forgot-password";
import { ResetPasswordPage } from "./pages/reset-password";
import { NewQuestionPage } from "./pages/new-question";
import { QuestionDetailPage } from "./pages/question-detail";
import { SearchPage } from "./pages/search";
import { ProfilePage } from "./pages/profile";
import { NotificationsPage } from "./pages/notifications";
import { AdminPage } from "./pages/admin";
import { NotFoundPage } from "./pages/not-found";
import { LeaderboardPage } from "./pages/leaderboard";
import { SpacesPage } from "./pages/spaces";
import { SettingsPage } from "./pages/settings";
import { HelpPage } from "./pages/help";
import { TagDetailPage } from "./pages/tags";
import { SavedPage } from "./pages/saved";
import { ReputationPage } from "./pages/reputation";
import { AboutPage } from "./pages/about";
import { PrivacyPage } from "./pages/privacy";
import { TermsPage } from "./pages/terms";
import { Layout } from "./components/layout";
import { ProtectedRoute } from "./components/protected-route";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // ── Public routes ───────────────────────────────
      { index: true, element: <HomePage /> },
      { path: "search",        element: <SearchPage /> },
      { path: "leaderboard",   element: <LeaderboardPage /> },
      { path: "spaces",        element: <SpacesPage /> },
      { path: "help",          element: <HelpPage /> },
      { path: "about",         element: <AboutPage /> },
      { path: "privacy",       element: <PrivacyPage /> },
      { path: "terms",         element: <TermsPage /> },
      { path: "tags/:tag",     element: <TagDetailPage /> },
      { path: "profile/:username", element: <ProfilePage /> },
      { path: "questions/:id", element: <QuestionDetailPage /> },

      // ── Authenticated-user routes ───────────────────
      {
        path: "questions/new",
        element: (
          <ProtectedRoute require="user">
            <NewQuestionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute require="user">
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "saved",
        element: (
          <ProtectedRoute require="user">
            <SavedPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "reputation",
        element: (
          <ProtectedRoute require="user">
            <ReputationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute require="user">
            <SettingsPage />
          </ProtectedRoute>
        ),
      },

      // ── Admin-only routes ───────────────────────────
      {
        path: "admin",
        element: (
          <ProtectedRoute require="admin">
            <AdminPage />
          </ProtectedRoute>
        ),
      },

      // ── Fallback ────────────────────────────────────
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/auth",
    children: [
      { path: "login",    element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password",  element: <ResetPasswordPage /> },
    ],
  },
]);
