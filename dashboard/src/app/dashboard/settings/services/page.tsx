import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import { getDashboardSession } from "@/features/dashboard/server";
import { SettingsSideNav } from "@/features/settings/components/settings-side-nav";
import { ServicesSettingsForm } from "@/features/settings/services/components/ServicesSettingsForm";
import { getDashboardServicesSettings } from "@/features/settings/services/server";
import {
  canAccessSettingsHref,
  getSettingsRedirectHref,
} from "@/features/settings/routes";

export default async function SettingsServicesPage() {
  const { token, user } = await getDashboardSession("/dashboard/settings/services");
  const settingsHref = "/dashboard/settings/services";

  if (!canAccessSettingsHref(user.accountType, settingsHref)) {
    redirect(getSettingsRedirectHref());
  }

  const servicesSettings = await getDashboardServicesSettings(token);

  return (
    <DashboardFrame user={user}>
      <main className="bg-[var(--tapat-color-surface-page)]">
        <section className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 lg:py-10">
          <div className="hidden lg:block">
            <SettingsSideNav user={user} activeHref="/dashboard/settings/services" />
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
            <h1 className="mt-2 text-heading-2 text-black">
              Services
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Manage the services, care preferences, and account details used for your dashboard
              experience.
            </p>

            <div className="mt-6">
              <ServicesSettingsForm
                initialValues={servicesSettings.values}
                serviceOptions={servicesSettings.serviceOptions}
                canEdit={servicesSettings.canUpdate}
              />
            </div>
          </div>
        </section>
      </main>
    </DashboardFrame>
  );
}
