"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "react-toastify";
import {
  completeProviderManualScreening,
  processProviderScreeningReturn,
  startProviderScreeningCheckout,
} from "../actions";
import { OnboardingFormFrame } from "./OnboardingFormFrame";

type Props = {
  previousPath: string;
};

type CurrentOrder = {
  status: string | null;
  invitationUrl: string | null;
};

const FEE_DOLLARS = "$29.99";
const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 30; // ~45s

async function fetchCurrentOrder(): Promise<CurrentOrder | null> {
  try {
    const response = await fetch("/api/onboarding/provider/screening-order", {
      method: "GET",
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as CurrentOrder;
  } catch {
    return null;
  }
}

export function ScreeningPaymentForm({ previousPath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const wasCanceled = searchParams.get("canceled") === "1";

  const [isPending, startTransition] = useTransition();
  const [isProcessingReturn, setIsProcessingReturn] = useState(Boolean(sessionId));
  const [pollMessage, setPollMessage] = useState(
    sessionId ? "Confirming your secure payment..." : "",
  );
  const handledSessionRef = useRef<string | null>(null);

  const handleStart = useCallback(() => {
    startTransition(async () => {
      const result = await startProviderScreeningCheckout();
      if (result.status === "success") {
        window.location.href = result.checkoutUrl;
        return;
      }
      if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }, []);

  useEffect(() => {
    if (wasCanceled) {
      toast.info("Payment was canceled. You can resume anytime.");
    }
  }, [wasCanceled]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    if (handledSessionRef.current === sessionId) {
      return;
    }
    handledSessionRef.current = sessionId;

    let cancelled = false;

    const run = async () => {
      const result = await processProviderScreeningReturn(sessionId);
      if (cancelled) return;

      if (result.status === "error") {
        toast.error(result.message);
        setIsProcessingReturn(false);
        setPollMessage("");
        return;
      }

      if (result.invitationUrl) {
        window.location.href = result.invitationUrl;
        return;
      }

      if (result.orderStatus === "payment_authorized") {
        setPollMessage("Completing your background screening...");
        const completion = await completeProviderManualScreening();
        if (cancelled) return;
        if (completion.status === "ok") {
          if (completion.invitationUrl) {
            window.location.href = completion.invitationUrl;
            return;
          }
          if (completion.orderStatus === "payment_captured") {
            router.push("/onboarding/provider/submitted");
            return;
          }
        }
        if (completion.status === "error") {
          toast.error(completion.message);
          setIsProcessingReturn(false);
          setPollMessage("");
          return;
        }
      }

      setPollMessage("Preparing your background screening...");
      for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt += 1) {
        if (cancelled) return;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        const current = await fetchCurrentOrder();
        if (cancelled) return;
        if (current?.invitationUrl) {
          window.location.href = current.invitationUrl;
          return;
        }
        if (current?.status === "payment_captured") {
          // Already complete - move on to submitted.
          router.push("/onboarding/provider/submitted");
          return;
        }
      }

      setIsProcessingReturn(false);
      setPollMessage("");
      toast.error(
        "Your payment was authorized but we are still preparing your screening. Please refresh in a moment.",
      );
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  if (isProcessingReturn) {
    return (
      <OnboardingFormFrame>
        <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden
          />
          <p className="text-[16px] font-semibold text-gray-950">
            {pollMessage || "Confirming your secure payment..."}
          </p>
          <p className="max-w-[420px] text-sm text-gray-500">
            Please keep this page open. We are creating your background
            screening application.
          </p>
        </div>
      </OnboardingFormFrame>
    );
  }

  return (
    <div>
      <OnboardingFormFrame>
        <section className="flex flex-col gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-[18px] font-semibold text-gray-950">
              Why a safety screening?
            </h2>
            <ul className="mt-4 space-y-3 text-[15px] leading-6 text-gray-700">
              <li className="flex gap-3">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Builds trust with the families you care for.
              </li>
              <li className="flex gap-3">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Performed by our verified background-check partner.
              </li>
              <li className="flex gap-3">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                One-time fee. Lets you appear in family search results.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[18px] font-semibold text-gray-950">
                Background screening fee
              </h2>
              <p className="text-[20px] font-semibold text-gray-950">
                {FEE_DOLLARS}
              </p>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Authorized today, charged after you complete the screening
              application with our verified partner.
            </p>
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-[13px] font-medium text-amber-900">
              You will not be charged until you complete the background
              screening application.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-[13px] text-gray-600">
            Payments are processed by Stripe. Tapat Care never sees your card
            number.
          </div>
        </section>
      </OnboardingFormFrame>

      <div className="mt-10 flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {previousPath ? (
            <Link
              href={previousPath}
              className="inline-flex h-11 items-center justify-center rounded-[8px] border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-950"
            >
              Back
            </Link>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleStart}
          disabled={isPending}
          className="inline-flex h-12 min-w-[220px] items-center justify-center rounded-[8px] bg-primary px-6 text-[15px] font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Redirecting..." : "Continue to secure payment"}
        </button>
      </div>
    </div>
  );
}
