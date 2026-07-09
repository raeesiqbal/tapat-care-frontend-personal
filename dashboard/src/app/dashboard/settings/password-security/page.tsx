import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import { getDashboardSession } from "@/features/dashboard/server";
import { SettingsSideNav } from "@/features/settings/components/settings-side-nav";
import { ChangePasswordForm } from "@/features/settings/password-security/components/ChangePasswordForm";

export default async function PasswordSecurityPage() {
  const { user } = await getDashboardSession("/dashboard/settings/password-security");

  return (
    <DashboardFrame user={user}>
      <main className="bg-[var(--tapat-color-surface-page)]">
        <section className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 lg:py-10">
          <div className="hidden lg:block">
            <SettingsSideNav user={user} activeHref="/dashboard/settings/password-security" />
          </div>

          <div className="min-w-0">
            <Link
              href="/dashboard/settings/profile"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--tapat-color-brand-purple-700)] transition hover:text-violet-800 lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to settings
            </Link>

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--tapat-color-brand-purple-700)]">
              Security
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-black sm:text-4xl">
              Password & security
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Review sign-in settings and the controls that help protect your account.
            </p>

            <div className="mt-6">
              <ChangePasswordForm />
            </div>
          </div>
        </section>
      </main>
    </DashboardFrame>
  );
}
