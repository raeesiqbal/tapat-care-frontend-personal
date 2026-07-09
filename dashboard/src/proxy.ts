import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { buildPublicLoginUrl } from "@/lib/public-app-url";

const ONBOARDING_ACCESS_TOKEN_COOKIE = "tapat_onboarding_access_token";

function isPageNavigationRequest(request: NextRequest) {
  return request.method === "GET" || request.method === "HEAD";
}

export function proxy(request: NextRequest) {
  if (
    isPageNavigationRequest(request) &&
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
  matcher: ["/dashboard/:path*"],
};
