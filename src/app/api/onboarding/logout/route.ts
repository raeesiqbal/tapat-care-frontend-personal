import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ONBOARDING_ACCESS_TOKEN_COOKIE,
  ONBOARDING_REFRESH_TOKEN_COOKIE,
} from "@/features/onboarding/constants";
import { buildPublicAppUrl } from "@/lib/public-app-url";

function isPrefetchOrRouterSubrequest(request: NextRequest) {
  const purpose = [
    request.headers.get("purpose"),
    request.headers.get("sec-purpose"),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const fetchMode = request.headers.get("sec-fetch-mode")?.toLowerCase();
  const fetchDest = request.headers.get("sec-fetch-dest")?.toLowerCase();

  return (
    request.headers.has("next-router-prefetch") ||
    request.headers.has("next-router-state-tree") ||
    request.headers.get("rsc") === "1" ||
    request.nextUrl.searchParams.has("_rsc") ||
    purpose.includes("prefetch") ||
    fetchMode === "cors" ||
    (Boolean(fetchDest) && fetchDest !== "document")
  );
}

function getSafeLogoutRedirectPath(request: NextRequest) {
  const nextPath = request.nextUrl.searchParams.get("next")?.trim();

  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/";
  }

  try {
    const url = new URL(nextPath, "http://tapat.local");

    if (url.origin !== "http://tapat.local") {
      return "/";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

export async function GET(request: NextRequest) {
  if (isPrefetchOrRouterSubrequest(request)) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  const response = NextResponse.redirect(
    buildPublicAppUrl(getSafeLogoutRedirectPath(request), request),
    303,
  );
  response.cookies.delete(ONBOARDING_ACCESS_TOKEN_COOKIE);
  response.cookies.delete(ONBOARDING_REFRESH_TOKEN_COOKIE);
  response.headers.set("Cache-Control", "no-store");

  return response;
}
