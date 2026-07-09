import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  fetchCareseekerOnboardingResumeState,
  fetchProviderOnboardingResumeState,
} from "@/features/onboarding/resume-state";
import { getOnboardingAccessToken } from "@/features/onboarding/server-session";
import { BackendApiError } from "@/lib/backend-api";

export async function GET(request: NextRequest) {
  const token = await getOnboardingAccessToken();

  if (!token) {
    return NextResponse.json(
      { message: "Authentication session missing." },
      { status: 401 },
    );
  }

  try {
    const flow = request.nextUrl.searchParams.get("flow");
    const payload =
      flow === "careseeker"
        ? await fetchCareseekerOnboardingResumeState(token)
        : await fetchProviderOnboardingResumeState(token);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch onboarding state.",
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
