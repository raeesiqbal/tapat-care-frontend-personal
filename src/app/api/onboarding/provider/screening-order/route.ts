import { NextResponse } from "next/server";
import { BackendApiError, backendRequest } from "@/lib/backend-api";
import { getOnboardingAccessToken } from "@/features/onboarding/server-session";

type CurrentOrderResponse = {
  data?: {
    screening_order?: {
      id?: number;
      status?: string;
      invitation_url?: string | null;
    } | null;
  };
};

export async function GET() {
  const token = await getOnboardingAccessToken();
  if (!token) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  try {
    const payload = await backendRequest<CurrentOrderResponse>(
      "/api/caregivers/screening-order/current/",
      {
        method: "GET",
        authToken: token,
        cache: "no-store",
      },
    );
    const order = payload.data?.screening_order ?? null;
    return NextResponse.json({
      status: order?.status ?? null,
      invitationUrl: order?.invitation_url ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "failed" },
      {
        status:
          error instanceof BackendApiError &&
          (error.status === 401 || error.status === 403)
            ? error.status
            : 502,
      },
    );
  }
}
