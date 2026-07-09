"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { TextField as Field } from "@tapat-care/ui-primitives";
import { resendVerificationEmail } from "@/features/onboarding/actions";
import type { OnboardingActionState } from "@/features/onboarding/types";

const initialState: OnboardingActionState = {
  status: "idle",
  message: "",
};

export function VerificationRecoveryForm({
  initialEmail,
}: {
  initialEmail: string;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [state, action, isPending] = useActionState(
    resendVerificationEmail,
    initialState,
  );

  useEffect(() => {
    if (!state.message) {
      return;
    }
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state.message, state.status]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("email", email);
    startTransition(() => action(formData));
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="mt-7">
      <Field
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        error={state.fieldErrors?.email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <button
        type="submit"
        disabled={isPending}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-[8px] bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
      >
        {isPending ? "Sending..." : "Send a new verification email"}
      </button>
      <Link
        href={`/login?email=${encodeURIComponent(email)}`}
        className="mt-4 block text-center text-sm font-semibold text-primary"
      >
        Return to login
      </Link>
    </form>
  );
}
