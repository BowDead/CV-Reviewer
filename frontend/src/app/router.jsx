import { createBrowserRouter } from "react-router";
import { AppLayout } from "@/shared/layout/AppLayout";
import { HomePage } from "@/features/home";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
]);
