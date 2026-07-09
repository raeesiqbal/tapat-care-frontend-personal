import {
  validatePassword,
  validatePasswordConfirmation,
} from "@/lib/password-policy";
import {
  type FieldErrors,
  type FormValidationConfig,
  validateField,
  validateForm,
} from "./form-validation";

export type AccountFormField =
  | "email"
  | "password"
  | "confirmPassword";

export type AccountFormValues = Record<AccountFormField, string>;

export const initialAccountFormValues: AccountFormValues = {
  email: "",
  password: "",
  confirmPassword: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const accountValidationConfig: FormValidationConfig<AccountFormValues> =
  {
    email: {
      label: "Email",
      required: true,
      validators: [
        (value) =>
          emailPattern.test(value) ? null : "Enter a valid email address.",
      ],
    },
    password: {
      label: "Password",
      required: true,
      validators: [(value) => validatePassword(value)],
    },
    confirmPassword: {
      label: "Password confirmation",
      required: true,
      validators: [
        (value, values) => validatePasswordConfirmation(values.password, value),
      ],
    },
  };

export function validateAccountField(
  field: AccountFormField,
  values: AccountFormValues,
) {
  return validateField(field, values, accountValidationConfig);
}

export function validateAccountForm(values: AccountFormValues) {
  return validateForm(values, accountValidationConfig);
}

export function accountValuesFromFormData(
  formData: FormData,
): AccountFormValues {
  return {
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || ""),
    confirmPassword: String(formData.get("confirmPassword") || ""),
  };
}

export function accountValuesFromState(
  values?: Record<string, string>,
): AccountFormValues {
  return {
    email: values?.email ?? "",
    password: values?.password ?? "",
    confirmPassword: values?.confirmPassword ?? "",
  };
}

export function mergeAccountFieldErrors(
  ...fieldErrors: Array<FieldErrors<AccountFormField> | undefined>
): FieldErrors<AccountFormField> {
  return fieldErrors.reduce<FieldErrors<AccountFormField>>(
    (result, errors) => ({ ...result, ...(errors ?? {}) }),
    {},
  );
}

// Backward-compatible alias while callers migrate to form-specific naming.
export const mergeFieldErrors = mergeAccountFieldErrors;
