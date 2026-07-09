import "server-only";

import {
  initialPersonalDetailsFormValues,
  personalDetailsValuesFromState,
  type ApiEnvelope,
  type PersonalDetailsFlowId,
  type PersonalDetailsFormValues,
} from "@tapat-care/api-contracts";

import { dashboardBackendRequest } from "@/features/dashboard/server";
import type { DashboardRole } from "@/features/dashboard/types";

type DashboardOnboardingStatePayload = ApiEnvelope<{
  onboarding?: {
    status?: string;
    completed_steps?: string[];
    next_step?: string;
  };
  saved_steps?: string[];
  values_by_step?: {
    "personal-details"?: Record<string, string>;
  };
}>;

export type DashboardPersonalDetailsSnapshot = {
  values: PersonalDetailsFormValues;
  onboardingStatus: string;
  completedSteps: string[];
  nextStep: string;
  canUpdate: boolean;
};

export function getDashboardPersonalDetailsFlowId(
  role: DashboardRole,
): PersonalDetailsFlowId | null {
  if (role === "caregiver") {
    return "provider";
  }

  if (role === "careseeker") {
    return "careseeker";
  }

  return null;
}

export function getDashboardPersonalDetailsEndpoint(
  flowId: PersonalDetailsFlowId,
) {
  return flowId === "provider"
    ? "/api/caregivers/update-profile/"
    : "/api/careseekers/update-profile/";
}

function getDashboardOnboardingStateEndpoint(flowId: PersonalDetailsFlowId) {
  return flowId === "provider"
    ? "/api/caregivers/onboarding-state/"
    : "/api/careseekers/onboarding-state/";
}

export function isDashboardPersonalDetailsUpdateAllowed(
  flowId: PersonalDetailsFlowId,
  details: Pick<
    DashboardPersonalDetailsSnapshot,
    "completedSteps" | "nextStep" | "onboardingStatus"
  >,
) {
  const completedPersonalDetails =
    details.completedSteps.includes("personal-details");

  if (!completedPersonalDetails) {
    return false;
  }

  if (flowId === "provider") {
    return (
      ["completed", "in_review", "under_review"].includes(
        details.onboardingStatus,
      ) || details.nextStep === "submitted"
    );
  }

  return (
    details.onboardingStatus === "completed" ||
    details.nextStep === "dashboard"
  );
}

export async function getDashboardPersonalDetails(
  token: string,
  flowId: PersonalDetailsFlowId,
): Promise<DashboardPersonalDetailsSnapshot> {
  const payload = await dashboardBackendRequest<DashboardOnboardingStatePayload>(
    getDashboardOnboardingStateEndpoint(flowId),
    token,
    { method: "GET", cache: "no-store" },
  );
  const onboarding = payload.data?.onboarding ?? {};
  const completedSteps =
    onboarding.completed_steps ?? payload.data?.saved_steps ?? [];
  const onboardingStatus = String(onboarding.status || "").trim().toLowerCase();
  const nextStep = String(onboarding.next_step || "").trim();
  const values = personalDetailsValuesFromState(
    payload.data?.values_by_step?.["personal-details"],
  );
  const snapshot = {
    values: {
      ...initialPersonalDetailsFormValues,
      ...values,
    },
    onboardingStatus,
    completedSteps,
    nextStep,
  };

  return {
    ...snapshot,
    canUpdate: isDashboardPersonalDetailsUpdateAllowed(flowId, snapshot),
  };
}
