import { BackendApiError } from "@/lib/backend-api";
import { InfoCallout } from "@tapat-care/ui-primitives";
import {
  fetchCareseekerOnboardingResumeState,
  fetchProviderOnboardingResumeState,
} from "../resume-state";
import { getOnboardingAccessToken } from "../server-session";

type StatusContent = {
  title: string;
  body: string;
  valueLabel: string;
  toneClassName: string;
};

type SubmittedStatus =
  | {
      userType: "caregiver";
      accountStatus: string;
      screeningStatus: string;
    }
  | {
      userType: "careseeker";
      accountStatus: string;
    };

function getAccountStatusContent(accountStatus: string): StatusContent {
  switch (accountStatus) {
    case "rejected":
      return {
        valueLabel: "Rejected",
        title: "Your caregiver account is not approved",
        body: "This controls dashboard access. Your caregiver dashboard is locked because your account was not approved.",
        toneClassName: "border-red-200 bg-red-50 text-red-900",
      };
    case "review_required":
      return {
        valueLabel: "Review required",
        title: "Your application needs additional review",
        body: "This controls dashboard access. Your caregiver dashboard is locked while the Tapat Care team reviews your application.",
        toneClassName: "border-amber-200 bg-amber-50 text-amber-950",
      };
    case "approved":
      return {
        valueLabel: "Approved",
        title: "Your caregiver account is approved",
        body: "This controls dashboard access. Your caregiver dashboard is available.",
        toneClassName: "border-emerald-200 bg-emerald-50 text-emerald-950",
      };
    case "onboarding_in_progress":
      return {
        valueLabel: "Onboarding in progress",
        title: "Your onboarding is still in progress",
        body: "This controls dashboard access. Finish the remaining onboarding steps before your account can move to review.",
        toneClassName: "border-sky-200 bg-sky-50 text-sky-950",
      };
    case "in_review":
    default:
      return {
        valueLabel: "In review",
        title: "We are reviewing your application",
        body: "This controls dashboard access. Your caregiver dashboard stays locked until your account is approved.",
        toneClassName: "border-primary/20 bg-primary/5 text-gray-900",
      };
  }
}

function getCareseekerAccountStatusLabel(accountStatus: string) {
  switch (accountStatus) {
    case "rejected":
      return "Rejected";
    case "review_required":
      return "Review required";
    case "approved":
      return "Approved";
    case "onboarding_in_progress":
      return "Onboarding in progress";
    case "in_review":
    default:
      return "In review";
  }
}

function getScreeningStatusContent(screeningStatus: string): StatusContent {
  switch (screeningStatus) {
    case "not_started":
      return {
        valueLabel: "Not started",
        title: "Your safety screening has not started",
        body: "This tracks the background screening workflow. Complete the payment step so screening can begin.",
        toneClassName: "border-gray-200 bg-white text-gray-900",
      };
    case "payment_authorized":
      return {
        valueLabel: "Payment authorized",
        title: "Your screening payment is authorized",
        body: "This tracks the background screening workflow. We can start the screening process now that payment authorization succeeded.",
        toneClassName: "border-sky-200 bg-sky-50 text-sky-950",
      };
    case "checkr_invited":
      return {
        valueLabel: "Checkr invited",
        title: "Your screening invitation is ready",
        body: "This tracks the background screening workflow. In the live Checkr flow, you would complete the hosted screening invitation next.",
        toneClassName: "border-sky-200 bg-sky-50 text-sky-950",
      };
    case "approved":
      return {
        valueLabel: "Approved",
        title: "Your safety screening is approved",
        body: "This tracks the background screening workflow. Dashboard access still depends on the account status.",
        toneClassName: "border-emerald-200 bg-emerald-50 text-emerald-950",
      };
    case "review_required":
      return {
        valueLabel: "Review required",
        title: "Your safety screening needs review",
        body: "This tracks the background screening workflow. The result needs review before your account can be approved.",
        toneClassName: "border-amber-200 bg-amber-50 text-amber-950",
      };
    case "rejected":
      return {
        valueLabel: "Rejected",
        title: "Your safety screening was not approved",
        body: "This tracks the background screening workflow. Your caregiver dashboard remains locked unless the decision changes.",
        toneClassName: "border-red-200 bg-red-50 text-red-900",
      };
    case "checkr_in_progress":
    default:
      return {
        valueLabel: "Checkr in progress",
        title: "Your safety screening is in progress",
        body: "This tracks the background screening workflow. We will update your account after the screening result is reviewed.",
        toneClassName: "border-primary/20 bg-primary/5 text-gray-900",
      };
  }
}

function getSummaryText(accountStatus: string, screeningStatus: string) {
  if (accountStatus === "approved") {
    return "Your account is approved, so dashboard access is available.";
  }

  if (accountStatus === "rejected") {
    return "Your account is not approved, so dashboard access is unavailable.";
  }

  if (accountStatus === "review_required") {
    return "Your account needs additional review before dashboard access can be enabled.";
  }

  if (screeningStatus === "approved") {
    return "Your safety screening is approved, but your account is still in review. Dashboard access is enabled only after account approval.";
  }

  return "Your application is still being reviewed. Dashboard access is enabled only after your account status becomes approved.";
}

function StatusPanel({
  label,
  content,
}: {
  label: string;
  content: StatusContent;
}) {
  return (
    <div className={`rounded-[8px] border p-5 ${content.toneClassName}`}>
      <p className="text-xs font-semibold uppercase text-gray-700">{label}</p>
      <p className="mt-2 text-heading-5 text-gray-950">
        {content.valueLabel}
      </p>
      <h3 className="mt-4 text-[17px] font-semibold text-gray-950">
        {content.title}
      </h3>
      <p className="mt-2 text-[14px] leading-6">{content.body}</p>
    </div>
  );
}

function normalizeStatus(value: unknown, fallback: string) {
  return String(value || fallback).trim().toLowerCase();
}

async function fetchSubmittedStatus(token: string | null): Promise<SubmittedStatus> {
  const fallback: SubmittedStatus = {
    userType: "caregiver",
    accountStatus: "in_review",
    screeningStatus: "checkr_in_progress",
  };

  if (!token) {
    return fallback;
  }

  try {
    const payload = await fetchProviderOnboardingResumeState(token);
    return {
      userType: "caregiver",
      accountStatus: normalizeStatus(payload.data?.account_status, "in_review"),
      screeningStatus: normalizeStatus(
        payload.data?.screening_status,
        "checkr_in_progress",
      ),
    };
  } catch (error) {
    if (
      error instanceof BackendApiError &&
      error.status !== 403 &&
      error.status !== 404
    ) {
      return fallback;
    }
  }

  try {
    const payload = await fetchCareseekerOnboardingResumeState(token);
    return {
      userType: "careseeker",
      accountStatus: normalizeStatus(payload.data?.account_status, "in_review"),
    };
  } catch {
    return fallback;
  }
}

function CareseekerSubmittedStatus() {
  return (
    <section className="flex flex-col gap-6">
      <InfoCallout className="max-w-[720px]">
        <span className="block font-semibold text-gray-950">
          Messaging requires a subscription
        </span>
        <span className="mt-1 block text-gray-700">
          You can view caregiver profiles without a subscription. To send
          messages to caregivers or receive messages from them, you need an
          active subscription.
        </span>
      </InfoCallout>

      <div>
        <a
          href="/dashboard"
          className="inline-flex h-12 items-center justify-center rounded-[8px] bg-primary px-6 text-[15px] font-semibold text-white transition hover:bg-primary-hover"
        >
          Go to dashboard
        </a>
      </div>
    </section>
  );
}

function CareseekerAccountStatus({ accountStatus }: { accountStatus: string }) {
  const statusLabel = getCareseekerAccountStatusLabel(accountStatus);

  return (
    <section>
      <InfoCallout className="max-w-[720px]">
        <span className="block text-xs font-semibold uppercase text-primary">
          Current account status
        </span>
        <span className="mt-2 block text-heading-4 text-gray-950">
          {statusLabel}
        </span>
      </InfoCallout>
    </section>
  );
}

export async function ScreeningStatusPage() {
  const token = await getOnboardingAccessToken();
  const submittedStatus = await fetchSubmittedStatus(token);

  if (submittedStatus.userType === "careseeker") {
    if (submittedStatus.accountStatus !== "approved") {
      return (
        <CareseekerAccountStatus accountStatus={submittedStatus.accountStatus} />
      );
    }

    return <CareseekerSubmittedStatus />;
  }

  const { accountStatus, screeningStatus } = submittedStatus;
  const accountContent = getAccountStatusContent(accountStatus);
  const screeningContent = getScreeningStatusContent(screeningStatus);
  const summaryText = getSummaryText(accountStatus, screeningStatus);

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-[8px] border border-gray-200 bg-white p-5 text-gray-900">
        <p className="text-xs font-semibold uppercase text-primary">
          Current review state
        </p>
        <h2 className="mt-2 text-heading-4 text-gray-950">
          {accountContent.title}
        </h2>
        <p className="mt-3 max-w-[680px] text-[15px] leading-6 text-gray-700">
          {summaryText}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatusPanel label="Account status" content={accountContent} />
        <StatusPanel label="Screening status" content={screeningContent} />
      </div>
    </section>
  );
}
