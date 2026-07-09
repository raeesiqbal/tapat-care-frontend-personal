import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import { getDashboardSession } from "@/features/dashboard/server";
import { CareNeedsSettingsForm } from "@/features/settings/care-needs/components/CareNeedsForm";
import { getDashboardCareNeedsSettings } from "@/features/settings/care-needs/server";
import { SettingsSideNav } from "@/features/settings/components/settings-side-nav";
import {
  canAccessSettingsHref,
  getSettingsRedirectHref,
} from "@/features/settings/routes";

const settingsHref = "/dashboard/settings/care-needs";

export default async function SettingsCareNeedsPage() {
  const { token, user } = await getDashboardSession(settingsHref);

  if (!canAccessSettingsHref(user.accountType, settingsHref)) {
    redirect(getSettingsRedirectHref());
  }

  const careNeedsSettings = await getDashboardCareNeedsSettings(token);

  return (
    <DashboardFrame user={user}>
      <main className="bg-[var(--tapat-color-surface-page)]">
        <section className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 lg:py-10">
          <div className="hidden lg:block">
            <SettingsSideNav user={user} activeHref={settingsHref} />
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
              Care
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-black sm:text-4xl">
              Care needs
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Review family contacts, mobility, medical details, and care preferences saved from
              onboarding.
            </p>

            <div className="mt-6">
              <CareNeedsSettingsForm
                initialValues={careNeedsSettings.values}
                options={careNeedsSettings.options}
                canEdit={careNeedsSettings.canUpdate}
              />
            </div>
          </div>
        </section>
      </main>
    </DashboardFrame>
  );
}
