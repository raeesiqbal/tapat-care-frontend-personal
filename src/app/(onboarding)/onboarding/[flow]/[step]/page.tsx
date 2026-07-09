import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getOnboardingFlow,
  getOnboardingStep,
} from "@/features/onboarding/registry";
import { OnboardingShell } from "@/features/onboarding/components/OnboardingShell";
import { ProviderStep } from "@/features/onboarding/components/ProviderStep";
import type { OnboardingStepId } from "@/features/onboarding/types";
import {
  buildLoginRedirectPath,
  canAccessCareseekerStep,
  canAccessProviderStep,
  getAccessRedirectPath,
  resolveOnboardingAccess,
} from "@/lib/onboarding-access";

type OnboardingStepPageProps = {
  params: Promise<{
    flow: string;
    step: string;
  }>;
};

export const metadata: Metadata = {
  title: "Onboarding - Tapat Care",
  description: "Start your Tapat Care onboarding.",
};

const FORM_MAX_WIDTH_BY_STEP: Record<OnboardingStepId, string> = {
  account: "max-w-[600px]",
  verification: "max-w-[600px]",
  "personal-details": "max-w-[900px]",
  "care-needs": "max-w-[900px]",
  "skills-availability": "max-w-[900px]",
  "qualifications-experience": "max-w-[1000px]",
  review: "max-w-[900px]",
  "screening-payment": "max-w-[700px]",
  submitted: "max-w-[900px]",
};

function getCareseekerSubmittedStatusCopy(accountStatus: string) {
  switch (accountStatus) {
    case "rejected":
      return {
        eyebrow: "DASHBOARD ACCESS",
        title: "You cannot access the dashboard right now",
        description:
          "Your account has been rejected, so dashboard access is currently unavailable.",
      };
    case "review_required":
      return {
        eyebrow: "DASHBOARD ACCESS",
        title: "You cannot access the dashboard right now",
        description:
          "Your account needs additional review before dashboard access can be enabled.",
      };
    case "onboarding_in_progress":
      return {
        eyebrow: "DASHBOARD ACCESS",
        title: "You cannot access the dashboard right now",
        description:
          "Your onboarding is still in progress, so dashboard access is not available yet.",
      };
    case "in_review":
    default:
      return {
        eyebrow: "DASHBOARD ACCESS",
        title: "You cannot access the dashboard right now",
        description:
          "Your account is still in review, so dashboard access will stay locked until approval.",
      };
  }
}

export default async function OnboardingStepPage({
  params,
}: OnboardingStepPageProps) {
  const { flow: flowId, step: stepId } = await params;
  const flow = getOnboardingFlow(flowId);
  let access = null as Awaited<ReturnType<typeof resolveOnboardingAccess>> | null;

  if (!flow) {
    notFound();
  }

  const step = getOnboardingStep(flow, stepId);

  if (!step) {
    notFound();
  }

  if (flow.id === "provider") {
    access = await resolveOnboardingAccess();
    const redirectPath = getAccessRedirectPath(access);
    const requestedPath = `${flow.basePath}/${step.id}`;

    if (step.id === "account") {
      if (access.state !== "logged_out") {
        redirect(redirectPath || "/dashboard");
      }
    } else if (access.state === "logged_out") {
      redirect(buildLoginRedirectPath(requestedPath));
    } else if (access.state === "logged_in_unverified") {
      redirect(redirectPath || "/verify-email");
    } else if (access.state === "logged_in_verified_complete") {
      redirect("/dashboard");
    } else if (
      access.state === "logged_in_verified_status" &&
      step.id !== "submitted"
    ) {
      redirect(redirectPath || "/onboarding/provider/submitted");
    } else if (!canAccessProviderStep(access, step.id)) {
      redirect(redirectPath || "/onboarding/provider/personal-details");
    }
  } else if (flow.id === "careseeker") {
    access = await resolveOnboardingAccess();
    const redirectPath = getAccessRedirectPath(access);
    const requestedPath = `${flow.basePath}/${step.id}`;

    if (step.id === "account") {
      if (access.state !== "logged_out") {
        redirect(redirectPath || "/dashboard");
      }
    } else if (access.state === "logged_out") {
      redirect(buildLoginRedirectPath(requestedPath));
    } else if (access.state === "logged_in_unverified") {
      redirect(redirectPath || "/verify-email");
    } else if (access.state === "logged_in_verified_complete") {
      if (step.id !== "submitted") {
        redirect("/dashboard");
      }
    } else if (!canAccessCareseekerStep(access, step.id)) {
      redirect(redirectPath || "/onboarding/careseeker/personal-details");
    }
  }

  const shellStep =
    flow.id === "careseeker" &&
    step.id === "submitted" &&
    access?.state === "logged_in_verified_status"
      ? {
          ...step,
          ...getCareseekerSubmittedStatusCopy(access.accountStatus),
        }
      : step;

  return (
    <OnboardingShell
      flow={flow}
      step={shellStep}
      formMaxWidthClassName={FORM_MAX_WIDTH_BY_STEP[step.id]}
    >
      <ProviderStep
        flow={flow}
        step={step}
        initialPhone={access?.phone}
        initialPhoneVerified={access?.phoneVerified}
      />
    </OnboardingShell>
  );
}
