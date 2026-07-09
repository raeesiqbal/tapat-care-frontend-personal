"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { TextField as Field } from "@tapat-care/ui-primitives";
import { evaluatePassword } from "@/lib/password-policy";
import {
  initialResetPasswordValues,
  validateResetPasswordForm,
} from "../validation/reset-password-validation";
import {
  resetPasswordAction,
  type PasswordResetState,
} from "../actions/password-reset-actions";

const initialState: PasswordResetState = {
  status: "idle",
  message: "",
};

type ResetPasswordFormProps = {
  token: string | null;
  isTokenValid: boolean;
};

export function ResetPasswordForm({
  token,
  isTokenValid,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialResetPasswordValues);
  const [errors, setErrors] = useState<
    Partial<Record<"password" | "confirmPassword", string>>
  >({});
  const hasHandledSuccessRef = useRef(false);
  const lastServerErrorMessageRef = useRef("");
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  const passwordEvaluation = useMemo(
    () => evaluatePassword(values.password),
    [values.password],
  );

  useEffect(() => {
    if (state.status !== "success") {
      hasHandledSuccessRef.current = false;
      return;
    }

    if (hasHandledSuccessRef.current) {
      return;
    }

    hasHandledSuccessRef.current = true;

    if (state.message) {
      toast.success(state.message);
    }

    router.replace("/login");
  }, [router, state.message, state.status]);

  useEffect(() => {
    if (state.status !== "error" || !state.message) {
      return;
    }

    if (lastServerErrorMessageRef.current === state.message) {
      return;
    }

    lastServerErrorMessageRef.current = state.message;
    toast.error(state.message);
  }, [state.message, state.status]);

  useEffect(() => {
    if (isTokenValid) {
      return;
    }

    setErrors({});
  }, [isTokenValid]);

  function handleFieldChange(
    field: "password" | "confirmPassword",
    value: string,
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateResetPasswordForm(values);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please remove form errors.");
      return;
    }

    if (!isTokenValid || !token) {
      toast.error("This reset link is invalid or has expired.");
      return;
    }
    const formData = new FormData();
    formData.append("token", token);
    formData.append("password", values.password);
    startTransition(() => {
      formAction(formData);
    });
  }
  if (!isTokenValid) {
    return (
      <div>
        <h1 className="text-[24px] font-semibold text-gray-950">
          Invalid or expired link
        </h1>

        <p className="mt-2 text-[16px] text-gray-600">
          This password reset link is invalid or has expired.
        </p>

        <Link
          href="/forgot-password"
          className="mt-6 inline-flex rounded-xl bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover"
        >
          Request new reset link
        </Link>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-gray-950">
          Reset your password
        </h1>
        <p className="mt-2 text-[16px] text-gray-600">Enter your new password below.</p>
      </div>
      <form noValidate onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <Field
            label="New password"
            name="password"
            type="password"
            placeholder="Enter new password"
            required
            value={values.password}
            error={errors.password}
            onChange={(event) =>
              handleFieldChange("password", event.target.value)
            }
          />
          <Field
            label="Confirm password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            required
            value={values.confirmPassword}
            error={errors.confirmPassword}
            onChange={(event) =>
              handleFieldChange("confirmPassword", event.target.value)
            }
          />
        </div>
        <div className="mt-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className={`h-2 flex-1 rounded-full transition-all ${values.password && passwordEvaluation.score >= item
                  ? "bg-primary"
                  : "bg-gray-200"
                  }`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-end gap-4">
            {values.password ? (
              <span
                className={`text-sm font-medium ${passwordEvaluation.strength === "weak"
                  ? "text-red-500"
                  : passwordEvaluation.strength === "medium"
                    ? "text-yellow-500"
                    : "text-primary"
                  }`}
              >
                {passwordEvaluation.label}
              </span>
            ) : null}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Use at least 12 characters and include one lowercase letter, one
            uppercase letter, one number, and one special character.
          </p>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full h-12 mt-6 items-center justify-center rounded-[8px] bg-primary px-6 text-[15px] font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Updating password..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
