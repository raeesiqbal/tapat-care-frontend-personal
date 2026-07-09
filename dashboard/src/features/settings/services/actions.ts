"use server";

import { revalidatePath } from "next/cache";

import {
  buildSkillsAvailabilityUpdatePayload,
  hasFieldErrors,
  skillsAvailabilityValuesFromFormData,
  validateSkillsAvailabilityForm,
  type ApiEnvelope,
  type SkillsAvailabilityFieldErrors,
  type SkillsAvailabilityFormField,
  type SkillsAvailabilityValues,
} from "@tapat-care/api-contracts";

import {
  DashboardBackendError,
  dashboardBackendRequest,
  getDashboardSession,
} from "@/features/dashboard/server";
import {
  canAccessDashboardServicesSettings,
  getDashboardServicesSettings,
  getDashboardServicesSettingsEndpoint,
} from "@/features/settings/services/server";
import {
  getDashboardServicesSections,
  getSubmittableDashboardServicesFields,
} from "@/features/settings/services/field-policy";

export type DashboardServicesSettingsActionState = {
  status: "idle" | "error" | "success";
  message: string;
  submissionId?: number;
  fieldErrors?: SkillsAvailabilityFieldErrors;
  values?: SkillsAvailabilityValues;
};

const idleState: DashboardServicesSettingsActionState = {
  status: "idle",
  message: "",
};

function mergeSubmittedValues(
  currentValues: SkillsAvailabilityValues,
  submittedValues: SkillsAvailabilityValues,
  fields: ReadonlyArray<SkillsAvailabilityFormField>,
) {
  return fields.reduce<SkillsAvailabilityValues>(
    (result, field) => ({
      ...result,
      [field]: submittedValues[field],
    }),
    { ...currentValues },
  );
}

function getActionMessage(error: unknown) {
  if (error instanceof DashboardBackendError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "We could not update your services and availability.";
}

export async function updateDashboardServicesSettings(
  previousState: DashboardServicesSettingsActionState = idleState,
  formData: FormData,
): Promise<DashboardServicesSettingsActionState> {
  const submissionId = (previousState.submissionId ?? 0) + 1;
  const { token, user } = await getDashboardSession(
    "/dashboard/settings/services",
  );

  if (!canAccessDashboardServicesSettings(user.accountType)) {
    return {
      status: "error",
      message: "Service settings are only available for caregiver accounts.",
      submissionId,
    };
  }

  const currentSettings = await getDashboardServicesSettings(token);
  const sections = getDashboardServicesSections();
  const submitFields = getSubmittableDashboardServicesFields(sections);
  const submittedValues = skillsAvailabilityValuesFromFormData(formData);
  const values = mergeSubmittedValues(
    currentSettings.values,
    submittedValues,
    submitFields,
  );

  if (!currentSettings.canUpdate) {
    return {
      status: "error",
      message: "Finish onboarding before editing these settings.",
      submissionId,
      values,
    };
  }

  const fieldErrors = validateSkillsAvailabilityForm(values, submitFields);

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
    await dashboardBackendRequest<ApiEnvelope<Record<string, unknown>>>(
      getDashboardServicesSettingsEndpoint(),
      token,
      {
        method: "PATCH",
        body: JSON.stringify(
          buildSkillsAvailabilityUpdatePayload(values, submitFields),
        ),
        cache: "no-store",
      },
    );
    revalidatePath("/dashboard/settings/services");

    return {
      status: "success",
      message: "Services and availability updated.",
      submissionId,
      values,
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
