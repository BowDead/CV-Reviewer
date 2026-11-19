import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import { AppLayout } from "@/shared/layout/AppLayout";
import { SidebarNav } from "@/shared/layout/SidebarNav";
import { ApiStatus } from "@/features/health";

export function EmployerPage({ actions }) {
  const { t } = useTranslation();

  const navEntries = [
    {
      id: "positions",
      to: "/employer/positions",
      label: t("employer.nav.positions"),
    },
    { id: "keys", to: "/employer/keys", label: t("employer.nav.keys") },
  ];

  return (
    <AppLayout
      sidebar={
        <SidebarNav label={t("employer.navTitle")} entries={navEntries} />
      }
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
