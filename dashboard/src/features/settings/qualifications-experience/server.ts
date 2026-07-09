import "server-only";

import {
  initialQualificationsExperienceOptions,
  initialQualificationsExperienceValues,
  normalizeQualificationsExperienceOptions,
  qualificationsExperienceValuesFromApi,
  type ApiEnvelope,
  type QualificationsExperienceBackendData,
  type QualificationsExperienceOptions,
  type QualificationsExperienceValues,
} from "@tapat-care/api-contracts";

import { dashboardBackendRequest } from "@/features/dashboard/server";
import type { DashboardRole } from "@/features/dashboard/types";

type DashboardQualificationsOnboardingStatePayload = ApiEnvelope<{
  onboarding?: {
    status?: string;
    completed_steps?: string[];
    next_step?: string;
  };
  saved_steps?: string[];
}>;

export type DashboardQualificationsExperienceSettingsSnapshot = {
  values: QualificationsExperienceValues;
  options: QualificationsExperienceOptions;
  onboardingStatus: string;
  completedSteps: string[];
  nextStep: string;
  canUpdate: boolean;
};

export function canAccessDashboardQualificationsExperienceSettings(
  role: DashboardRole,
) {
  return role === "caregiver";
}

export function getDashboardQualificationsExperienceSettingsEndpoint() {
  return "/api/onboarding/caregiver/qualifications-experience/";
}

function isDashboardQualificationsExperienceUpdateAllowed(
  details: Pick<
    DashboardQualificationsExperienceSettingsSnapshot,
    "completedSteps" | "nextStep" | "onboardingStatus"
  >,
) {
  if (!details.completedSteps.includes("qualifications-experience")) {
    return false;
  }

  return (
    ["completed", "in_review", "under_review"].includes(
      details.onboardingStatus,
    ) || details.nextStep === "submitted"
  );
}

export async function getDashboardQualificationsExperienceSettings(
  token: string,
): Promise<DashboardQualificationsExperienceSettingsSnapshot> {
  const [onboardingPayload, qualificationsPayload] = await Promise.all([
    dashboardBackendRequest<DashboardQualificationsOnboardingStatePayload>(
      "/api/caregivers/onboarding-state/",
      token,
      { method: "GET", cache: "no-store" },
    ),
    dashboardBackendRequest<ApiEnvelope<QualificationsExperienceBackendData>>(
      getDashboardQualificationsExperienceSettingsEndpoint(),
      token,
      { method: "GET", cache: "no-store" },
    ),
  ]);
  const onboarding = onboardingPayload.data?.onboarding ?? {};
  const completedSteps =
    onboarding.completed_steps ?? onboardingPayload.data?.saved_steps ?? [];
  const onboardingStatus = String(onboarding.status || "").trim().toLowerCase();
  const nextStep = String(onboarding.next_step || "").trim();
  const options = {
    ...initialQualificationsExperienceOptions,
    ...normalizeQualificationsExperienceOptions(qualificationsPayload.data),
  };
  const values = {
    ...initialQualificationsExperienceValues,
    ...qualificationsExperienceValuesFromApi(qualificationsPayload.data),
  };
  const snapshot = {
    values,
    options,
    onboardingStatus,
    completedSteps,
    nextStep,
  };

  return {
    ...snapshot,
    canUpdate: isDashboardQualificationsExperienceUpdateAllowed(snapshot),
  };
}
