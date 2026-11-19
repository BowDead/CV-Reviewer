import { createBrowserRouter, Navigate } from "react-router";
import {
  WorkspacePage,
  PreviewTab,
  AnalysisTab,
  ImprovementsTab,
  ProfileTab,
  KeysTab,
  FilesTab,
  GithubTab,
  OffersTab,
  OfferDetailsTab,
} from "@/features/home";
import {
  EmployerPage,
  PositionEditTab,
  PositionsTab,
} from "@/features/employer";
import {
  LoginPage,
  RegisterPage,
  RequireAuth,
  UserMenu,
} from "@/features/auth";

export const router = createBrowserRouter([
  {
    element: (
      <RequireAuth roles={["candidate", "admin"]}>
        <WorkspacePage actions={<UserMenu />} />
      </RequireAuth>
    ),
    children: [
      { path: "/", element: <Navigate to="/cv" replace /> },
      { path: "/cv", element: <PreviewTab /> },
      { path: "/analysis", element: <AnalysisTab /> },
      { path: "/improvements", element: <ImprovementsTab /> },
      { path: "/profile", element: <ProfileTab /> },
      { path: "/offers", element: <OffersTab /> },
      { path: "/offers/:offerKey", element: <OfferDetailsTab /> },
      { path: "/files", element: <FilesTab /> },
      { path: "/history", element: <Navigate to="/files" replace /> },
      { path: "/repositories", element: <GithubTab /> },
      { path: "/github", element: <Navigate to="/repositories" replace /> },
      { path: "/keys", element: <KeysTab /> },
    ],
  },
  {
    path: "/employer",
    element: (
      <RequireAuth roles={["employer", "admin"]}>
        <EmployerPage actions={<UserMenu />} />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/employer/positions" replace /> },
      { path: "positions", element: <PositionsTab /> },
      { path: "positions/new", element: <PositionEditTab /> },
      { path: "positions/:positionId", element: <PositionEditTab /> },
      { path: "keys", element: <KeysTab /> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);
