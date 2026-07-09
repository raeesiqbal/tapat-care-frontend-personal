"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { TextField as Field } from "@tapat-care/ui-primitives";
import { evaluatePassword } from "@/lib/password-policy";
import { useOnboardingDraft } from "../draft/OnboardingDraftProvider";
import {
  registerCareseekerAccount,
  registerProviderAccount,
} from "../actions";
import type { OnboardingActionState, OnboardingFlowId } from "../types";
import { useValidatedForm } from "../hooks/useValidatedForm";
import { checkEmailAvailability } from "../services/email-availability";
import {
  type AccountFormField,
  type AccountFormValues,
  accountValuesFromState,
  initialAccountFormValues,
  mergeAccountFieldErrors,
  validateAccountField,
  validateAccountForm,
} from "../validation/account-validation";
import {
  hasFieldErrors,
  type FieldErrors,
} from "../validation/form-validation";
import { ExistingAccountModal } from "./ExistingAccountModal";
import { OnboardingFooter } from "./OnboardingFooter";
import { OnboardingFormFrame } from "./OnboardingFormFrame";

const initialState: OnboardingActionState = {
  status: "idle",
  message: "",
};

type EmailAvailabilityState = {
  email: string;
  message?: string;
  status: "idle" | "error";
};

const emptyStepValues: Record<string, string> = {};

function buildAccountFormData(values: AccountFormValues) {
  const formData = new FormData();

  Object.entries(values).forEach(([field, value]) => {
    formData.append(field, value);
  });

  return formData;
}

export function AccountForm({
  flowId,
  nextPath,
}: {
  flowId: OnboardingFlowId;
  nextPath: string;
}) {
  const router = useRouter();
  const {
    hydrated,
    valuesByStep,
    savedValuesByStep,
    setStepFieldValue,
    markStepSaved,
    hasSavedSnapshot,
    isStepDirty,
    clearStep,
  } = useOnboardingDraft();
  const draftValues = valuesByStep.account ?? emptyStepValues;
  const savedAccountValues = savedValuesByStep.account ?? emptyStepValues;
  const isAccountSubmitted = hasSavedSnapshot("account");
  const accountStepValues = {
    email: valuesByStep.account?.email ?? "",
  };
  const accountAction =
    flowId === "careseeker"
      ? registerCareseekerAccount
      : registerProviderAccount;
  const [state, formAction, isPending] = useActionState(
    accountAction,
    initialState,
  );
  const {
    values,
    clientErrors,
    setClientErrors,
    setHasSubmitted,
    setValues,
    handleFieldChange: handleValidatedFieldChange,
    handleFieldBlur,
  } = useValidatedForm<AccountFormValues, AccountFormField>({
    initialValues: {
      ...initialAccountFormValues,
      ...accountValuesFromState(savedAccountValues),
      ...accountValuesFromState(draftValues),
      ...accountValuesFromState(state.values),
    },
    validateField: (field, nextValues) => {
      if (
        isAccountSubmitted &&
        (field === "password" || field === "confirmPassword")
      ) {
        return undefined;
      }

      return validateAccountField(field, nextValues);
    },
    getFieldsToValidateOnChange: (field, _values, { hasSubmitted }) =>
      isAccountSubmitted &&
        (field === "password" || field === "confirmPassword")
        ? []
        : field === "password"
          ? hasSubmitted
            ? ["password", "confirmPassword"]
            : []
          : field === "confirmPassword"
            ? ["confirmPassword"]
            : [field],
    shouldValidateOnBlur: (field, _values, { hasSubmitted }) =>
      isAccountSubmitted &&
        (field === "password" || field === "confirmPassword")
        ? false
        : hasSubmitted || field !== "password",
  });
  const [emailAvailability, setEmailAvailability] =
    useState<EmailAvailabilityState>({
      email: "",
      status: "idle",
    });
  const [isEmailCheckPending, setIsEmailCheckPending] = useState(false);
  const [existingAccount, setExistingAccount] =
    useState<OnboardingActionState["existingAccount"] | null>(undefined);
  const hasHandledSuccessRef = useRef(false);
  const lastServerErrorMessageRef = useRef("");

  const passwordEvaluation = evaluatePassword(values.password);
  const asyncEmailError =
    !isAccountSubmitted &&
      emailAvailability.email === values.email.trim().toLowerCase() &&
      emailAvailability.status === "error"
      ? emailAvailability.message
      : undefined;
  const fieldErrors = mergeAccountFieldErrors(
    state.fieldErrors as FieldErrors<AccountFormField> | undefined,
    clientErrors,
    asyncEmailError ? { email: asyncEmailError } : undefined,
  );
  const submitLabel =
    hasSavedSnapshot("account") && !isStepDirty("account", accountStepValues)
      ? "Continue"
      : "Save details";

  useEffect(() => {
    if (isAccountSubmitted) {
      return;
    }

    const email = values.email.trim().toLowerCase();
    const nextValues = {
      ...initialAccountFormValues,
      email,
    };

    if (!email || validateAccountField("email", nextValues)) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsEmailCheckPending(true);

      const result = await checkEmailAvailability(email, controller.signal);

      if (controller.signal.aborted) {
        setIsEmailCheckPending(false);
        return;
      }

      setEmailAvailability({
        email,
        message: result.message,
        status: result.available || result.exists ? "idle" : "error",
      });
      if (result.exists) {
        setExistingAccount({
          email,
          isVerified: result.isVerified,
          canResumeOnboarding: result.canResumeOnboarding,
        });
      }
      setIsEmailCheckPending(false);
    }, 500);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
      setIsEmailCheckPending(false);
    };
  }, [isAccountSubmitted, values.email]);

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

    const wasAlreadySaved = hasSavedSnapshot("account");
    const hasStepChanged = isStepDirty("account", values);

    markStepSaved("account", values);

    if (wasAlreadySaved && hasStepChanged) {
      clearStep("verification");
      clearStep("personal-details");
    }

    window.location.assign(state.nextPath || nextPath);
  }, [
    clearStep,
    hasSavedSnapshot,
    isStepDirty,
    markStepSaved,
    nextPath,
    router,
    state.nextPath,
    state.status,
    state.message,
    values,
  ]);

  useEffect(() => {
    if (
      state.status !== "error" ||
      !state.message ||
      state.existingAccount
    ) {
      return;
    }

    if (lastServerErrorMessageRef.current === state.message) {
      return;
    }

    lastServerErrorMessageRef.current = state.message;
    toast.error(state.message);
  }, [state.existingAccount, state.message, state.status]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    setValues((currentValues) => {
      const mergedValues = {
        ...currentValues,
        ...draftValues,
      };
      const hasChanges = (
        Object.keys(mergedValues) as Array<keyof AccountFormValues>
      ).some((field) => mergedValues[field] !== currentValues[field]);

      return hasChanges ? mergedValues : currentValues;
    });
  }, [draftValues, hydrated, setValues]);

  function handleFieldChange(field: AccountFormField, value: string) {
    handleValidatedFieldChange(field, value);
    if (field !== "password" && field !== "confirmPassword") {
      setStepFieldValue("account", field, value);
    }

    if (!isAccountSubmitted && field === "email") {
      setEmailAvailability({
        email: "",
        status: "idle",
      });
      setIsEmailCheckPending(false);
    }
  }

  async function validateEmailForSubmit(
    nextErrors: FieldErrors<AccountFormField>,
  ) {
    if (isAccountSubmitted) {
      return {
        errors: nextErrors,
        blockedByExistingAccount: false,
      };
    }

    if (nextErrors.email) {
      return {
        errors: nextErrors,
        blockedByExistingAccount: false,
      };
    }

    const email = values.email.trim().toLowerCase();

    setIsEmailCheckPending(true);

    const result = await checkEmailAvailability(email);

    setEmailAvailability({
      email,
      message: result.message,
      status: result.available || result.exists ? "idle" : "error",
    });
    setIsEmailCheckPending(false);

    if (result.exists) {
      setExistingAccount({
        email,
        isVerified: result.isVerified,
        canResumeOnboarding: result.canResumeOnboarding,
      });
      return {
        errors: nextErrors,
        blockedByExistingAccount: true,
      };
    }

    if (result.available) {
      return {
        errors: nextErrors,
        blockedByExistingAccount: false,
      };
    }

    return {
      errors: {
        ...nextErrors,
        email:
          result.message ??
          "We could not verify this email. Please try again.",
      },
      blockedByExistingAccount: false,
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    const validationErrors = isAccountSubmitted
      ? mergeAccountFieldErrors(
        (() => {
          const errors: FieldErrors<AccountFormField> = {};
          const emailError = validateAccountField("email", values);

          if (emailError) {
            errors.email = emailError;
          }

          return errors;
        })(),
      )
      : mergeAccountFieldErrors(
        validateAccountForm(values),
        asyncEmailError ? { email: asyncEmailError } : undefined,
      );

    if (hasFieldErrors(validationErrors)) {
      setClientErrors(validationErrors);
      toast.error("Please remove form errors");
      return;
    }

    if (hasSavedSnapshot("account") && !isStepDirty("account", values)) {
      markStepSaved("account", values);
      router.push(nextPath);
      return;
    }

    if (isAccountSubmitted) {
      markStepSaved("account", values);
      router.push(nextPath);
      return;
    }

    const { errors: nextErrors, blockedByExistingAccount } =
      await validateEmailForSubmit(validationErrors);

    setClientErrors(nextErrors);

    if (blockedByExistingAccount) {
      return;
    }

    if (hasFieldErrors(nextErrors)) {
      toast.error("Please remove form errors");
      return;
    }

    startTransition(() => {
      formAction(buildAccountFormData(values));
    });
  }

  return (
    <>
      <form
        noValidate
        onSubmit={handleSubmit}
      >
        <OnboardingFormFrame>
          <div className="mb-4 grid grid-cols-1">
            <Field
              label="Email address"
              name="email"
              type="email"
              placeholder="naomi@example.com"
              autoComplete="email"
              required
              value={values.email}
              error={fieldErrors.email}
              readOnly={isAccountSubmitted}
              onBlur={() => handleFieldBlur("email")}
              onChange={(event) =>
                handleFieldChange("email", event.target.value)
              }
            />
          </div>
          <div className="grid grid-cols-1">
            {!isAccountSubmitted ? (
              <>
                <div className="mb-4">
                  <Field
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="12+ characters"
                    autoComplete="new-password"
                    required
                    value={values.password}
                    error={fieldErrors.password}
                    onBlur={() => handleFieldBlur("password")}
                    onChange={(event) =>
                      handleFieldChange("password", event.target.value)
                    }
                  />
                </div>
                <div>
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
              </>
            ) : null}
          </div>

          {!isAccountSubmitted ? (
            <div className="mt-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      values.password && passwordEvaluation.score >= item
                        ? "bg-primary"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-2 flex items-center justify-end gap-4">
                {values.password ? (
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
          ) : (
            <p className="mt-4 text-sm text-gray-600">
              This account is already created. Email and password can&apos;t be
              changed here.
            </p>
          )}
        </OnboardingFormFrame>
        <OnboardingFooter
          submitLabel={submitLabel}
          isPending={isPending}
          submitDisabled={!isAccountSubmitted && isEmailCheckPending}
        />
      </form>
      <ExistingAccountModal
        account={
          existingAccount === undefined
            ? (state.existingAccount ?? null)
            : existingAccount
        }
        onClose={() => setExistingAccount(null)}
        onDiscard={() => {
          setExistingAccount(null);
          setEmailAvailability({ email: "", status: "idle" });
          setValues((current) => ({ ...current, email: "" }));
          setStepFieldValue("account", "email", "");
          setClientErrors((current) => ({ ...current, email: undefined }));
        }}
      />
    </>
  );
}
