import {
  navbarActions,
  navbarContextLabels,
  navbarItems,
  type NavbarAction,
  type NavigationAppearance,
  type NavigationSurface,
} from "@/config/navigation";
import {
  getAccessRedirectPath,
  resolveOnboardingAccess,
} from "@/lib/onboarding-access";
import { AppNavbarClient } from "./AppNavbarClient";

export type AppNavbarProps = {
  appearance?: NavigationAppearance;
  contextLabel?: string;
  showSearch?: boolean;
  surface?: NavigationSurface;
};

export async function AppNavbar({
  appearance = "transparent",
  contextLabel,
  showSearch,
  surface = "public",
}: AppNavbarProps) {
  const access = await resolveOnboardingAccess();
  const hasOnboardingSession = access.state !== "logged_out";
  const showLogoutLink =
    (surface === "onboarding" || surface === "public") &&
    hasOnboardingSession;
  let resolvedActions = navbarActions[surface];

  if (showLogoutLink) {
    resolvedActions = navbarActions[surface].filter(
      (action) =>
        action.label !== "Log in" && action.label !== "Join Tapat",
    );

    if (surface === "public") {
      const resumePath = getAccessRedirectPath(access);
      if (resumePath) {
        const shouldShowDashboardAction =
          access.state === "logged_in_verified_complete" ||
          (access.flowId === "careseeker" &&
            access.accountStatus === "approved");
        const resumeAction: NavbarAction =
          shouldShowDashboardAction
            ? {
                label: "Dashboard",
                href: "/dashboard",
                kind: "link",
              }
            : {
                label: "Resume Onboarding",
                href: resumePath,
                kind: "link",
              };

        resolvedActions = [...resolvedActions, resumeAction];
      }
    }
  }

  return (
    <AppNavbarClient
      actions={resolvedActions}
      appearance={appearance}
      contextLabel={contextLabel}
      contextLabels={navbarContextLabels[surface]}
      navItems={navbarItems[surface]}
      showLogoutLink={showLogoutLink}
      showSearch={showSearch ?? false}
    />
  );
}
