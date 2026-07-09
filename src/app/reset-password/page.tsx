import { AppNavbar } from "@/components/navigation/AppNavbar";
import { redirectAuthenticatedUserFromGuestRoute } from "@/features/auth/route-guards";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { validateResetToken } from "@/lib/api/password-reset";

type ResetPasswordPageProps = {
  searchParams?:
    | {
        token?: string | string[];
      }
    | Promise<{
        token?: string | string[];
      }>;
};

function resolveToken(value: string | string[] | undefined) {
  const token = Array.isArray(value) ? value[0] : value;
  return token?.trim() ?? "";
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const authenticatedRedirect = await redirectAuthenticatedUserFromGuestRoute();

  if (authenticatedRedirect) {
    return authenticatedRedirect;
  }

  const resolvedSearchParams = await Promise.resolve(searchParams);
  const token = resolveToken(resolvedSearchParams?.token);
  let isTokenValid = false;

  if (token) {
    try {
      await validateResetToken(token);
      isTokenValid = true;
    } catch {
      isTokenValid = false;
    }
  }

  return (
    <div className="h-screen bg-[#fbfafc] text-gray-950">
      <AppNavbar appearance="solid" showSearch={false} surface="onboarding" />
      <main className="flex h-[calc(100vh-83px)] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text center">
            <ResetPasswordForm
              token={token || null}
              isTokenValid={isTokenValid}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
