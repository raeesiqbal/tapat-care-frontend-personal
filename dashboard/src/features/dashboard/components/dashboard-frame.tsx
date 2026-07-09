import type { ReactNode } from "react";

import type { DashboardUser } from "@/features/dashboard/types";
import { DashboardTopbar } from "@/features/dashboard/components/dashboard-topbar";
import { buildPublicAppUrl } from "@/lib/public-app-url";

type DashboardFrameProps = {
  user: DashboardUser;
  children: ReactNode;
};

export function DashboardFrame({ user, children }: DashboardFrameProps) {
  const logoutHref = buildPublicAppUrl("/api/onboarding/logout");

  return (
    <div className="min-h-screen bg-[var(--tapat-color-surface-page)] text-[var(--tapat-color-text-strong)]">
      <DashboardTopbar user={user} logoutHref={logoutHref} />
      {children}
    </div>
  );
}
