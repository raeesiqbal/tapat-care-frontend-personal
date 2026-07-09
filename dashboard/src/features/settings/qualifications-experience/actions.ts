"use server";

import { revalidatePath } from "next/cache";

import {
  buildQualificationsExperienceUpdatePayload,
  hasFieldErrors,
  qualificationsExperienceValuesFromApi,
  qualificationsExperienceValuesFromFormData,
  validateQualificationsExperienceForm,
  type ApiEnvelope,
  type QualificationsExperienceBackendData,
  type QualificationsExperienceFieldErrors,
  type QualificationsExperienceValues,
} from "@tapat-care/api-contracts";

import {
  DashboardBackendError,
  dashboardBackendRequest,
  getDashboardSession,
} from "@/features/dashboard/server";
import {
  canAccessDashboardQualificationsExperienceSettings,
  getDashboardQualificationsExperienceSettings,
  getDashboardQualificationsExperienceSettingsEndpoint,
} from "@/features/settings/qualifications-experience/server";

export type DashboardQualificationsExperienceSettingsActionState = {
  status: "idle" | "error" | "success";
  message: string;
  submissionId?: number;
  fieldErrors?: QualificationsExperienceFieldErrors;
  values?: QualificationsExperienceValues;
};

const idleState: DashboardQualificationsExperienceSettingsActionState = {
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

  return "We could not update your qualifications and experience.";
}

export async function updateDashboardQualificationsExperienceSettings(
  previousState: DashboardQualificationsExperienceSettingsActionState = idleState,
  formData: FormData,
): Promise<DashboardQualificationsExperienceSettingsActionState> {
  const submissionId = (previousState.submissionId ?? 0) + 1;
  const { token, user } = await getDashboardSession(
    "/dashboard/settings/qualifications-experience",
  );

  if (!canAccessDashboardQualificationsExperienceSettings(user.accountType)) {
    return {
      status: "error",
      message:
        "Qualifications and experience settings are only available for caregiver accounts.",
      submissionId,
    };
  }

  const currentSettings =
    await getDashboardQualificationsExperienceSettings(token);
  const values = qualificationsExperienceValuesFromFormData(
    formData,
    currentSettings.options,
  );

  if (!currentSettings.canUpdate) {
    return {
      status: "error",
      message: "Finish onboarding before editing these settings.",
      submissionId,
      values,
    };
  }

  const fieldErrors = validateQualificationsExperienceForm(
    values,
    currentSettings.options,
  );

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
    const payload = await dashboardBackendRequest<
      ApiEnvelope<QualificationsExperienceBackendData>
    >(getDashboardQualificationsExperienceSettingsEndpoint(), token, {
      method: "PUT",
      body: JSON.stringify(
        buildQualificationsExperienceUpdatePayload(
          values,
          currentSettings.options,
        ),
      ),
      cache: "no-store",
    });
    revalidatePath("/dashboard/settings/qualifications-experience");

    return {
      status: "success",
      message: "Qualifications and experience updated.",
      submissionId,
      values: qualificationsExperienceValuesFromApi(payload.data),
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
