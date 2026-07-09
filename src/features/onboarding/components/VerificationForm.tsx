"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Check, Clock, Shield, Smartphone, SquarePen } from "lucide-react";
import { InfoCallout } from "@tapat-care/ui-primitives";
import { Modal } from "@/components/ui/Modal";
import {
  resetProviderPhoneVerification,
  sendProviderPhoneVerificationCode,
  type PhoneVerificationActionState,
  verifyCareseekerPhoneCode,
  verifyProviderPhoneCode,
} from "../actions";
import { useOnboardingDraft } from "../draft/OnboardingDraftProvider";
import type { OnboardingFlowId } from "../types";
import { OnboardingFooter } from "./OnboardingFooter";

const idleState: PhoneVerificationActionState = {
  status: "idle",
  message: "",
};

function normalizePhoneInput(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "").slice(0, 11);

  if (!digits) {
    return trimmed.startsWith("+") ? "+" : "";
  }

  return `+${digits}`;
}

export function VerificationForm({
  flowId,
  nextPath,
  initialPhone = "",
  initialPhoneVerified = false,
}: {
  flowId: OnboardingFlowId;
  nextPath: string;
  initialPhone?: string;
  initialPhoneVerified?: boolean;
}) {
  const router = useRouter();
  const { valuesByStep, setStepValues, markStepSaved } = useOnboardingDraft();
  const [sendState, sendAction, isSending] = useActionState(
    sendProviderPhoneVerificationCode,
    idleState,
  );
  const verifyPhoneAction =
    flowId === "careseeker"
      ? verifyCareseekerPhoneCode
      : verifyProviderPhoneCode;
  const [verifyState, verifyAction, isVerifying] = useActionState(
    verifyPhoneAction,
    idleState,
  );
  const [resetState, resetAction, isResetting] = useActionState(
    resetProviderPhoneVerification,
    idleState,
  );
  const [code, setCode] = useState("");
  const backendPhone = normalizePhoneInput(initialPhone);
  const draftPhone = normalizePhoneInput(
    valuesByStep.verification?.phone || "",
  );
  const savedPhoneVerified =
    valuesByStep.verification?.phoneVerified === "true" || initialPhoneVerified;
  const [phoneInput, setPhoneInput] = useState(draftPhone || backendPhone);
  const [invalidatedSentSubmissionId, setInvalidatedSentSubmissionId] =
    useState(0);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);

  const hasConfirmedPhoneChange =
    resetState.status === "success" && resetState.submissionId !== undefined;
  const enteredPhone = phoneInput.trim();
  const phone = enteredPhone;
  const isPhoneComplete = /^\+\d{11}$/.test(phone);
  const activeSentPhone = sendState.sentPhone?.trim() || "";
  const activeSentSubmissionId = sendState.sentSubmissionId ?? 0;
  const isBusy = isSending || isVerifying || isResetting;
  const isPhoneVerifiedLocked =
    !hasConfirmedPhoneChange &&
    (savedPhoneVerified || Boolean(verifyState.verified));
  const hasCodeSent =
    !isPhoneVerifiedLocked &&
    Boolean(activeSentPhone) &&
    activeSentPhone === enteredPhone &&
    activeSentSubmissionId > invalidatedSentSubmissionId;
  const resendDelay = sendState.retryAfter ?? 0;
  const verificationValues = useMemo(
    () => ({
      phone,
      phoneVerified:
        isPhoneVerifiedLocked || verifyState.verified ? "true" : "false",
    }),
    [isPhoneVerifiedLocked, phone, verifyState.verified],
  );

  useEffect(() => {
    setStepValues("verification", verificationValues);
  }, [setStepValues, verificationValues]);

  useEffect(() => {
    if (!sendState.submissionId || !sendState.message) {
      return;
    }

    if (sendState.status === "success") {
      toast.success(sendState.message);
    } else if (sendState.status === "error") {
      toast.error(sendState.message);
    }
  }, [sendState.message, sendState.status, sendState.submissionId]);

  useEffect(() => {
    if (!verifyState.submissionId || !verifyState.message) {
      return;
    }

    if (verifyState.status === "success") {
      toast.success(verifyState.message);
    } else if (verifyState.status === "error") {
      toast.error(verifyState.message);
    }
  }, [verifyState.message, verifyState.status, verifyState.submissionId]);

  useEffect(() => {
    if (!resetState.submissionId || !resetState.message) {
      return;
    }

    if (resetState.status === "success") {
      toast.success(resetState.message);
    } else if (resetState.status === "error") {
      toast.error(resetState.message);
    }
  }, [resetState.message, resetState.status, resetState.submissionId]);

  useEffect(() => {
    if (verifyState.status !== "success" || !verifyState.nextPath) {
      return;
    }
    markStepSaved("verification", verificationValues);
    router.push(verifyState.nextPath);
  }, [
    markStepSaved,
    router,
    verificationValues,
    verifyState.nextPath,
    verifyState.status,
  ]);

  function handleVerifySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPhoneVerifiedLocked) {
      markStepSaved("verification", verificationValues);
      router.push(nextPath);
      return;
    }

    if (!hasCodeSent) {
      return;
    }

    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("code", code);
    startTransition(() => {
      verifyAction(formData);
    });
  }

  function handleSendCode() {
    if (!isPhoneComplete) {
      return;
    }
    setCode("");
    const formData = new FormData();
    formData.append("phone", enteredPhone);
    startTransition(() => {
      sendAction(formData);
    });
  }

  function handlePhoneChange(value: string) {
    setPhoneInput(normalizePhoneInput(value));
    setInvalidatedSentSubmissionId(sendState.sentSubmissionId ?? 0);
    setCode("");
  }

  function handleConfirmPhoneChange() {
    setIsChangeModalOpen(false);
    setPhoneInput("");
    setCode("");
    setInvalidatedSentSubmissionId(sendState.sentSubmissionId ?? 0);
    startTransition(() => {
      resetAction();
    });
  }

  return (
    <>
      <form
        noValidate
        onSubmit={handleVerifySubmit}
        className="rounded-[8px] border border-gray-100 bg-white p-6 shadow-card sm:p-8 lg:p-10"
      >
        <div className="max-w-[786px]">
          <label className="block">
            <span className="mb-2 block text-[15px] font-semibold text-gray-900">
              Phone number
            </span>
            <div className="flex h-[58px] items-center gap-3 rounded-[8px] border border-gray-200 bg-white px-4">
              <Smartphone className="h-5 w-5 shrink-0 text-gray-400" />
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phoneInput}
                readOnly={isPhoneVerifiedLocked}
                onChange={(event) => handlePhoneChange(event.target.value)}
                placeholder="+15555551234"
                inputMode="tel"
                maxLength={12}
                className="h-full flex-1 bg-transparent text-[16px] font-medium text-gray-900 outline-none placeholder:text-gray-400 read-only:cursor-default"
              />
              {isPhoneVerifiedLocked ? (
                <>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <Check className="h-4 w-4" />
                    Verified
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsChangeModalOpen(true)}
                    aria-label="Edit phone number"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-primary transition hover:bg-violet-50 hover:text-primary-hover focus:outline-none focus:ring-2 focus:ring-violet-200"
                  >
                    <SquarePen className="h-4 w-4" />
                  </button>
                </>
              ) : null}
            </div>
          </label>

          {isPhoneVerifiedLocked ? (
            <div className="mt-8 flex gap-4 rounded-[8px] border border-emerald-100 bg-emerald-50 p-5">
              <Shield className="mt-1 h-7 w-7 shrink-0 text-emerald-600" />
              <p className="text-[15px] leading-6 text-gray-700">
                Your phone number is already verified. You can continue
                onboarding normally, or edit the number if you need to verify a
                replacement.
              </p>
            </div>
          ) : (
            <>
              {hasCodeSent && (
                <InfoCallout
                  icon={<Check className="h-4 w-4" />}
                  className="mt-7"
                >
                  {`Code sent to ${phoneInput}.`}
                </InfoCallout>
              )}
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isSending || !isPhoneComplete}
                className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-[8px] bg-primary px-6 text-[15px] font-Regular text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending
                  ? "Sending..."
                  : hasCodeSent
                    ? "Resend code"
                    : "Send code"}
              </button>

              {hasCodeSent ? (
                <div className="mt-8 border-t border-gray-100 pt-7">
                  <label
                    htmlFor="code"
                    className="block text-[15px] font-semibold text-gray-900"
                  >
                    Enter the 6-digit code
                  </label>
                  <input
                    id="code"
                    name="code"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="483216"
                    className="mt-4 h-[72px] w-full max-w-[486px] rounded-[8px] border border-gray-200 bg-white px-5 text-center text-[30px] font-semibold tracking-[0.5em] text-gray-950 outline-none focus:border-primary focus:ring-4 focus:ring-violet-100"
                  />
                  <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {resendDelay > 0
                        ? `If you need another code, wait about ${resendDelay}s before resending.`
                        : "You can request a new code if needed."}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="mt-8 flex gap-4 rounded-[8px] border border-gray-100 bg-gray-50 p-5">
                <Shield className="mt-1 h-7 w-7 shrink-0 text-primary" />
                <p className="text-[15px] leading-6 text-gray-600">
                  Verification is required before you can continue. This is a
                  one-time check for your Tapat Care account.
                </p>
              </div>
            </>
          )}
        </div>
        <OnboardingFooter
          submitLabel="Continue"
          isPending={isBusy}
          submitDisabled={
            isPhoneVerifiedLocked
              ? false
              : !hasCodeSent || !isPhoneComplete || code.trim().length !== 6
          }
        />
      </form>

      <Modal
        open={isChangeModalOpen}
        title="Change verified phone number?"
        description="Your current verified phone number will be immediately unlinked from your account. You will need to verify a new phone number before you can continue onboarding."
        onClose={() => setIsChangeModalOpen(false)}
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setIsChangeModalOpen(false)}
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-gray-200 px-5 text-sm font-semibold text-gray-800 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmPhoneChange}
            className="inline-flex h-11 items-center justify-center rounded-[8px] bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Change phone number
          </button>
        </div>
      </Modal>
    </>
  );
}
