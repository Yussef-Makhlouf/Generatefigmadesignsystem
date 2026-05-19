import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/home";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";
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
import { Layout } from "./components/layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "search", element: <SearchPage /> },
      { path: "questions/new", element: <NewQuestionPage /> },
      { path: "questions/:id", element: <QuestionDetailPage /> },
      { path: "profile/:username", element: <ProfilePage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "leaderboard", element: <LeaderboardPage /> },
      { path: "spaces", element: <SpacesPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "help", element: <HelpPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "tags/:tag", element: <TagDetailPage /> },
      { path: "saved", element: <SavedPage /> },
      { path: "reputation", element: <ReputationPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/auth",
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
]);
