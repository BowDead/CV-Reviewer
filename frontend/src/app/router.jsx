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
  InvitationsTab,
  InvitationThreadTab,
} from "@/features/home";
import {
  CandidatesTab,
  EmployerInvitationTab,
  EmployerMessagesTab,
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
import { AdminPage, ReportsTab, SkillsTab, UsersTab } from "@/features/admin";

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
      { path: "/messages", element: <InvitationsTab /> },
      { path: "/messages/:invitationId", element: <InvitationThreadTab /> },
      { path: "/invitations", element: <Navigate to="/messages" replace /> },
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
      { path: "messages", element: <EmployerMessagesTab /> },
      { path: "messages/:invitationId", element: <EmployerInvitationTab /> },
      { path: "candidates", element: <CandidatesTab /> },
      { path: "keys", element: <KeysTab /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <RequireAuth roles={["admin"]}>
        <AdminPage actions={<UserMenu />} />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/reports" replace /> },
      { path: "reports", element: <ReportsTab /> },
      { path: "users", element: <UsersTab /> },
      { path: "skills", element: <SkillsTab /> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);
