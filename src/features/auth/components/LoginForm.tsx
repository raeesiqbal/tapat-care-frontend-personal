"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { TextField as Field } from "@tapat-care/ui-primitives";
import { loginProviderAccount } from "@/features/onboarding/actions";
import type { OnboardingActionState } from "@/features/onboarding/types";
import { CrossZoneRedirect } from "@/features/auth/components/CrossZoneRedirect";
import {
  getCrossZoneNavigationHref,
  isCrossZonePath,
} from "@/lib/cross-zone-navigation";

const initialState: OnboardingActionState = {
  status: "idle",
  message: "",
  submissionId: 0,
};

export { CrossZoneRedirect };

export function LoginForm({
  initialEmail = "",
  passwordStatus = "",
}: {
  initialEmail?: string;
  passwordStatus?: string;
}) {
  const hasHandledSuccessRef = useRef(false);
  const hasHandledPasswordStatusRef = useRef(false);
  const [state, formAction, isPending] = useActionState(
    loginProviderAccount,
    initialState,
  );

  useEffect(() => {
    if (
      passwordStatus !== "changed" ||
      hasHandledPasswordStatusRef.current
    ) {
      return;
    }

    hasHandledPasswordStatusRef.current = true;
    toast.success("Password updated successfully. Please log in again.");

    const url = new URL(window.location.href);
    url.searchParams.delete("password_status");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [passwordStatus]);

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

    const nextPath = state.nextPath || "/dashboard";

    window.location.assign(
      isCrossZonePath(nextPath)
        ? getCrossZoneNavigationHref(nextPath)
        : nextPath,
    );
  }, [state.message, state.nextPath, state.status]);

  useEffect(() => {
    if (state.status === "error" && state.message) {
      if (state.requiresEmailVerification) {
        return;
      }
      toast.error(state.message);
    }
  }, [
    state.message,
    state.requiresEmailVerification,
    state.status,
    state.submissionId,
  ]);

  return (
    <form noValidate action={formAction}>
      <div>
        <div className="grid grid-cols-1 gap-6">
          <Field
            label="Email address"
            name="email"
            type="email"
            placeholder="naomi@example.com"
            autoComplete="email"
            required
            defaultValue={state.values?.email ?? initialEmail}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            defaultValue=""
          />
        </div>
        <div className="mt-5 flex justify-end text-sm">
          <Link
            href="/forgot-password"
            className="font-semibold text-primary transition hover:text-primary-hover"
          >
            Forgot password?
          </Link>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full h-12 items-center justify-center rounded-[8px] bg-primary px-6 text-[15px] font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Logging in..." : "Log in"}
        </button>
      </div>
      <div className="mt-5 flex justify-center text-sm">
        <span className="mr-2 text-gray-600">New to our platform?</span>
        <Link
          href="/get-started"
          className="font-semibold text-primary transition hover:text-primary-hover"
        >
          Join Tapat
        </Link>
      </div>
    </form>
  );
}
