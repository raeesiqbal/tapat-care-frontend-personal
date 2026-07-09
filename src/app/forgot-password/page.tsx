import { AppNavbar } from "@/components/navigation/AppNavbar";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { redirectAuthenticatedUserFromGuestRoute } from "@/features/auth/route-guards";

export default async function ForgotPasswordPage() {
  const authenticatedRedirect = await redirectAuthenticatedUserFromGuestRoute();

  if (authenticatedRedirect) {
    return authenticatedRedirect;
  }

  return (
    <div className="h-screen bg-[#fbfafc] text-gray-950">
      <AppNavbar appearance="solid" showSearch={false} surface="onboarding" />
      <main className="flex h-[calc(100vh-83px)] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text center">
            <h1 className="text-[24px] font-semibold leading-[1.1] text-gray-950">
              Forgot your password?
            </h1>
            <p className="mt-2 text-[16px] leading-7 text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
          </div>
          <ForgotPasswordForm />
        </div>
      </main>
    </div>
  );
}
