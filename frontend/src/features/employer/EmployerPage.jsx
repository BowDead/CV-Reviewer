import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import { AppLayout } from "@/shared/layout/AppLayout";
import { SidebarNav } from "@/shared/layout/SidebarNav";
import { ApiStatus } from "@/features/health";
import { InvitationsProvider, useInvitationFeed } from "@/features/invitations";

export function EmployerPage({ actions }) {
  const { t } = useTranslation();
  const invitationFeed = useInvitationFeed();

  const navEntries = [
    {
      id: "recruitment",
      title: t("employer.navGroups.recruitment"),
      items: [
        { to: "/employer/positions", label: t("employer.nav.positions") },
        { to: "/employer/candidates", label: t("employer.nav.candidates") },
        {
          to: "/employer/messages",
          label: t("employer.nav.messages"),
          badge: invitationFeed.unreadCount || null,
        },
      ],
    },
    { id: "keys", to: "/employer/keys", label: t("employer.nav.keys") },
  ];

  return (
    <InvitationsProvider feed={invitationFeed} basePath="/employer/messages">
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
    </InvitationsProvider>
  );
}
