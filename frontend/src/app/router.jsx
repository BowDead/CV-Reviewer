import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "@/shared/layout/AppLayout";
import {
  WorkspacePage,
  PreviewTab,
  AnalysisTab,
  ImprovementsTab,
  ProfileTab,
  KeysTab,
} from "@/features/home";
import { EmployerPage } from "@/features/employer";
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
      { path: "/keys", element: <KeysTab /> },
    ],
  },
  {
    path: "/employer",
    element: (
      <RequireAuth roles={["employer", "admin"]}>
        <AppLayout footer={<UserMenu />}>
          <EmployerPage />
        </AppLayout>
      </RequireAuth>
    ),
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);
