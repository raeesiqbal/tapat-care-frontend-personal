"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { TextField as Field } from "@tapat-care/ui-primitives";
import { resendVerificationEmail } from "@/features/onboarding/actions";
import type { OnboardingActionState } from "@/features/onboarding/types";

const initialState: OnboardingActionState = {
  status: "idle",
  message: "",
};

type VerificationFormProps = {
  initialEmail?: string;
  source?: "login" | "registration";
};

export function VerificationForm({
  initialEmail = "",
  source = "registration",
}: VerificationFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [state, action, isPending] = useActionState(
    resendVerificationEmail,
    initialState,
  );
  const showResendNotice = source !== "login" || state.status === "success";
  const isEmailLocked = source === "registration" && Boolean(initialEmail);

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.status === "success") {
      toast.success(state.message);
      return;
    }

    toast.error(state.message);
  }, [state.message, state.status]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("email", email);
    startTransition(() => action(formData));
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="mt-7">
      <div className="max-w-[520px]">
        <div className="flex gap-4 rounded-[8px] border border-violet-100 bg-violet-50 p-5">
          <Mail className="mt-1 h-6 w-6 shrink-0 text-primary" />
          <div>
            <h2 className="font-semibold text-gray-950">
              {source === "login" ? "Request a new link" : "Check your inbox"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {source === "login"
                ? "We found an unverified account for this email. Use your latest verification link, or request a new one below."
                : "We sent a single-use verification link to your email. Open it on this device to verify your account and continue onboarding."}
            </p>
          </div>
        </div>

        <div className="mt-7">
          <Field
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            readOnly={isEmailLocked}
            error={state.fieldErrors?.email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {showResendNotice ? (
          <div className="mt-7 flex gap-4 rounded-[8px] border border-gray-100 bg-gray-50 p-5">
            <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-primary" />
            <p className="text-sm leading-6 text-gray-600">
              The link expires after 24 hours. Requesting another email
              invalidates the previous link.
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 w-full items-center justify-center rounded-[8px] bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60 sm:w-auto"
          >
            {isPending ? "Sending..." : "Resend email"}
          </button>
        </div>
      </div>
    </form>
  );
}
