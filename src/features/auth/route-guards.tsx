import "server-only";

import { redirect } from "next/navigation";
import { CrossZoneRedirect } from "@/features/auth/components/CrossZoneRedirect";
import {
  getCrossZoneNavigationHref,
  isCrossZonePath,
} from "@/lib/cross-zone-navigation";
import {
  getAccessRedirectPath,
  resolveOnboardingAccess,
} from "@/lib/onboarding-access";

export async function redirectAuthenticatedUserFromGuestRoute() {
  const access = await resolveOnboardingAccess();
  const redirectPath = getAccessRedirectPath(access);

  if (!redirectPath) {
    return null;
  }

  const href = getCrossZoneNavigationHref(redirectPath);

  if (isCrossZonePath(redirectPath)) {
    return <CrossZoneRedirect href={href} />;
  }

  redirect(href);
}
