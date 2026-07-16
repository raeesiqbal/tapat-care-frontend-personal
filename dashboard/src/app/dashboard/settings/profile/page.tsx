import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import { getDashboardSession } from "@/features/dashboard/server";
import { SettingsMobileNav } from "@/features/settings/components/settings-index";
import { SettingsSideNav } from "@/features/settings/components/settings-side-nav";
import { PersonalDetailsForm } from "@/features/settings/profile/components/PersonalDetailsForm";
import { ProfilePhotoCard } from "@/features/settings/profile/components/ProfilePhotoCard";
import {
  getDashboardPersonalDetails,
  getDashboardPersonalDetailsFlowId,
} from "@/features/settings/profile/server";

export default async function SettingsProfilePage() {
  const { token, user } = await getDashboardSession("/dashboard/settings/profile");
  const flowId = getDashboardPersonalDetailsFlowId(user.accountType);
  const personalDetails = flowId
    ? await getDashboardPersonalDetails(token, flowId)
    : null;

  return (
    <DashboardFrame user={user}>
      <main className="bg-[var(--tapat-color-surface-page)]">
        <section className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 lg:py-10">
          <div className="hidden lg:block">
            <SettingsSideNav user={user} activeHref="/dashboard/settings/profile" />
          </div>

          <div className="min-w-0">
            <SettingsMobileNav user={user} />

            <div className="mt-10 lg:mt-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--tapat-color-brand-purple-700)]">
                Account
              </p>
              <h1 className="mt-2 text-heading-2 text-black">
                Profile
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                Manage your account information and the details Tapat Care uses to identify your
                profile.
              </p>

              <ProfilePhotoCard user={user} />

              <div className="mt-6">
                {flowId && personalDetails ? (
                  <PersonalDetailsForm
                    flowId={flowId}
                    initialValues={personalDetails.values}
                    canEdit={personalDetails.canUpdate}
                  />
                ) : (
                  <section className="rounded-lg border border-[var(--tapat-color-gray-200)] bg-white p-5 shadow-[var(--tapat-shadow-card)] sm:p-6">
                    <h2 className="text-heading-5 text-gray-950">
                      My information
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                      Profile settings are not available for this account type.
                    </p>
                  </section>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </DashboardFrame>
  );
}
