"use server";

import { cookies } from "next/headers";
import { BackendApiError, backendRequest } from "@/lib/backend-api";
import {
  buildCareNeedsUpdatePayload,
  buildPersonalDetailsUpdatePayload,
  buildSkillsAvailabilityUpdatePayload,
  careNeedsValuesFromApi,
  careNeedsValuesFromFormData,
  careNeedsValuesToState,
  getCareNeedsOptions,
  buildQualificationsExperienceUpdatePayload,
  hasFieldErrors,
  normalizeQualificationsExperienceOptions,
  personalDetailsValuesFromFormData,
  qualificationsExperienceValuesFromApi,
  qualificationsExperienceValuesFromFormData,
  qualificationsExperienceValuesToState,
  skillsAvailabilityValuesFromFormData,
  skillsAvailabilityValuesToState,
  validateCareNeedsForm,
  validatePersonalDetailsForm,
  validateQualificationsExperienceForm,
  validateSkillsAvailabilityForm,
  type ApiEnvelope,
  type CareNeedsBackendData,
  type CareNeedsFieldErrors,
  type QualificationsExperienceBackendData,
  type QualificationsExperienceFieldErrors,
} from "@tapat-care/api-contracts";
import type { OnboardingActionState } from "./types";
import {
  accountValuesFromFormData,
  validateAccountForm,
} from "./validation/account-validation";
import {
  ONBOARDING_ACCESS_TOKEN_COOKIE,
  ONBOARDING_REFRESH_TOKEN_COOKIE,
} from "./constants";
import {
  CARESEEKER_SUBMITTED_COMPLETION_PATH,
  fetchCareseekerOnboardingResumeState,
  fetchProviderOnboardingResumeState,
  resolveCareseekerResumePath,
  resolveProviderResumePath,
} from "./resume-state";
import { getOnboardingAccessToken } from "./server-session";

type OAuthTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
};

type CurrentUserResponse = ApiEnvelope<{
  email?: string;
  is_verified?: boolean;
}>;

type RegistrationResponse = ApiEnvelope<{
  email?: string;
  verification_required?: boolean;
  verification_email_sent?: boolean;
}>;

type SendPhoneVerificationResponse = ApiEnvelope<{
  phone?: string;
  masked_phone?: string;
  retry_after?: number;
  phone_verified?: boolean;
}>;

type VerifyPhoneResponse = ApiEnvelope<{
  phone?: string;
  phone_verified?: boolean;
  next_step?: string;
}>;

type ResetPhoneVerificationResponse = ApiEnvelope<{
  phone?: string;
  phone_verified?: boolean;
}>;

export type PhoneVerificationActionState = {
  status: "idle" | "error" | "success";
  message: string;
  submissionId?: number;
  phone?: string;
  sentPhone?: string;
  sentSubmissionId?: number;
  maskedPhone?: string;
  retryAfter?: number;
  verified?: boolean;
  nextPath?: string;
};

const idleState: OnboardingActionState = {
  status: "idle",
  message: "",
};

async function tryLogin(email: string, password: string) {
  const clientId = process.env.BACKEND_OAUTH_CLIENT_ID;
  const clientSecret = process.env.BACKEND_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error("Backend OAuth credentials are not configured.");
  }
  const tokenPayload = await backendRequest<OAuthTokenResponse>(
    "/api/auth/token/",
    {
      method: "POST",
      body: JSON.stringify({
        username: email,
        password: password,
        grant_type: "password",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      cache: "no-store",
    },
  );
  const cookieStore = await cookies();
  if (tokenPayload.access_token) {
    cookieStore.set(ONBOARDING_ACCESS_TOKEN_COOKIE, tokenPayload.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: tokenPayload.expires_in || 60 * 60,
    });
  }
  if (tokenPayload.refresh_token) {
    cookieStore.set(
      ONBOARDING_REFRESH_TOKEN_COOKIE,
      tokenPayload.refresh_token,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      },
    );
  }
}

async function resolveProviderResumePathForToken(accessToken: string) {
  const resumePayload = await fetchProviderOnboardingResumeState(accessToken);
  return resolveProviderResumePath(resumePayload, {
    defaultPath: "/onboarding/provider/personal-details",
  });
}

async function resolveCareseekerResumePathForToken(accessToken: string) {
  const resumePayload = await fetchCareseekerOnboardingResumeState(accessToken);
  return resolveCareseekerResumePath(resumePayload, {
    defaultPath: "/onboarding/careseeker/personal-details",
    completePath: "/dashboard",
  });
}

async function resolveResumePath(accessToken: string) {
  try {
    return await resolveProviderResumePathForToken(accessToken);
  } catch (error) {
    if (
      error instanceof BackendApiError &&
      error.status !== 403 &&
      error.status !== 404
    ) {
      throw error;
    }
  }

  try {
    return await resolveCareseekerResumePathForToken(accessToken);
  } catch (error) {
    if (
      error instanceof BackendApiError &&
      error.status !== 403 &&
      error.status !== 404
    ) {
      throw error;
    }
  }

  return "/dashboard";
}

async function fetchCurrentUserVerification(accessToken: string) {
  const payload = await backendRequest<CurrentUserResponse>("/api/users/me/", {
    method: "GET",
    authToken: accessToken,
    cache: "no-store",
  });
  return Boolean(payload.data?.is_verified);
}

function mapLoginErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Unable to log in.";
  }
  const message = error.message.trim();
  if (message.toLowerCase().includes("invalid_grant")) {
    return "Invalid email or password. Please check your credentials and try again.";
  }
  return message;
}

function backendErrorData(error: BackendApiError) {
  if (!error.payload || typeof error.payload !== "object") {
    return {};
  }
  const payload = error.payload as Record<string, unknown>;
  return payload.data && typeof payload.data === "object"
    ? (payload.data as Record<string, unknown>)
    : {};
}

function flattenCareNeedsBackendFieldErrors(
  value: unknown,
  prefix = "",
): CareNeedsFieldErrors {
  if (!value) {
    return {};
  }

  if (typeof value === "string") {
    return prefix ? { [prefix]: value } as CareNeedsFieldErrors : {};
  }

  if (Array.isArray(value)) {
    if (typeof value[0] === "string") {
      return prefix ? { [prefix]: value[0] } as CareNeedsFieldErrors : {};
    }

    return value.reduce<CareNeedsFieldErrors>((result, item, index) => {
      const nestedPrefix = prefix ? `${prefix}.${index}` : String(index);
      return {
        ...result,
        ...flattenCareNeedsBackendFieldErrors(item, nestedPrefix),
      };
    }, {});
  }

  if (typeof value !== "object") {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<CareNeedsFieldErrors>(
    (result, [key, nestedValue]) => {
      const normalizedKey = key === "care_needs" ? "" : key;
      const nestedPrefix = normalizedKey
        ? prefix
          ? `${prefix}.${normalizedKey}`
          : normalizedKey
        : prefix;

      return {
        ...result,
        ...flattenCareNeedsBackendFieldErrors(nestedValue, nestedPrefix),
      };
    },
    {},
  );
}

function careNeedsBackendFieldErrors(error: unknown): CareNeedsFieldErrors {
  if (!(error instanceof BackendApiError)) {
    return {};
  }

  return flattenCareNeedsBackendFieldErrors(error.payload);
}

function compactCareNeedsFieldErrors(
  errors: CareNeedsFieldErrors,
): Record<string, string> {
  return Object.entries(errors).reduce<Record<string, string>>(
    (result, [field, message]) => {
      if (message) {
        result[field] = message;
      }
      return result;
    },
    {},
  );
}

export async function loginProviderAccount(
  _previousState: OnboardingActionState = idleState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const submissionId = (_previousState.submissionId ?? 0) + 1;
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) {
    return {
      status: "error",
      message: "Email and password are required.",
      submissionId,
      values: { email },
    };
  }
  try {
    await tryLogin(email, password);
  } catch (error) {
    return {
      status: "error",
      message: mapLoginErrorMessage(error),
      submissionId,
      values: { email },
    };
  }
  const token = await getOnboardingAccessToken();
  if (!token) {
    return {
      status: "error",
      message: "Authentication session missing.",
      submissionId,
      values: { email },
    };
  }
  try {
    const isVerified = await fetchCurrentUserVerification(token);
    if (!isVerified) {
      return {
        status: "success",
        message: "",
        submissionId,
        values: { email },
        nextPath: `/verify-email?email=${encodeURIComponent(email)}&source=login&verification_status=login_unverified`,
      };
    }
    const nextPath = await resolveResumePath(token);
    return {
      status: "success",
      message: "Logged in successfully.",
      submissionId,
      values: { email },
      nextPath,
    };
  } catch {
    return {
      status: "success",
      message: "Logged in successfully.",
      submissionId,
      values: { email },
      nextPath: "/dashboard",
    };
  }
}

export async function registerProviderAccount(
  _previousState: OnboardingActionState = idleState,
  formData: FormData,
): Promise<OnboardingActionState> {
  void _previousState;
  const values = accountValuesFromFormData(formData);
  const fieldErrors = validateAccountForm(values);
  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
      values: {
        email: values.email,
      },
    };
  }
  try {
    const response = await backendRequest<RegistrationResponse>(
      "/api/users/register-caregiver/",
      {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
        cache: "no-store",
      },
    );
    await tryLogin(values.email, values.password);
    return {
      status: "success",
      message:
        response.message ||
        "Account created. Check your email to verify your address.",
      values: {
        email: values.email,
      },
      nextPath: `/verify-email?email=${encodeURIComponent(values.email)}&source=registration`,
    };
  } catch (error) {
    if (error instanceof BackendApiError && error.code === "account_exists") {
      const data = backendErrorData(error);
      return {
        status: "error",
        message: error.message,
        values: { email: values.email },
        existingAccount: {
          email: String(data.email || values.email),
          isVerified: Boolean(data.is_verified),
          canResumeOnboarding: Boolean(data.can_resume_onboarding),
        },
      };
    }
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not create the caregiver account.",
      values: {
        email: values.email,
      },
    };
  }
}

export async function registerCareseekerAccount(
  _previousState: OnboardingActionState = idleState,
  formData: FormData,
): Promise<OnboardingActionState> {
  void _previousState;
  const values = accountValuesFromFormData(formData);
  const fieldErrors = validateAccountForm(values);
  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
      values: {
        email: values.email,
      },
    };
  }
  try {
    const response = await backendRequest<RegistrationResponse>(
      "/api/users/register-careseeker/",
      {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
        cache: "no-store",
      },
    );
    await tryLogin(values.email, values.password);
    return {
      status: "success",
      message:
        response.message ||
        "Account created. Check your email to verify your address.",
      values: {
        email: values.email,
      },
      nextPath: `/verify-email?email=${encodeURIComponent(values.email)}&source=registration`,
    };
  } catch (error) {
    if (error instanceof BackendApiError && error.code === "account_exists") {
      const data = backendErrorData(error);
      return {
        status: "error",
        message: error.message,
        values: { email: values.email },
        existingAccount: {
          email: String(data.email || values.email),
          isVerified: Boolean(data.is_verified),
          canResumeOnboarding: Boolean(data.can_resume_onboarding),
        },
      };
    }
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not create the careseeker account.",
      values: {
        email: values.email,
      },
    };
  }
}
const idlePhoneVerificationState: PhoneVerificationActionState = {
  status: "idle",
  message: "",
};

export async function sendProviderPhoneVerificationCode(
  _previousState: PhoneVerificationActionState = idlePhoneVerificationState,
  formData: FormData,
): Promise<PhoneVerificationActionState> {
  const submissionId = (_previousState.submissionId ?? 0) + 1;
  const token = await getOnboardingAccessToken();
  if (!token) {
    return {
      status: "error",
      message: "Authentication session missing.",
      submissionId,
      sentPhone: _previousState.sentPhone,
      sentSubmissionId: _previousState.sentSubmissionId,
    };
  }
  const phone = String(formData.get("phone") || "").trim();
  try {
    const response = await backendRequest<SendPhoneVerificationResponse>(
      "/api/users/send-phone-verification/",
      {
        method: "POST",
        authToken: token,
        body: JSON.stringify(phone ? { phone } : {}),
        cache: "no-store",
      },
    );

    return {
      status: "success",
      message: response.message || "Verification code sent successfully.",
      submissionId,
      phone: response.data?.phone,
      sentPhone: response.data?.phone,
      sentSubmissionId: submissionId,
      maskedPhone: response.data?.masked_phone,
      retryAfter: Number(response.data?.retry_after || 0),
      verified: Boolean(response.data?.phone_verified),
    };
  } catch (error) {
    const data =
      error instanceof BackendApiError ? backendErrorData(error) : {};
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not send the verification code.",
      submissionId,
      phone,
      sentPhone: _previousState.sentPhone,
      sentSubmissionId: _previousState.sentSubmissionId,
      maskedPhone: typeof data.masked_phone === "string" ? data.masked_phone : undefined,
      retryAfter:
        typeof data.retry_after === "number" ? data.retry_after : undefined,
    };
  }
}

export async function resetProviderPhoneVerification(
  _previousState: PhoneVerificationActionState = idlePhoneVerificationState,
  _formData?: FormData,
): Promise<PhoneVerificationActionState> {
  void _formData;
  const submissionId = (_previousState.submissionId ?? 0) + 1;
  const token = await getOnboardingAccessToken();

  if (!token) {
    return {
      status: "error",
      message: "Authentication session missing.",
      submissionId,
      sentPhone: _previousState.sentPhone,
      sentSubmissionId: _previousState.sentSubmissionId,
    };
  }

  try {
    const response = await backendRequest<ResetPhoneVerificationResponse>(
      "/api/users/reset-phone-verification/",
      {
        method: "POST",
        authToken: token,
        body: JSON.stringify({}),
        cache: "no-store",
      },
    );

    return {
      status: "success",
      message:
        response.message ||
        "Verified phone number unlinked. Enter a new phone number to continue.",
      submissionId,
      phone: response.data?.phone,
      sentPhone: "",
      sentSubmissionId: 0,
      verified: Boolean(response.data?.phone_verified),
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not reset the verified phone number.",
      submissionId,
      phone: _previousState.phone,
      sentPhone: _previousState.sentPhone,
      sentSubmissionId: _previousState.sentSubmissionId,
      verified: _previousState.verified,
    };
  }
}

export async function verifyProviderPhoneCode(
  _previousState: PhoneVerificationActionState = idlePhoneVerificationState,
  formData: FormData,
): Promise<PhoneVerificationActionState> {
  const submissionId = (_previousState.submissionId ?? 0) + 1;
  const token = await getOnboardingAccessToken();
  if (!token) {
    return {
      status: "error",
      message: "Authentication session missing.",
      submissionId,
      sentPhone: _previousState.sentPhone,
      sentSubmissionId: _previousState.sentSubmissionId,
    };
  }
  const phone = String(formData.get("phone") || "").trim();
  const code = String(formData.get("code") || "").trim();
  try {
    const response = await backendRequest<VerifyPhoneResponse>(
      "/api/users/verify-phone/",
      {
        method: "POST",
        authToken: token,
        body: JSON.stringify({ phone, code }),
        cache: "no-store",
      },
    );
    const nextPath = await resolveResumePath(token);
    return {
      status: "success",
      message: response.message || "Phone verified successfully.",
      submissionId,
      phone: response.data?.phone,
      verified: Boolean(response.data?.phone_verified),
      nextPath,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not verify the code.",
      submissionId,
      phone,
      sentPhone: _previousState.sentPhone,
      sentSubmissionId: _previousState.sentSubmissionId,
    };
  }
}

export async function verifyCareseekerPhoneCode(
  _previousState: PhoneVerificationActionState = idlePhoneVerificationState,
  formData: FormData,
): Promise<PhoneVerificationActionState> {
  const submissionId = (_previousState.submissionId ?? 0) + 1;
  const token = await getOnboardingAccessToken();
  if (!token) {
    return {
      status: "error",
      message: "Authentication session missing.",
      submissionId,
      sentPhone: _previousState.sentPhone,
      sentSubmissionId: _previousState.sentSubmissionId,
    };
  }
  const phone = String(formData.get("phone") || "").trim();
  const code = String(formData.get("code") || "").trim();
  try {
    const response = await backendRequest<VerifyPhoneResponse>(
      "/api/users/verify-phone/",
      {
        method: "POST",
        authToken: token,
        body: JSON.stringify({ phone, code }),
        cache: "no-store",
      },
    );
    const nextPath = await resolveCareseekerResumePathForToken(token);
    return {
      status: "success",
      message: response.message || "Phone verified successfully.",
      submissionId,
      phone: response.data?.phone,
      verified: Boolean(response.data?.phone_verified),
      nextPath,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not verify the code.",
      submissionId,
      phone,
      sentPhone: _previousState.sentPhone,
      sentSubmissionId: _previousState.sentSubmissionId,
    };
  }
}

export async function resendVerificationEmail(
  _previousState: OnboardingActionState = idleState,
  formData: FormData,
): Promise<OnboardingActionState> {
  void _previousState;
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  if (!email) {
    return {
      status: "error",
      message: "Enter the email address used to create your account.",
      fieldErrors: { email: "Email is required." },
      values: { email },
    };
  }
  try {
    const response = await backendRequest<ApiEnvelope<Record<string, unknown>>>(
      "/api/users/resend-email-verification/",
      {
        method: "POST",
        body: JSON.stringify({ email }),
        cache: "no-store",
      },
    );
    return {
      status: "success",
      message: response.message,
      values: { email },
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not send a new verification email.",
      values: { email },
    };
  }
}

export async function saveProviderPersonalDetails(
  _previousState: OnboardingActionState = idleState,
  formData: FormData,
): Promise<OnboardingActionState> {
  void _previousState;
  const values = personalDetailsValuesFromFormData(formData);
  const fieldErrors = validatePersonalDetailsForm(values, "provider");
  if (hasFieldErrors(fieldErrors)) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
      values,
    };
  }
  const token = await getOnboardingAccessToken();
  if (!token) {
    return {
      status: "error",
      message:
        "Your caregiver account session is missing. Configure backend OAuth credentials so onboarding can sign in after registration.",
      values,
    };
  }
  try {
    await backendRequest<ApiEnvelope<Record<string, unknown>>>(
      "/api/caregivers/update-profile/",
      {
        method: "PATCH",
        authToken: token,
        body: JSON.stringify(buildPersonalDetailsUpdatePayload(values, "provider")),
        cache: "no-store",
      },
    );
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not save your personal details.",
      values,
    };
  }
  return {
    status: "success",
    message:
      "Personal details saved. Skills and availability is the next step.",
    values,
    nextPath: "/onboarding/provider/skills-availability",
  };
}

export async function saveCareseekerPersonalDetails(
  _previousState: OnboardingActionState = idleState,
  formData: FormData,
): Promise<OnboardingActionState> {
  void _previousState;
  const values = personalDetailsValuesFromFormData(formData);
  const fieldErrors = validatePersonalDetailsForm(values, "careseeker");
  if (hasFieldErrors(fieldErrors)) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
      values,
    };
  }
  const token = await getOnboardingAccessToken();
  if (!token) {
    return {
      status: "error",
      message: "Your careseeker account session is missing. Please log in again.",
      values,
    };
  }
  try {
    await backendRequest<ApiEnvelope<Record<string, unknown>>>(
      "/api/careseekers/update-profile/",
      {
        method: "PATCH",
        authToken: token,
        body: JSON.stringify(buildPersonalDetailsUpdatePayload(values, "careseeker")),
        cache: "no-store",
      },
    );
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not save your personal details.",
      values,
    };
  }
  return {
    status: "success",
    message: "Personal details saved. Care needs is the next step.",
    values,
    nextPath: "/onboarding/careseeker/care-needs",
  };
}

export async function saveCareseekerCareNeeds(
  _previousState: OnboardingActionState = idleState,
  formData: FormData,
): Promise<OnboardingActionState> {
  void _previousState;
  const rawValues = careNeedsValuesFromFormData(formData);

  const token = await getOnboardingAccessToken();
  if (!token) {
    return {
      status: "error",
      message: "Your careseeker account session is missing. Please log in again.",
      values: careNeedsValuesToState(rawValues),
    };
  }

  try {
    const currentPayload = await backendRequest<ApiEnvelope<CareNeedsBackendData>>(
      "/api/onboarding/careseeker/care-needs/",
      {
        method: "GET",
        authToken: token,
        cache: "no-store",
      },
    );
    const options = getCareNeedsOptions(currentPayload.data);
    const values = careNeedsValuesFromFormData(formData, options);
    const fieldErrors = validateCareNeedsForm(values, options);
    const stateValues = careNeedsValuesToState(values, options);

    if (hasFieldErrors(fieldErrors)) {
      return {
        status: "error",
        message: "Please fix the highlighted fields.",
        fieldErrors: compactCareNeedsFieldErrors(fieldErrors),
        values: stateValues,
      };
    }

    const response = await backendRequest<ApiEnvelope<CareNeedsBackendData>>(
      "/api/onboarding/careseeker/care-needs/",
      {
        method: "PUT",
        authToken: token,
        body: JSON.stringify(buildCareNeedsUpdatePayload(values, options)),
        cache: "no-store",
      },
    );
    const canonicalValues = careNeedsValuesFromApi(response.data);

    return {
      status: "success",
      message: response.message || "Care needs saved successfully.",
      values: careNeedsValuesToState(canonicalValues),
      nextPath: CARESEEKER_SUBMITTED_COMPLETION_PATH,
    };
  } catch (error) {
    const backendFieldErrors = careNeedsBackendFieldErrors(error);

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not save your care needs.",
      fieldErrors: hasFieldErrors(backendFieldErrors)
        ? compactCareNeedsFieldErrors(backendFieldErrors)
        : undefined,
      values: careNeedsValuesToState(rawValues),
    };
  }
}

export async function saveProviderSkillsAvailability(
  _previousState: OnboardingActionState = idleState,
  formData: FormData,
): Promise<OnboardingActionState> {
  void _previousState;
  const values = skillsAvailabilityValuesFromFormData(formData);
  const fieldErrors = validateSkillsAvailabilityForm(values);
  const stateValues = skillsAvailabilityValuesToState(values);
  if (hasFieldErrors(fieldErrors)) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
      values: stateValues,
    };
  }
  const token = await getOnboardingAccessToken();
  if (!token) {
    return {
      status: "error",
      message: "Authentication session missing.",
      values: stateValues,
    };
  }
  try {
      await backendRequest<ApiEnvelope<Record<string, unknown>>>(
        "/api/caregivers/update-profile/",
        {
          method: "PATCH",
          authToken: token,
          body: JSON.stringify(buildSkillsAvailabilityUpdatePayload(values)),
          cache: "no-store",
        },
      );
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Could not save skills and availability.",
      values: stateValues,
    };
  }
  return {
    status: "success",
    message: "Skills and availability saved. Qualifications and experience is the next step.",
    values: stateValues,
    nextPath: "/onboarding/provider/qualifications-experience",
  };
}

export async function saveProviderQualificationsExperience(
  _previousState: OnboardingActionState = idleState,
  formData: FormData,
): Promise<OnboardingActionState> {
  void _previousState;
  const rawValues = qualificationsExperienceValuesFromFormData(formData);

  const token = await getOnboardingAccessToken();
  if (!token) {
    return {
      status: "error",
      message: "Authentication session missing.",
      values: qualificationsExperienceValuesToState(rawValues),
    };
  }

  try {
    const currentPayload = await backendRequest<
      ApiEnvelope<QualificationsExperienceBackendData>
    >("/api/onboarding/caregiver/qualifications-experience/", {
      method: "GET",
      authToken: token,
      cache: "no-store",
    });
    const options = normalizeQualificationsExperienceOptions(
      currentPayload.data,
    );
    const values = qualificationsExperienceValuesFromFormData(formData, options);
    const fieldErrors = validateQualificationsExperienceForm(values, options);
    const stateValues = qualificationsExperienceValuesToState(values);

    if (hasFieldErrors(fieldErrors)) {
      return {
        status: "error",
        message: "Please fix the highlighted fields.",
        fieldErrors: fieldErrors as QualificationsExperienceFieldErrors,
        values: stateValues,
      };
    }

    const response = await backendRequest<
      ApiEnvelope<QualificationsExperienceBackendData>
    >("/api/onboarding/caregiver/qualifications-experience/", {
      method: "PUT",
      authToken: token,
      body: JSON.stringify(
        buildQualificationsExperienceUpdatePayload(values, options),
      ),
      cache: "no-store",
    });
    const canonicalValues = qualificationsExperienceValuesFromApi(response.data);

    return {
      status: "success",
      message: response.message || "Qualifications and experience saved successfully.",
      values: qualificationsExperienceValuesToState(canonicalValues),
      nextPath: "/onboarding/provider/review",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Could not save qualifications and experience.",
      values: qualificationsExperienceValuesToState(rawValues),
    };
  }
}
type ScreeningCheckoutResponse = {
  data?: {
    checkout_url?: string;
    payment_id?: number;
    screening_order_id?: number;
  };
};

export type StartScreeningCheckoutState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; checkoutUrl: string };

export async function startProviderScreeningCheckout(): Promise<StartScreeningCheckoutState> {
  const token = await getOnboardingAccessToken();
  if (!token) {
    return {
      status: "error",
      message: "Authentication session missing. Please log in again.",
    };
  }
  try {
    const payload = await backendRequest<ScreeningCheckoutResponse>(
      "/api/payments/caregiver-screening/checkout-session/",
      {
        method: "POST",
        authToken: token,
        body: JSON.stringify({}),
        cache: "no-store",
      },
    );
    const checkoutUrl = payload.data?.checkout_url;
    if (!checkoutUrl) {
      return {
        status: "error",
        message: "Could not start the secure payment session.",
      };
    }
    return { status: "success", checkoutUrl };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Could not start the secure payment session.",
    };
  }
}

type CheckoutReturnResponse = {
  data?: {
    screening_order?: {
      id?: number;
      status?: string;
      invitation_url?: string | null;
    } | null;
  };
};

export type ProcessScreeningReturnResult =
  | {
      status: "ok";
      orderStatus: string | null;
      invitationUrl: string | null;
    }
  | { status: "error"; message: string };

export async function processProviderScreeningReturn(
  sessionId: string,
): Promise<ProcessScreeningReturnResult> {
  const token = await getOnboardingAccessToken();
  if (!token) {
    return {
      status: "error",
      message: "Authentication session missing. Please log in again.",
    };
  }
  try {
    const payload = await backendRequest<CheckoutReturnResponse>(
      "/api/payments/caregiver-screening/checkout-return/",
      {
        method: "POST",
        authToken: token,
        body: JSON.stringify({ session_id: sessionId }),
        cache: "no-store",
      },
    );
    const order = payload.data?.screening_order ?? null;
    return {
      status: "ok",
      orderStatus: (order?.status as string | undefined) ?? null,
      invitationUrl: order?.invitation_url ?? null,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Could not finalize the payment.",
    };
  }
}

type ManualScreeningCompletionResponse = {
  data?: {
    screening_order?: {
      id?: number;
      status?: string;
      invitation_url?: string | null;
    } | null;
  };
};

export type CompleteManualScreeningResult =
  | {
      status: "ok";
      orderStatus: string | null;
      invitationUrl: string | null;
    }
  | { status: "disabled" }
  | { status: "error"; message: string };

export async function completeProviderManualScreening(): Promise<CompleteManualScreeningResult> {
  const token = await getOnboardingAccessToken();
  if (!token) {
    return {
      status: "error",
      message: "Authentication session missing. Please log in again.",
    };
  }
  try {
    const payload = await backendRequest<ManualScreeningCompletionResponse>(
      "/api/caregivers/screening-order/manual-complete/",
      {
        method: "POST",
        authToken: token,
        body: JSON.stringify({}),
        cache: "no-store",
      },
    );
    const order = payload.data?.screening_order ?? null;
    return {
      status: "ok",
      orderStatus: (order?.status as string | undefined) ?? null,
      invitationUrl: order?.invitation_url ?? null,
    };
  } catch (error) {
    if (
      error instanceof BackendApiError &&
      error.status === 403 &&
      error.message.toLowerCase().includes("disabled")
    ) {
      return { status: "disabled" };
    }
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Could not complete the screening.",
    };
  }
}
