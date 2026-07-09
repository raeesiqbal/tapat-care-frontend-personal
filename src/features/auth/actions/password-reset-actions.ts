"use server";
import { confirmPasswordReset, requestPasswordReset } from "@/lib/api/password-reset";
import { validatePassword } from "@/lib/password-policy";
import { validateForgotPasswordEmail } from "../validation/forgot-password-validation";

const RESET_REQUEST_SUCCESS_MESSAGE =
  "If an account with that email address exists, you’ll receive password reset instructions shortly.";

export type PasswordResetState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function forgotPasswordAction(
  _prevState: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const emailError = validateForgotPasswordEmail(email);

  if (emailError) {
    return {
      status: "error",
      message: emailError,
    };
  }

  try {
    await requestPasswordReset(email);
  } catch {
    return {
      status: "success",
      message: RESET_REQUEST_SUCCESS_MESSAGE,
    };
  }

  return {
    status: "success",
    message: RESET_REQUEST_SUCCESS_MESSAGE,
  };
}

export async function resetPasswordAction(
  _prevState: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const token = String(formData.get("token") || "").trim();
  const password = String(formData.get("password") || "");

  if (!token) {
    return {
      status: "error",
      message: "This reset link is invalid or has expired.",
    };
  }

  if (!password.trim()) {
    return {
      status: "error",
      message: "Password is required.",
    };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return {
      status: "error",
      message: passwordError,
    };
  }

  try {
    await confirmPasswordReset(token, password);
    return {
      status: "success",
      message: "Password updated successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to update password. Please request a new reset link.",
    };
  }
}
