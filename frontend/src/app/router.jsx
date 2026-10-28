import { createBrowserRouter, Navigate } from "react-router";
import {
  WorkspacePage,
  PreviewTab,
  AnalysisTab,
  ImprovementsTab,
  ProfileTab,
} from "@/features/home";

export const router = createBrowserRouter([
  {
    element: <WorkspacePage />,
    children: [
      { path: "/", element: <Navigate to="/cv" replace /> },
      { path: "/cv", element: <PreviewTab /> },
      { path: "/analysis", element: <AnalysisTab /> },
      { path: "/improvements", element: <ImprovementsTab /> },
      { path: "/profile", element: <ProfileTab /> },
      { path: "*", element: <Navigate to="/cv" replace /> },
    ],
  },
]);
