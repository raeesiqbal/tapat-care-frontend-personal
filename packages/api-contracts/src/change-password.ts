import {
  type FieldErrors,
  type FormValidationConfig,
  hasFieldErrors,
  validateField,
  validateForm,
} from "./form-validation";
import {
  validatePassword,
  validatePasswordConfirmation,
} from "./password-policy";

export const CHANGE_PASSWORD_FIELD_IDS = [
  "currentPassword",
  "newPassword",
  "confirmPassword",
] as const;

export type ChangePasswordFormField =
  (typeof CHANGE_PASSWORD_FIELD_IDS)[number];

export type ChangePasswordFormValues = Record<ChangePasswordFormField, string>;

export type ChangePasswordFieldErrors =
  FieldErrors<ChangePasswordFormField>;

export type ChangePasswordUpdatePayload = {
  old_password: string;
  new_password: string;
};

export const initialChangePasswordFormValues: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export const changePasswordFieldLabels: Record<
  ChangePasswordFormField,
  string
> = {
  currentPassword: "Current password",
  newPassword: "New password",
  confirmPassword: "Confirm password",
};

export const changePasswordValidationConfig: FormValidationConfig<ChangePasswordFormValues> =
  {
    currentPassword: {
      label: changePasswordFieldLabels.currentPassword,
      required: true,
    },
    newPassword: {
      label: changePasswordFieldLabels.newPassword,
      required: true,
      validators: [validatePassword],
    },
    confirmPassword: {
      label: changePasswordFieldLabels.confirmPassword,
      required: true,
      validators: [
        (value, values) =>
          validatePasswordConfirmation(values.newPassword, value),
      ],
    },
  };

export function validateChangePasswordField(
  field: ChangePasswordFormField,
  values: ChangePasswordFormValues,
) {
  return validateField(field, values, changePasswordValidationConfig);
}

export function validateChangePasswordForm(
  values: ChangePasswordFormValues,
  fields: ReadonlyArray<ChangePasswordFormField> = CHANGE_PASSWORD_FIELD_IDS,
) {
  return validateForm(values, changePasswordValidationConfig, fields);
}

export function mergeChangePasswordFieldErrors(
  ...errorSets: Array<ChangePasswordFieldErrors | undefined>
) {
  return errorSets.reduce<ChangePasswordFieldErrors>(
    (mergedErrors, errors) => ({
      ...mergedErrors,
      ...Object.fromEntries(
        Object.entries(errors ?? {}).filter(([, message]) => Boolean(message)),
      ),
    }),
    {},
  );
}

export function hasChangePasswordFieldErrors(
  errors: ChangePasswordFieldErrors,
) {
  return hasFieldErrors(errors);
}

export function changePasswordValuesFromFormData(
  formData: FormData,
): ChangePasswordFormValues {
  return CHANGE_PASSWORD_FIELD_IDS.reduce<ChangePasswordFormValues>(
    (values, field) => ({
      ...values,
      [field]: String(formData.get(field) ?? ""),
    }),
    { ...initialChangePasswordFormValues },
  );
}

export function buildChangePasswordUpdatePayload(
  values: ChangePasswordFormValues,
): ChangePasswordUpdatePayload {
  return {
    old_password: values.currentPassword,
    new_password: values.newPassword,
  };
}
