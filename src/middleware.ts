import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ONBOARDING_ACCESS_TOKEN_COOKIE } from "@/features/onboarding/constants";
import { buildPublicLoginUrl } from "@/lib/public-app-url";

function isProtectedOnboardingStep(pathname: string) {
  const match = pathname.match(/^\/onboarding\/(provider|careseeker)\/(.+)$/);
  if (!match) {
    return false;
  }

  const step = match[2];
  return Boolean(step) && step !== "account";
}

function isPageNavigationRequest(request: NextRequest) {
  return request.method === "GET" || request.method === "HEAD";
}

export function middleware(request: NextRequest) {
  if (
    isPageNavigationRequest(request) &&
    isProtectedOnboardingStep(request.nextUrl.pathname) &&
    !request.cookies.has(ONBOARDING_ACCESS_TOKEN_COOKIE)
  ) {
    return NextResponse.redirect(
      buildPublicLoginUrl(
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
        request,
      ),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/get-started", "/verify-email", "/onboarding/:path*"],
};
