import Image from "next/image";
import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/navigation/AppNavbar";
import {
  CrossZoneRedirect,
  LoginForm,
} from "@/features/auth/components/LoginForm";
import {
  getCrossZoneNavigationHref,
  isCrossZonePath,
} from "@/lib/cross-zone-navigation";
import { getAccessRedirectPath, resolveOnboardingAccess } from "@/lib/onboarding-access";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; password_status?: string }>;
}) {
  const access = await resolveOnboardingAccess();
  const redirectPath = getAccessRedirectPath(access);

  if (redirectPath) {
    if (isCrossZonePath(redirectPath)) {
      return <CrossZoneRedirect href={getCrossZoneNavigationHref(redirectPath)} />;
    }

    redirect(getCrossZoneNavigationHref(redirectPath));
  }

  const { email = "", password_status = "" } = await searchParams;
  return (
    <div className="h-screen overflow-hidden bg-[#fbfafc] text-gray-950">
      <AppNavbar appearance="solid" showSearch={false} surface="dashboard" />
      <main className="h-[calc(100vh-83px)] w-full">
        <div className="grid h-full grid-cols-12">
          <section className="relative hidden h-full overflow-hidden lg:col-span-8 lg:block">
            <Image
              src="/assets/images/heroImage.png"
              alt="Caregiver assisting a client"
              fill
              sizes="(min-width: 1024px) 66vw, 0vw"
              className="object-cover"
              priority
            />
          </section>

          <section className="col-span-12 h-full lg:col-span-4 px-4">
            <div className="mx-auto flex h-full items-center max-w-[350px]">
              <div className="w-full">
                <div className="mb-8">
                  <h1 className="text-[24px] font-semibold leading-[1.1] tracking-normal text-gray-950">
                    Welcome back
                  </h1>
                  <p className="mt-2 text-[16px] text-gray-600">
                    Log in to your TapatCare account.
                  </p>
                </div>

                <LoginForm
                  initialEmail={email}
                  passwordStatus={password_status}
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
