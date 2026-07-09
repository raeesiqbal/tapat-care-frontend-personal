import { joinPublicBackendUrl } from "@/lib/public-backend-api";

export type EmailAvailabilityResult = {
  available: boolean;
  exists: boolean;
  isVerified: boolean;
  canResumeOnboarding: boolean;
  message?: string;
};

type BackendEmailAvailabilityPayload = {
  data?: {
    available?: boolean;
    exists?: boolean;
    is_verified?: boolean;
    can_resume_onboarding?: boolean;
  };
  message?: string;
};

export async function checkEmailAvailability(
  email: string,
  signal?: AbortSignal,
): Promise<EmailAvailabilityResult> {
  const response = await fetch(
    joinPublicBackendUrl("/api/users/email-availability/"),
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      signal,
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | BackendEmailAvailabilityPayload
    | null;

  if (!response.ok || !payload) {
    return {
      available: false,
      exists: false,
      isVerified: false,
      canResumeOnboarding: false,
      message: "We could not verify this email. Please try again.",
    };
  }

  const exists = Boolean(payload.data?.exists);
  const available = payload.data?.available ?? !exists;

  return {
    available,
    exists,
    isVerified: Boolean(payload.data?.is_verified),
    canResumeOnboarding: Boolean(payload.data?.can_resume_onboarding),
    message: payload.message,
  };
}
