import "server-only";

import {
  CARE_NEEDS_STEP_ID,
  careNeedsValuesFromApi,
  getCareNeedsOptions,
  type ApiEnvelope,
  type CareNeedsBackendData,
  type CareNeedsFormValues,
  type CareNeedsOptions,
} from "@tapat-care/api-contracts";

import { dashboardBackendRequest } from "@/features/dashboard/server";
import type { DashboardRole } from "@/features/dashboard/types";

type DashboardCareNeedsPayload = ApiEnvelope<CareNeedsBackendData>;

type DashboardCareseekerOnboardingStatePayload = ApiEnvelope<{
  onboarding?: {
    status?: string;
    completed_steps?: string[];
    next_step?: string;
  };
  saved_steps?: string[];
}>;

export type DashboardCareNeedsSettingsSnapshot = {
  values: CareNeedsFormValues;
  options: CareNeedsOptions;
  onboardingStatus: string;
  completedSteps: string[];
  nextStep: string;
  canUpdate: boolean;
};

export function canAccessDashboardCareNeedsSettings(role: DashboardRole) {
  return role === "careseeker";
}

export function getDashboardCareNeedsEndpoint() {
  return "/api/onboarding/careseeker/care-needs/";
}

function isDashboardCareNeedsUpdateAllowed(
  details: Pick<
    DashboardCareNeedsSettingsSnapshot,
    "completedSteps" | "nextStep" | "onboardingStatus"
  >,
) {
  if (!details.completedSteps.includes(CARE_NEEDS_STEP_ID)) {
    return false;
  }

  return (
    details.onboardingStatus === "completed" ||
    details.nextStep === "dashboard"
  );
}

export async function getDashboardCareNeedsSettings(
  token: string,
): Promise<DashboardCareNeedsSettingsSnapshot> {
  const [careNeedsPayload, onboardingPayload] = await Promise.all([
    dashboardBackendRequest<DashboardCareNeedsPayload>(
      getDashboardCareNeedsEndpoint(),
      token,
      { method: "GET", cache: "no-store" },
    ),
    dashboardBackendRequest<DashboardCareseekerOnboardingStatePayload>(
      "/api/careseekers/onboarding-state/",
      token,
      { method: "GET", cache: "no-store" },
    ),
  ]);
  const onboarding = onboardingPayload.data?.onboarding ?? {};
  const completedSteps =
    onboarding.completed_steps ?? onboardingPayload.data?.saved_steps ?? [];
  const onboardingStatus = String(onboarding.status || "").trim().toLowerCase();
  const nextStep = String(onboarding.next_step || "").trim();
  const snapshot = {
    values: careNeedsValuesFromApi(careNeedsPayload.data),
    options: getCareNeedsOptions(careNeedsPayload.data),
    onboardingStatus,
    completedSteps,
    nextStep,
  };

  return {
    ...snapshot,
    canUpdate: isDashboardCareNeedsUpdateAllowed(snapshot),
  };
}
