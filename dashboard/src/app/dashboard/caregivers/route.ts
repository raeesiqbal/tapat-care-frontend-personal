import { NextResponse, type NextRequest } from "next/server";

import {
  DashboardBackendError,
  getCaregiverListingPage,
  getDashboardAuthToken,
} from "@/features/dashboard/server";

function getOffset(request: NextRequest) {
  const rawOffset = Number(request.nextUrl.searchParams.get("offset") || 0);

  return Number.isFinite(rawOffset) && rawOffset > 0 ? Math.floor(rawOffset) : 0;
}

function jsonResponse(body: unknown, status: number) {
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store",
    },
    status,
  });
}

export async function GET(request: NextRequest) {
  const token = await getDashboardAuthToken();

  if (!token) {
    return jsonResponse(
      {
        message: "Authentication session missing. Please log in again.",
      },
      401,
    );
  }

  try {
    return jsonResponse(await getCaregiverListingPage(token, getOffset(request)), 200);
  } catch (error) {
    return jsonResponse(
      {
        message:
          error instanceof DashboardBackendError
            ? error.message
            : "We could not load caregivers.",
      },
      error instanceof DashboardBackendError ? error.status : 500,
    );
  }
}
