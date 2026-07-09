import "server-only";

import {
  isOnboardingStepId,
  type OnboardingFlowId,
  type OnboardingStepId,
} from "@/features/onboarding/types";
import { BackendApiError, backendRequest } from "@/lib/backend-api";
import {
  CARESEEKER_SUBMITTED_STATUS_PATH,
  fetchCareseekerOnboardingResumeState,
  fetchProviderOnboardingResumeState,
  resolveCareseekerResumePath,
  resolveProviderResumePath,
} from "@/features/onboarding/resume-state";
import { getOnboardingAccessToken } from "@/features/onboarding/server-session";

type CurrentUserResponse = {
  data?: {
    email?: string;
    is_verified?: boolean;
  };
};

type AccessState =
  | "logged_out"
  | "logged_in_unverified"
  | "logged_in_verified_incomplete"
  | "logged_in_verified_status"
  | "logged_in_verified_complete";

type OnboardingAccess = {
  state: AccessState;
  flowId: OnboardingFlowId | null;
  email: string;
  phone: string;
  phoneVerified: boolean;
  resumePath: string | null;
  nextStep: string;
  completedSteps: string[];
  accountStatus: string;
  screeningStatus: string;
};

const ACCESSIBLE_PROVIDER_STEPS: OnboardingStepId[] = [
  "verification",
  "personal-details",
  "skills-availability",
  "qualifications-experience",
  "review",
  "screening-payment",
];

const ACCESSIBLE_CARESEEKER_STEPS: OnboardingStepId[] = [
  "verification",
  "personal-details",
  "care-needs",
];

function buildVerifyEmailPath(email: string) {
  if (!email) {
    return "/verify-email";
  }

  return `/verify-email?email=${encodeURIComponent(email)}`;
}

function getStepIdFromPath(path: string | null): OnboardingStepId | null {
  const stepId = path?.split("/").filter(Boolean).at(-1) ?? "";
  return isOnboardingStepId(stepId) ? stepId : null;
}

export async function resolveOnboardingAccess(): Promise<OnboardingAccess> {
  const token = await getOnboardingAccessToken();

  if (!token) {
    return {
      state: "logged_out",
      flowId: null,
      email: "",
      phone: "",
      phoneVerified: false,
      resumePath: null,
      nextStep: "",
      completedSteps: [],
      accountStatus: "",
      screeningStatus: "",
    };
  }

  try {
    const currentUser = await backendRequest<CurrentUserResponse>("/api/users/me/", {
      method: "GET",
      authToken: token,
      cache: "no-store",
    });
    const email = String(currentUser.data?.email || "").trim();
    const isVerified = Boolean(currentUser.data?.is_verified);

    if (!isVerified) {
      return {
        state: "logged_in_unverified",
        flowId: null,
        email,
        phone: "",
        phoneVerified: false,
        resumePath: "/verify-email",
        nextStep: "verification",
        completedSteps: ["account"],
        accountStatus: "",
        screeningStatus: "",
      };
    }

    try {
      const payload = await fetchProviderOnboardingResumeState(token);
      const accountStatus = String(payload.data?.account_status || "")
        .trim()
        .toLowerCase();
      const screeningStatus = String(payload.data?.screening_status || "")
        .trim()
        .toLowerCase();
      const phone = String(payload.data?.phone || "").trim();
      const phoneVerified = Boolean(payload.data?.phone_verified);
      const nextStep = String(payload.data?.onboarding?.next_step || "").trim();
      const completedSteps = Array.isArray(payload.data?.saved_steps)
        ? payload.data!.saved_steps!
            .map((step) => String(step).trim())
            .filter(Boolean)
        : [];
      const resumePath = resolveProviderResumePath(payload, {
        flowBasePath: "/onboarding/provider",
        defaultPath: "/onboarding/provider/personal-details",
        completePath: "/dashboard",
      });

      if (phoneVerified && accountStatus === "approved") {
        return {
          state: "logged_in_verified_complete",
          flowId: "provider",
          email,
          phone,
          phoneVerified,
          resumePath: "/dashboard",
          nextStep: "submitted",
          completedSteps,
          accountStatus,
          screeningStatus,
        };
      }

      if (
        phoneVerified &&
        ["in_review", "review_required", "rejected"].includes(accountStatus)
      ) {
        return {
          state: "logged_in_verified_status",
          flowId: "provider",
          email,
          phone,
          phoneVerified,
          resumePath: "/onboarding/provider/submitted",
          nextStep: "submitted",
          completedSteps,
          accountStatus,
          screeningStatus,
        };
      }

      return {
        state: "logged_in_verified_incomplete",
        flowId: "provider",
        email,
        phone,
        phoneVerified,
        resumePath,
        nextStep,
        completedSteps,
        accountStatus,
        screeningStatus,
      };
    } catch (error) {
      if (
        error instanceof BackendApiError &&
        error.status !== 403 &&
        error.status !== 404
      ) {
        throw error;
      }
    }

    const payload = await fetchCareseekerOnboardingResumeState(token);
    const phone = String(payload.data?.phone || "").trim();
    const phoneVerified = Boolean(payload.data?.phone_verified);
    const accountStatus = String(payload.data?.account_status || "")
      .trim()
      .toLowerCase();
    const status = String(payload.data?.onboarding?.status || "")
      .trim()
      .toLowerCase();
    const nextStep = String(payload.data?.onboarding?.next_step || "").trim();
    const completedSteps = Array.isArray(payload.data?.saved_steps)
      ? payload.data!.saved_steps!.map((step) => String(step).trim()).filter(Boolean)
      : [];
    const resumePath = resolveCareseekerResumePath(payload, {
      flowBasePath: "/onboarding/careseeker",
      defaultPath: "/onboarding/careseeker/personal-details",
      completePath: "/dashboard",
    });

    if (phoneVerified && accountStatus === "approved") {
      return {
        state: "logged_in_verified_complete",
        flowId: "careseeker",
        email,
        phone,
        phoneVerified,
        resumePath: "/dashboard",
        nextStep: "dashboard",
        completedSteps,
        accountStatus: accountStatus || "approved",
        screeningStatus: "",
      };
    }

    if (
      phoneVerified &&
      (status === "completed" ||
        (accountStatus && accountStatus !== "onboarding_in_progress"))
    ) {
      return {
        state: "logged_in_verified_status",
        flowId: "careseeker",
        email,
        phone,
        phoneVerified,
        resumePath: CARESEEKER_SUBMITTED_STATUS_PATH,
        nextStep: "submitted",
        completedSteps,
        accountStatus: accountStatus || "in_review",
        screeningStatus: "",
      };
    }

    return {
      state: "logged_in_verified_incomplete",
      flowId: "careseeker",
      email,
      phone,
      phoneVerified,
      resumePath,
      nextStep,
      completedSteps,
      accountStatus,
      screeningStatus: "",
    };
  } catch {
    return {
      state: "logged_out",
      flowId: null,
      email: "",
      phone: "",
      phoneVerified: false,
      resumePath: null,
      nextStep: "",
      completedSteps: [],
      accountStatus: "",
      screeningStatus: "",
    };
  }
}

export function getAccessRedirectPath(access: OnboardingAccess) {
  if (access.state === "logged_out") {
    return null;
  }

  if (access.state === "logged_in_unverified") {
    return buildVerifyEmailPath(access.email);
  }

  return access.resumePath || "/dashboard";
}

export function buildLoginRedirectPath(nextPath: string) {
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export function canAccessProviderStep(
  access: OnboardingAccess,
  stepId: OnboardingStepId,
) {
  if (stepId === "submitted") {
    return (
      access.state === "logged_in_verified_status" ||
      access.resumePath === "/onboarding/provider/submitted"
    );
  }

  if (stepId === "account") {
    return false;
  }

  if (access.flowId !== "provider") {
    return false;
  }

  if (access.state !== "logged_in_verified_incomplete") {
    return false;
  }

  if (!ACCESSIBLE_PROVIDER_STEPS.includes(stepId)) {
    return false;
  }

  const currentStep = getStepIdFromPath(access.resumePath);
  const requestedStepIndex = ACCESSIBLE_PROVIDER_STEPS.indexOf(stepId);
  const currentStepIndex = currentStep
    ? ACCESSIBLE_PROVIDER_STEPS.indexOf(currentStep)
    : -1;

  if (requestedStepIndex === -1 || currentStepIndex === -1) {
    return false;
  }

  return requestedStepIndex <= currentStepIndex;
}

export function canAccessCareseekerStep(
  access: OnboardingAccess,
  stepId: OnboardingStepId,
) {
  if (stepId === "submitted") {
    return (
      access.flowId === "careseeker" &&
      (access.state === "logged_in_verified_status" ||
        access.resumePath === CARESEEKER_SUBMITTED_STATUS_PATH)
    );
  }

  if (stepId === "account") {
    return false;
  }

  if (access.flowId !== "careseeker") {
    return false;
  }

  if (access.state !== "logged_in_verified_incomplete") {
    return false;
  }

  if (!ACCESSIBLE_CARESEEKER_STEPS.includes(stepId)) {
    return false;
  }

  const currentStep = getStepIdFromPath(access.resumePath);
  const requestedStepIndex = ACCESSIBLE_CARESEEKER_STEPS.indexOf(stepId);
  const currentStepIndex = currentStep
    ? ACCESSIBLE_CARESEEKER_STEPS.indexOf(currentStep)
    : -1;

  if (requestedStepIndex === -1 || currentStepIndex === -1) {
    return false;
  }

  return requestedStepIndex <= currentStepIndex;
}
