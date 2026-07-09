"use client";

import { startTransition, useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Modal } from "@/components/ui/Modal";
import { resendVerificationEmail } from "../actions";
import type { OnboardingActionState } from "../types";

const initialState: OnboardingActionState = {
  status: "idle",
  message: "",
};

type ExistingAccountModalProps = {
  account: {
    email: string;
    isVerified: boolean;
    canResumeOnboarding: boolean;
  } | null;
  onDiscard: () => void;
  onClose: () => void;
};

export function ExistingAccountModal({
  account,
  onDiscard,
  onClose,
}: ExistingAccountModalProps) {
  const [resendState, resendAction, isResendPending] = useActionState(
    resendVerificationEmail,
    initialState,
  );
  const description = account?.isVerified
    ? "This email is already registered. Log in to resume onboarding from the last saved step."
    : "This email is already registered but has not been verified. Request a new verification email to continue onboarding.";

  useEffect(() => {
    if (!resendState.message) {
      return;
    }

    if (resendState.status === "success") {
      toast.success(resendState.message);
    } else if (resendState.status === "error") {
      toast.error(resendState.message);
    }
  }, [resendState.message, resendState.status]);

  function handleResendVerification() {
    if (!account?.email) {
      return;
    }

    const formData = new FormData();
    formData.set("email", account.email);
    startTransition(() => resendAction(formData));
  }

  return (
    <Modal
      open={Boolean(account)}
      title="Account already exists"
      description={description}
      onClose={onClose}
    >
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onDiscard}
          className="inline-flex h-11 items-center justify-center rounded-[8px] border border-gray-200 px-5 text-sm font-semibold text-gray-800 transition hover:border-gray-300 hover:bg-gray-50"
        >
          Discard
        </button>
        {account?.isVerified ? (
          <Link
            href={`/login?email=${encodeURIComponent(account.email)}`}
            className="inline-flex h-11 items-center justify-center rounded-[8px] bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Log in
          </Link>
        ) : (
          <button
            type="button"
            disabled={isResendPending}
            onClick={handleResendVerification}
            className="inline-flex h-11 items-center justify-center rounded-[8px] bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResendPending ? "Sending..." : "Resend verification"}
          </button>
        )}
      </div>
    </Modal>
  );
}
