import {
  type FieldErrors,
  type FormValidationConfig,
  validateField,
  validateForm,
} from "./form-validation";
import {
  validatePassword,
  validatePasswordConfirmation,
} from "./password-policy";

export const RESET_PASSWORD_FIELD_IDS = [
  "password",
  "confirmPassword",
] as const;

export type ResetPasswordField = (typeof RESET_PASSWORD_FIELD_IDS)[number];

export type ResetPasswordValues = Record<ResetPasswordField, string>;

export type ResetPasswordErrors = FieldErrors<ResetPasswordField>;

export const initialResetPasswordValues: ResetPasswordValues = {
  password: "",
  confirmPassword: "",
};

export const resetPasswordValidationConfig: FormValidationConfig<ResetPasswordValues> =
  {
    password: {
      label: "Password",
      required: true,
      validators: [validatePassword],
    },
    confirmPassword: {
      label: "Confirm password",
      required: true,
      validators: [
        (value, values) =>
          validatePasswordConfirmation(values.password, value),
      ],
    },
  };

export function validateResetPasswordField(
  field: ResetPasswordField,
  values: ResetPasswordValues,
) {
  return validateField(field, values, resetPasswordValidationConfig);
}

export function validateResetPasswordForm(values: ResetPasswordValues) {
  return validateForm(values, resetPasswordValidationConfig);
}
