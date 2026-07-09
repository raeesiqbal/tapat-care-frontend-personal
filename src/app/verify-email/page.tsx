import { AppNavbar } from "@/components/navigation/AppNavbar";
import { redirect } from "next/navigation";
import { VerificationForm } from "@/features/auth/components/VerificationForm";
import { VerificationRecoveryForm } from "@/features/auth/components/VerificationRecoveryForm";
import { getAccessRedirectPath, resolveOnboardingAccess } from "@/lib/onboarding-access";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string;
    source?: string;
    verification_status?: string;
  }>;
}) {
  const {
    email = "",
    source = "registration",
    verification_status: verificationStatus,
  } = await searchParams;
  const isExpired = verificationStatus === "expired";
  const access = await resolveOnboardingAccess();
  const redirectPath = getAccessRedirectPath(access);

  if (access.state === "logged_out" && !isExpired) {
    const loginSearchParams = new URLSearchParams();
    if (email) {
      loginSearchParams.set("email", email);
    }

    const nextSearchParams = new URLSearchParams();
    if (email) {
      nextSearchParams.set("email", email);
    }
    if (source) {
      nextSearchParams.set("source", source);
    }
    if (verificationStatus) {
      nextSearchParams.set("verification_status", verificationStatus);
    }

    const nextPath = nextSearchParams.size
      ? `/verify-email?${nextSearchParams.toString()}`
      : "/verify-email";
    loginSearchParams.set("next", nextPath);
    redirect(`/login?${loginSearchParams.toString()}`);
  }

  if (access.state === "logged_in_verified_incomplete" || access.state === "logged_in_verified_complete") {
    redirect(redirectPath || "/dashboard");
  }

  const resolvedEmail = access.state === "logged_in_unverified" ? access.email || email : email;
  const isLoginSource = source === "login";

  return (
    <div className="min-h-screen bg-[#fbfafc] text-gray-950">
      <AppNavbar appearance="solid" showSearch={false} surface="onboarding" />
      <main className="mx-auto flex max-w-[520px] px-5 py-16 sm:px-8">
        <section className="w-full rounded-[8px] border border-gray-100 bg-white p-7 shadow-sm">
          <p className="text-xs font-semibold text-primary">
            EMAIL VERIFICATION
          </p>
          <h1 className="mt-3 text-2xl font-semibold">
            {isExpired ? "Your verification link expired" : "Verify your email"}
          </h1>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            {isExpired
              ? "Request a new single-use link to verify your email and continue onboarding."
              : isLoginSource
                ? "Your account is not verified yet. Request a new verification email to continue onboarding."
                : "Confirm your email address before continuing onboarding."}
          </p>
          {isExpired ? (
            <VerificationRecoveryForm initialEmail={resolvedEmail} />
          ) : (
            <VerificationForm
              initialEmail={resolvedEmail}
              source={isLoginSource ? "login" : "registration"}
            />
          )}
        </section>
      </main>
    </div>
  );
}
