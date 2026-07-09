"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { LockKeyhole } from "lucide-react";
import {
  notifyFormErrors,
  TextField as Field,
} from "@tapat-care/ui-primitives";
import {
  evaluatePassword,
  hasChangePasswordFieldErrors,
  initialChangePasswordFormValues,
  mergeChangePasswordFieldErrors,
  validateChangePasswordField,
  validateChangePasswordForm,
  type ChangePasswordFieldErrors,
  type ChangePasswordFormField,
  type ChangePasswordFormValues,
} from "@tapat-care/api-contracts";

type DashboardChangePasswordSubmitState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: ChangePasswordFieldErrors;
  redirectHref?: string;
  submissionId?: number;
};

const initialSubmitState: DashboardChangePasswordSubmitState = {
  status: "idle",
  message: "",
};

function buildFormData(values: ChangePasswordFormValues) {
  const formData = new FormData();

  Object.entries(values).forEach(([field, value]) => {
    formData.append(field, value);
  });

  return formData;
}

export function ChangePasswordForm() {
  const [state, setState] = useState(initialSubmitState);
  const [values, setValues] = useState(initialChangePasswordFormValues);
  const [clientErrors, setClientErrors] = useState<ChangePasswordFieldErrors>(
    {},
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const nextSubmissionIdRef = useRef(0);
  const lastToastSubmissionIdRef = useRef<number | undefined>(undefined);
  const lastRedirectSubmissionIdRef = useRef<number | undefined>(undefined);

  const passwordEvaluation = useMemo(
    () => evaluatePassword(values.newPassword),
    [values.newPassword],
  );
  const fieldErrors = mergeChangePasswordFieldErrors(
    state.status === "error" ? state.fieldErrors : undefined,
    clientErrors,
  );
  const isRedirectingToLogin =
    state.status === "success" && Boolean(state.redirectHref);

  useEffect(() => {
    if (state.status === "idle" || state.submissionId === undefined) {
      return;
    }

    if (
      state.message &&
      lastToastSubmissionIdRef.current !== state.submissionId
    ) {
      lastToastSubmissionIdRef.current = state.submissionId;

      if (state.status === "success") {
        if (!state.redirectHref) {
          toast.success(state.message);
        }
      } else {
        toast.error(state.message);
      }
    }

    if (
      state.status === "success" &&
      state.redirectHref &&
      lastRedirectSubmissionIdRef.current !== state.submissionId
    ) {
      lastRedirectSubmissionIdRef.current = state.submissionId;
      window.location.assign(state.redirectHref);
    }
  }, [state.message, state.redirectHref, state.status, state.submissionId]);

  function updateClientErrors(
    field: ChangePasswordFormField,
    nextValues: ChangePasswordFormValues,
  ) {
    setClientErrors((currentErrors) => {
      const fieldsToValidate: ChangePasswordFormField[] =
        field === "newPassword" && hasSubmitted
          ? ["newPassword", "confirmPassword"]
          : [field];
      const nextErrors = { ...currentErrors };

      fieldsToValidate.forEach((fieldToValidate) => {
        const error = validateChangePasswordField(fieldToValidate, nextValues);

        if (error) {
          nextErrors[fieldToValidate] = error;
          return;
        }

        delete nextErrors[fieldToValidate];
      });

      return nextErrors;
    });
  }

  function handleFieldChange(field: ChangePasswordFormField, value: string) {
    const nextValues = {
      ...values,
      [field]: value,
    };

    setValues(nextValues);

    if (hasSubmitted || clientErrors[field]) {
      updateClientErrors(field, nextValues);
    }
  }

  function handleFieldBlur(field: ChangePasswordFormField) {
    updateClientErrors(field, values);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    const validationErrors = validateChangePasswordForm(values);
    setClientErrors(validationErrors);

    if (hasChangePasswordFieldErrors(validationErrors)) {
      notifyFormErrors();
      return;
    }

    const nextSubmissionId = nextSubmissionIdRef.current + 1;
    nextSubmissionIdRef.current = nextSubmissionId;
    setState(initialSubmitState);
    setIsPending(true);

    try {
      const response = await fetch(
        "/dashboard/settings/password-security/update-password",
        {
          body: buildFormData(values),
          cache: "no-store",
          method: "POST",
        },
      );
      const result = (await response
        .json()
        .catch(() => null)) as DashboardChangePasswordSubmitState | null;

      setState({
        ...(result ?? {
          status: "error",
          message: response.ok
            ? "Password updated, but the login handoff could not start."
            : "We could not update your password.",
        }),
        submissionId: nextSubmissionId,
      });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "We could not update your password.",
        submissionId: nextSubmissionId,
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="w-full rounded-[20px] border border-gray-100 bg-white p-6 shadow-card sm:p-8 lg:p-10">
        <div className="max-w-[680px]">
          <div className="flex items-center gap-3">
            <div className="flex h-10  items-center justify-center rounded-[8px] bg-primary/10 text-primary">
              <LockKeyhole className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="text-[18px] font-semibold text-gray-950">
              Change password
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Choose a strong password that you do not use anywhere else.
          </p>
        </div>

        <div className="mt-6 grid max-w-[680px] grid-cols-1 gap-5">
          <Field
            label="Current password"
            name="currentPassword"
            type="password"
            placeholder="Enter current password"
            autoComplete="current-password"
            required
            value={values.currentPassword}
            error={fieldErrors.currentPassword}
            onBlur={() => handleFieldBlur("currentPassword")}
            onChange={(event) =>
              handleFieldChange("currentPassword", event.target.value)
            }
          />
          <Field
            label="New password"
            name="newPassword"
            type="password"
            placeholder="12+ characters"
            autoComplete="new-password"
            required
            value={values.newPassword}
            error={fieldErrors.newPassword}
            onBlur={() => handleFieldBlur("newPassword")}
            onChange={(event) =>
              handleFieldChange("newPassword", event.target.value)
            }
          />
          <Field
            label="Confirm password"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            autoComplete="new-password"
            required
            value={values.confirmPassword}
            error={fieldErrors.confirmPassword}
            onBlur={() => handleFieldBlur("confirmPassword")}
            onChange={(event) =>
              handleFieldChange("confirmPassword", event.target.value)
            }
          />
        </div>

        <div className="mt-3 max-w-[680px]">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className={`h-2 flex-1 rounded-full transition-all ${
                  values.newPassword && passwordEvaluation.score >= item
                    ? "bg-primary"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <div className="mt-2 flex items-center justify-end gap-4">
            {values.newPassword ? (
              <span
                className={`text-sm font-medium ${
                  passwordEvaluation.strength === "weak"
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

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-[8px] bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || isRedirectingToLogin}
          >
            {isRedirectingToLogin
              ? "Opening login..."
              : isPending
                ? "Updating..."
                : "Update password"}
          </button>
        </div>
      </div>
    </form>
  );
}
