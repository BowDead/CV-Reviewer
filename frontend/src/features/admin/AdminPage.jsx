import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import { AppLayout } from "@/shared/layout/AppLayout";
import { SidebarNav } from "@/shared/layout/SidebarNav";
import { ApiStatus } from "@/features/health";

export function AdminPage({ actions }) {
  const { t } = useTranslation();

  const navEntries = [
    { id: "reports", to: "/admin/reports", label: t("admin.nav.reports") },
    { id: "users", to: "/admin/users", label: t("admin.nav.users") },
    { id: "skills", to: "/admin/skills", label: t("admin.nav.skills") },
    {
      id: "views",
      title: t("admin.nav.views"),
      items: [
        { to: "/cv", label: t("admin.nav.candidate") },
        { to: "/employer/positions", label: t("admin.nav.employer") },
      ],
    },
  ];

  return (
    <AppLayout
      sidebar={<SidebarNav label={t("admin.navTitle")} entries={navEntries} />}
      footer={
        <>
          {actions}
          <ApiStatus />
        </>
      }
    >
      <Outlet />
    </AppLayout>
  );
}
