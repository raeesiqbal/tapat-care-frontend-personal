import { backendRequest } from "@/lib/backend-api";
import { isOnboardingStepId, type OnboardingStepId } from "./types";

export type OnboardingResumeApiResponse = {
  data?: {
    onboarding?: {
      status?: string;
      next_step?: string;
    };
    account_status?: string;
    screening_status?: string;
    phone?: string;
    phone_verified?: boolean;
    values_by_step?: Record<string, Record<string, string>>;
    saved_steps?: string[];
  };
};

const COMPLETED_ONBOARDING_STATUSES = new Set([
  "completed",
  "in_review",
  "under_review",
]);

const CARESEEKER_COMPLETED_ONBOARDING_STATUSES = new Set(["completed"]);
const CARESEEKER_ONBOARDING_STEPS = new Set([
  "account",
  "verification",
  "personal-details",
  "care-needs",
]);

export const CARESEEKER_SUBMITTED_STATUS_PATH =
  "/onboarding/careseeker/submitted";
export const CARESEEKER_SUBMITTED_COMPLETION_PATH =
  CARESEEKER_SUBMITTED_STATUS_PATH;

export const ACCOUNT_STATUS_PATHS: Record<string, string> = {
  approved: "/dashboard",
  in_review: "/onboarding/provider/submitted",
  review_required: "/onboarding/provider/submitted",
  rejected: "/onboarding/provider/submitted",
};

export async function fetchProviderOnboardingResumeState(accessToken: string) {
  return backendRequest<OnboardingResumeApiResponse>(
    "/api/caregivers/onboarding-state/",
    {
      method: "GET",
      authToken: accessToken,
      cache: "no-store",
    },
  );
}

export async function fetchCareseekerOnboardingResumeState(accessToken: string) {
  return backendRequest<OnboardingResumeApiResponse>(
    "/api/careseekers/onboarding-state/",
    {
      method: "GET",
      authToken: accessToken,
      cache: "no-store",
    },
  );
}

function resolveResumeStep(
  stepId: string,
): Exclude<OnboardingStepId, "submitted"> | null {
  if (!isOnboardingStepId(stepId)) {
    return null;
  }

  if (stepId === "submitted") {
    return null;
  }

  return stepId;
}

export function resolveProviderResumePath(
  payload: OnboardingResumeApiResponse,
  options: {
    defaultPath: string;
    flowBasePath?: string;
    completePath?: string;
  },
) {
  const status = String(payload.data?.onboarding?.status || "").trim().toLowerCase();
  const accountStatus = String(payload.data?.account_status || "")
    .trim()
    .toLowerCase();
  const phoneVerified = Boolean(payload.data?.phone_verified);

  if (accountStatus && accountStatus !== "onboarding_in_progress") {
    return ACCOUNT_STATUS_PATHS[accountStatus] ?? "/onboarding/provider/submitted";
  }

  if (!phoneVerified) {
    return `${options.flowBasePath ?? "/onboarding/provider"}/verification`;
  }

  if (COMPLETED_ONBOARDING_STATUSES.has(status)) {
    return `${options.flowBasePath ?? "/onboarding/provider"}/submitted`;
  }

  const nextStep = resolveResumeStep(
    String(payload.data?.onboarding?.next_step || "").trim(),
  );

  if (nextStep) {
    return `${options.flowBasePath ?? "/onboarding/provider"}/${nextStep}`;
  }
  return options.defaultPath;
}

export function resolveCareseekerResumePath(
  payload: OnboardingResumeApiResponse,
  options: {
    defaultPath: string;
    flowBasePath?: string;
    completePath?: string;
  },
) {
  const status = String(payload.data?.onboarding?.status || "").trim().toLowerCase();
  const accountStatus = String(payload.data?.account_status || "")
    .trim()
    .toLowerCase();
  const phoneVerified = Boolean(payload.data?.phone_verified);
  const flowBasePath = options.flowBasePath ?? "/onboarding/careseeker";

  if (!phoneVerified) {
    return `${flowBasePath}/verification`;
  }

  if (accountStatus === "approved") {
    return options.completePath ?? "/dashboard";
  }

  if (
    CARESEEKER_COMPLETED_ONBOARDING_STATUSES.has(status) ||
    (accountStatus && accountStatus !== "onboarding_in_progress")
  ) {
    return `${flowBasePath}/submitted`;
  }

  const nextStep = String(payload.data?.onboarding?.next_step || "").trim();

  if (nextStep && CARESEEKER_ONBOARDING_STEPS.has(nextStep)) {
    return `${flowBasePath}/${nextStep === "account" ? "personal-details" : nextStep}`;
  }

  return options.defaultPath;
}
