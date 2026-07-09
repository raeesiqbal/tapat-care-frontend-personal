"use server";

import { revalidatePath } from "next/cache";

import {
  buildCareNeedsUpdatePayload,
  careNeedsValuesFromApi,
  careNeedsValuesFromFormData,
  hasFieldErrors,
  validateCareNeedsForm,
  type ApiEnvelope,
  type CareNeedsBackendData,
  type CareNeedsFieldErrors,
  type CareNeedsFormValues,
} from "@tapat-care/api-contracts";

import {
  DashboardBackendError,
  dashboardBackendRequest,
  getDashboardSession,
} from "@/features/dashboard/server";
import {
  canAccessDashboardCareNeedsSettings,
  getDashboardCareNeedsEndpoint,
  getDashboardCareNeedsSettings,
} from "@/features/settings/care-needs/server";

export type DashboardCareNeedsActionState = {
  status: "idle" | "error" | "success";
  message: string;
  submissionId?: number;
  fieldErrors?: CareNeedsFieldErrors;
  values?: CareNeedsFormValues;
};

const idleState: DashboardCareNeedsActionState = {
  status: "idle",
  message: "",
};

function getActionMessage(error: unknown) {
  if (error instanceof DashboardBackendError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "We could not update your care needs.";
}

export async function updateDashboardCareNeedsSettings(
  previousState: DashboardCareNeedsActionState = idleState,
  formData: FormData,
): Promise<DashboardCareNeedsActionState> {
  const submissionId = (previousState.submissionId ?? 0) + 1;
  const { token, user } = await getDashboardSession(
    "/dashboard/settings/care-needs",
  );

  if (!canAccessDashboardCareNeedsSettings(user.accountType)) {
    return {
      status: "error",
      message: "Care needs settings are only available for careseeker accounts.",
      submissionId,
    };
  }

  const currentSettings = await getDashboardCareNeedsSettings(token);
  const values = careNeedsValuesFromFormData(formData, currentSettings.options);

  if (!currentSettings.canUpdate) {
    return {
      status: "error",
      message: "Finish onboarding before editing care needs from settings.",
      submissionId,
      values,
    };
  }

  const fieldErrors = validateCareNeedsForm(values, currentSettings.options);

  if (hasFieldErrors(fieldErrors)) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      submissionId,
      fieldErrors,
      values,
    };
  }

  try {
    const payload = await dashboardBackendRequest<ApiEnvelope<CareNeedsBackendData>>(
      getDashboardCareNeedsEndpoint(),
      token,
      {
        method: "PUT",
        body: JSON.stringify(
          buildCareNeedsUpdatePayload(values, currentSettings.options),
        ),
        cache: "no-store",
      },
    );
    const canonicalValues = careNeedsValuesFromApi(payload.data);

    revalidatePath("/dashboard/settings/care-needs");

    return {
      status: "success",
      message: payload.message || "Care needs updated.",
      submissionId,
      values: canonicalValues,
    };
  } catch (error) {
    return {
      status: "error",
      message: getActionMessage(error),
      submissionId,
      values,
    };
  }
}
