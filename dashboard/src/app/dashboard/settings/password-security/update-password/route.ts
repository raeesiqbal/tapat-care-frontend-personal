import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import {
  buildChangePasswordUpdatePayload,
  changePasswordValuesFromFormData,
  hasChangePasswordFieldErrors,
  validateChangePasswordForm,
  type ApiEnvelope,
  type ChangePasswordFieldErrors,
  type ChangePasswordFormField,
} from "@tapat-care/api-contracts";

import {
  DASHBOARD_AUTH_COOKIE_NAMES,
  DashboardBackendError,
  dashboardBackendRequest,
} from "@/features/dashboard/server";
import { buildPublicAppUrl } from "@/lib/public-app-url";

const backendFieldMap: Record<string, ChangePasswordFormField> = {
  old_password: "currentPassword",
  current_password: "currentPassword",
  currentPassword: "currentPassword",
  new_password: "newPassword",
  newPassword: "newPassword",
  confirm_password: "confirmPassword",
  confirmPassword: "confirmPassword",
};

async function getAuthToken() {
  const cookieStore = await cookies();

  for (const cookieName of DASHBOARD_AUTH_COOKIE_NAMES) {
    const token = cookieStore.get(cookieName)?.value;

    if (token) {
      return token;
    }
  }

  return null;
}

function firstMessage(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(firstMessage).find(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.values(value).map(firstMessage).find(Boolean);
  }

  return undefined;
}

function getRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function getBackendFieldErrors(payload: unknown): ChangePasswordFieldErrors {
  const root = getRecord(payload);
  const data = getRecord(root.data);

  return Object.entries(backendFieldMap).reduce<ChangePasswordFieldErrors>(
    (errors, [backendField, formField]) => {
      const message = firstMessage(data[backendField] ?? root[backendField]);

      if (!message) {
        return errors;
      }

      return {
        ...errors,
        [formField]: message,
      };
    },
    {},
  );
}

function getActionMessage(error: unknown) {
  if (error instanceof DashboardBackendError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "We could not update your password.";
}

function jsonResponse(
  body: {
    status: "error" | "success";
    message: string;
    fieldErrors?: ChangePasswordFieldErrors;
    redirectHref?: string;
  },
  status: number,
) {
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store",
    },
    status,
  });
}

export async function POST(request: NextRequest) {
  const values = changePasswordValuesFromFormData(await request.formData());
  const fieldErrors = validateChangePasswordForm(values);

  if (hasChangePasswordFieldErrors(fieldErrors)) {
    return jsonResponse(
      {
        status: "error",
        message: "Please fix the highlighted fields.",
        fieldErrors,
      },
      400,
    );
  }

  const token = await getAuthToken();

  if (!token) {
    return jsonResponse(
      {
        status: "error",
        message: "Authentication session missing. Please log in again.",
      },
      401,
    );
  }

  try {
    await dashboardBackendRequest<ApiEnvelope<Record<string, unknown>>>(
      "/api/users/update-password/",
      token,
      {
        method: "PATCH",
        body: JSON.stringify(buildChangePasswordUpdatePayload(values)),
        cache: "no-store",
        headers: request.headers.get("user-agent")
          ? { "X-Client-User-Agent": request.headers.get("user-agent") ?? "" }
          : undefined,
      },
    );

    return jsonResponse(
      {
        status: "success",
        message: "Password updated successfully. Please log in again.",
        redirectHref: buildPublicAppUrl(
          `/api/onboarding/logout?next=${encodeURIComponent(
            "/login?password_status=changed",
          )}`,
        ),
      },
      200,
    );
  } catch (error) {
    return jsonResponse(
      {
        status: "error",
        message: getActionMessage(error),
        fieldErrors:
          error instanceof DashboardBackendError
            ? getBackendFieldErrors(error.payload)
            : undefined,
      },
      error instanceof DashboardBackendError ? error.status : 500,
    );
  }
}
