import type {
  CaregiverListingPage,
  DashboardUser,
} from "@/features/dashboard/types";
import { CaregiverListingList } from "@/features/dashboard/components/caregiver-listing-list";
import { CareseekerSearch } from "@/features/dashboard/components/careseeker-search";

type CareseekerDashboardProps = {
  initialCaregiverPage: CaregiverListingPage;
  user: DashboardUser;
};

function formatCaregiverCount(total: number) {
  if (total === 1) {
    return "1 caregiver available";
  }

  return `${total} caregivers available`;
}

export function CareseekerDashboard({
  initialCaregiverPage,
  user,
}: CareseekerDashboardProps) {
  return (
    <main>
      <section className="border-b border-[var(--tapat-color-gray-200)] bg-white">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <p className="text-sm font-semibold uppercase tracking-normal text-[var(--tapat-color-brand-purple-700)]">
            Welcome back, {user.firstName || "Sarah"}
          </p>
          <div className="mt-6 max-w-2xl">
            <h1 className="text-4xl font-semibold leading-tight tracking-normal text-black sm:text-5xl">
              Find a caregiver who fits your family.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-gray-500">
              Search verified caregivers near you. Compare experience,
              languages, services, and availability before starting a
              conversation.
            </p>
          </div>

          <div className="mt-10">
            <CareseekerSearch />
          </div>
        </div>
      </section>

      <section className="overflow-visible bg-[#f5f2ff]">
        <div className="mx-auto w-full max-w-[1180px] overflow-visible px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--tapat-color-brand-purple-700)]">
                Caregiver matches
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-normal text-black sm:text-3xl">
                {formatCaregiverCount(initialCaregiverPage.total)}
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              Sorted by availability and care fit
            </p>
          </div>

          <CaregiverListingList initialPage={initialCaregiverPage} />
        </div>
      </section>
    </main>
  );
}
