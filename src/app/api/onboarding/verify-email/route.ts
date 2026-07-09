import { NextRequest, NextResponse } from "next/server";
import type { ApiEnvelope } from "@tapat-care/api-contracts";
import { BackendApiError, backendRequest } from "@/lib/backend-api";
import {
  ONBOARDING_ACCESS_TOKEN_COOKIE,
  ONBOARDING_REFRESH_TOKEN_COOKIE,
} from "@/features/onboarding/constants";
import {
  fetchCareseekerOnboardingResumeState,
  fetchProviderOnboardingResumeState,
  resolveCareseekerResumePath,
  resolveProviderResumePath,
} from "@/features/onboarding/resume-state";
import { buildPublicAppUrl } from "@/lib/public-app-url";

type VerificationResponse = ApiEnvelope<{
  email: string;
  next_step: string;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  verification_status?: "verified" | "already_verified";
}>;

function redirectUrl(pathname: string, request: NextRequest) {
  return new URL(buildPublicAppUrl(pathname, request));
}

function errorDetails(error: BackendApiError) {
  if (!error.payload || typeof error.payload !== "object") {
    return { code: error.code || "verification_failed", email: "" };
  }
  const payload = error.payload as Record<string, unknown>;
  const data =
    payload.data && typeof payload.data === "object"
      ? (payload.data as Record<string, unknown>)
      : {};
  return {
    code: String(data.code || error.code || "verification_failed"),
    email: String(data.email || ""),
  };
}

async function resolveVerificationRedirectPath(
  accessToken: string,
  fallbackStep: string,
) {
  const defaultPath =
    fallbackStep === "personal-details"
      ? "/onboarding/provider/verification"
      : `/onboarding/provider/${fallbackStep || "personal-details"}`;
  try {
    return resolveProviderResumePath(
      await fetchProviderOnboardingResumeState(accessToken),
      {
        flowBasePath: "/onboarding/provider",
        defaultPath,
      },
    );
  } catch (error) {
    if (
      error instanceof BackendApiError &&
      error.status !== 403 &&
      error.status !== 404
    ) {
      return defaultPath;
    }
  }

  try {
    return resolveCareseekerResumePath(
      await fetchCareseekerOnboardingResumeState(accessToken),
      {
        flowBasePath: "/onboarding/careseeker",
        defaultPath: "/onboarding/careseeker/personal-details",
        completePath: "/dashboard",
      },
    );
  } catch {
    return defaultPath;
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  const clientId = process.env.BACKEND_OAUTH_CLIENT_ID;
  if (!token || !clientId) {
    const url = redirectUrl("/onboarding/provider/account", request);
    url.searchParams.set("verification_status", "invalid");
    return NextResponse.redirect(url, 303);
  }
  try {
    const payload = await backendRequest<VerificationResponse>(
      "/api/users/verify-email/",
      {
        method: "POST",
        body: JSON.stringify({ token, client_id: clientId }),
        cache: "no-store",
      },
    );
    const accessToken = payload.data?.access_token;
    if (!accessToken) {
      throw new Error("Verification completed without an authentication token.");
    }
    const nextPath = await resolveVerificationRedirectPath(
      accessToken,
      payload.data?.next_step || "personal-details",
    );
    const url = redirectUrl(nextPath, request);
    url.searchParams.set(
      "verification_status",
      payload.data?.verification_status === "already_verified"
        ? "already_verified"
        : "verified",
    );
    const response = NextResponse.redirect(url, 303);
    response.cookies.set(ONBOARDING_ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: payload.data?.expires_in || 60 * 60,
    });
    if (payload.data?.refresh_token) {
      response.cookies.set(
        ONBOARDING_REFRESH_TOKEN_COOKIE,
        payload.data.refresh_token,
        {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        },
      );
    }
    return response;
  } catch (error) {
    const details =
      error instanceof BackendApiError
        ? errorDetails(error)
        : { code: "verification_failed", email: "" };
    if (details.code === "verification_link_expired") {
      const url = redirectUrl("/verify-email", request);
      url.searchParams.set("verification_status", "expired");
      url.searchParams.set("source", "registration");
      if (details.email) {
        url.searchParams.set("email", details.email);
      }
      return NextResponse.redirect(url, 303);
    }
    const url = redirectUrl("/onboarding/provider/account", request);
    url.searchParams.set(
      "verification_status",
      details.code === "verification_service_unavailable" ? "failed" : "invalid",
    );
    if (details.email) {
      url.searchParams.set("email", details.email);
    }
    return NextResponse.redirect(url, 303);
  }
}
