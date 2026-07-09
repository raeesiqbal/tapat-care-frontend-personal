"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

const TOAST_BY_STATUS = {
  already_verified: {
    level: "info",
    message: "This email is already verified. Continuing onboarding...",
  },
  expired: {
    level: "error",
    message: "This verification link has expired.",
  },
  failed: {
    level: "error",
    message: "Email verification is temporarily unavailable.",
  },
  invalid: {
    level: "error",
    message: "This verification link is invalid.",
  },
  login_unverified: {
    level: "info",
    message: "Please verify your email to continue.",
  },
  verified: {
    level: "success",
    message:
      "Email verified successfully. Please verify your phone number to continue.",
  },
} as const;

export function VerificationToastBridge() {
  const handledKeyRef = useRef("");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationStatus = searchParams.get("verification_status");

  useEffect(() => {
    if (!verificationStatus) {
      handledKeyRef.current = "";
      return;
    }

    const definition =
      TOAST_BY_STATUS[verificationStatus as keyof typeof TOAST_BY_STATUS];
    if (!definition) {
      return;
    }

    const handledKey = `${pathname}?${searchParams.toString()}`;
    if (handledKeyRef.current === handledKey) {
      return;
    }

    handledKeyRef.current = handledKey;

    if (definition.level === "success") {
      toast.success(definition.message);
    } else if (definition.level === "info") {
      toast.info(definition.message);
    } else {
      toast.error(definition.message);
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("verification_status");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams, verificationStatus]);

  return null;
}
