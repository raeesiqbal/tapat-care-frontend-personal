import { NextResponse } from "next/server";
import type {
  ApiEnvelope,
  CareNeedsBackendData,
} from "@tapat-care/api-contracts";
import { BackendApiError, backendRequest } from "@/lib/backend-api";
import { getOnboardingAccessToken } from "@/features/onboarding/server-session";

export async function GET() {
  const token = await getOnboardingAccessToken();

  if (!token) {
    return NextResponse.json(
      { message: "Authentication session missing." },
      { status: 401 },
    );
  }

  try {
    const payload = await backendRequest<ApiEnvelope<CareNeedsBackendData>>(
      "/api/onboarding/careseeker/care-needs/",
      {
        method: "GET",
        authToken: token,
        cache: "no-store",
      },
    );

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch care needs.",
      },
      {
        status:
          error instanceof BackendApiError &&
          (error.status === 401 || error.status === 403)
            ? error.status
            : 400,
      },
    );
  }
}
