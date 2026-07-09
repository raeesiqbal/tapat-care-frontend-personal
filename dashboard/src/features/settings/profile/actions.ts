"use server";

import { revalidatePath } from "next/cache";

import {
  buildPersonalDetailsUpdatePayload,
  hasFieldErrors,
  personalDetailsValuesFromFormData,
  validatePersonalDetailsForm,
  type ApiEnvelope,
  type FieldErrors,
  type PersonalDetailsFormField,
  type PersonalDetailsFormValues,
} from "@tapat-care/api-contracts";

import {
  DashboardBackendError,
  dashboardBackendRequest,
  getDashboardSession,
} from "@/features/dashboard/server";
import {
  getDashboardPersonalDetails,
  getDashboardPersonalDetailsEndpoint,
  getDashboardPersonalDetailsFlowId,
} from "@/features/settings/profile/server";
import {
  getDashboardPersonalDetailsSections,
  getSubmittablePersonalDetailsFields,
} from "@/features/settings/profile/field-policy";

export type DashboardPersonalDetailsActionState = {
  status: "idle" | "error" | "success";
  message: string;
  submissionId?: number;
  fieldErrors?: FieldErrors<PersonalDetailsFormField>;
  values?: PersonalDetailsFormValues;
};

export type DashboardProfilePhotoActionState = {
  status: "idle" | "error" | "success";
  message: string;
  submissionId?: number;
  picture?: string | null;
};

const idleState: DashboardPersonalDetailsActionState = {
  status: "idle",
  message: "",
};
const profilePhotoIdleState: DashboardProfilePhotoActionState = {
  status: "idle",
  message: "",
};
const MAX_PROFILE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_PHOTO_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function mergeSubmittedValues(
  currentValues: PersonalDetailsFormValues,
  submittedValues: PersonalDetailsFormValues,
  fields: ReadonlyArray<PersonalDetailsFormField>,
) {
  return fields.reduce<PersonalDetailsFormValues>(
    (result, field) => ({
      ...result,
      [field]: submittedValues[field],
    }),
    { ...currentValues },
  );
}

function getActionMessage(
  error: unknown,
  fallback = "We could not update your personal details.",
) {
  if (error instanceof DashboardBackendError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function getProfilePhotoError(file: File) {
  if (!ALLOWED_PROFILE_PHOTO_TYPES.has(file.type)) {
    return "Upload a JPG, PNG, WebP, or GIF image.";
  }

  if (file.size > MAX_PROFILE_PHOTO_SIZE_BYTES) {
    return "Profile photo must be 5 MB or smaller.";
  }

  return null;
}

export async function updateDashboardProfilePhoto(
  previousState: DashboardProfilePhotoActionState = profilePhotoIdleState,
  formData: FormData,
): Promise<DashboardProfilePhotoActionState> {
  const submissionId = (previousState.submissionId ?? 0) + 1;
  const file = formData.get("file");

  if (!isUploadFile(file) || file.size === 0) {
    return {
      status: "error",
      message: "Choose a profile photo to upload.",
      submissionId,
    };
  }

  const fileError = getProfilePhotoError(file);
  if (fileError) {
    return {
      status: "error",
      message: fileError,
      submissionId,
    };
  }

  try {
    const { token } = await getDashboardSession("/dashboard/settings/profile");
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("content_type", file.type);

    const payload = await dashboardBackendRequest<
      ApiEnvelope<{ picture?: string | null }>
    >("/api/users/picture/", token, {
      method: "PATCH",
      body: uploadFormData,
      cache: "no-store",
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings/profile");

    return {
      status: "success",
      message: payload.message || "Profile photo updated.",
      submissionId,
      picture: payload.data?.picture ?? null,
    };
  } catch (error) {
    return {
      status: "error",
      message: getActionMessage(error, "We could not update your profile photo."),
      submissionId,
    };
  }
}

export async function updateDashboardPersonalDetails(
  previousState: DashboardPersonalDetailsActionState = idleState,
  formData: FormData,
): Promise<DashboardPersonalDetailsActionState> {
  const submissionId = (previousState.submissionId ?? 0) + 1;
  const { token, user } = await getDashboardSession(
    "/dashboard/settings/profile",
  );
  const flowId = getDashboardPersonalDetailsFlowId(user.accountType);

  if (!flowId) {
    return {
      status: "error",
      message: "This account type does not have onboarding personal details.",
      submissionId,
    };
  }

  const currentDetails = await getDashboardPersonalDetails(token, flowId);
  const sections = getDashboardPersonalDetailsSections(flowId);
  const submitFields = getSubmittablePersonalDetailsFields(sections);
  const submittedValues = personalDetailsValuesFromFormData(formData);
  const values = mergeSubmittedValues(
    currentDetails.values,
    submittedValues,
    submitFields,
  );

  if (!currentDetails.canUpdate) {
    return {
      status: "error",
      message: "Finish onboarding before editing these details from settings.",
      submissionId,
      values,
    };
  }

  const fieldErrors = validatePersonalDetailsForm(
    values,
    flowId,
    submitFields,
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
    await dashboardBackendRequest<ApiEnvelope<Record<string, unknown>>>(
      getDashboardPersonalDetailsEndpoint(flowId),
      token,
      {
        method: "PATCH",
        body: JSON.stringify(
          buildPersonalDetailsUpdatePayload(values, flowId, submitFields),
        ),
        cache: "no-store",
      },
    );
    revalidatePath("/dashboard/settings/profile");

    return {
      status: "success",
      message: "Personal details updated.",
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
