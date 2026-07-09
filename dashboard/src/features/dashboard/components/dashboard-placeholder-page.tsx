import type { DashboardUser } from "@/features/dashboard/types";

type DashboardPlaceholderPageProps = {
  user: DashboardUser;
  title: string;
  description: string;
};

export function DashboardPlaceholderPage({
  user,
  title,
  description,
}: DashboardPlaceholderPageProps) {
  return (
    <main className="bg-[var(--tapat-color-surface-page)]">
      <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[var(--tapat-color-gray-200)] bg-white p-6 shadow-[var(--tapat-shadow-card)] sm:p-8">
          <p className="text-sm font-semibold uppercase text-[var(--tapat-color-brand-purple-700)]">
            {user.accountType} dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-black">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500">
            {description}
          </p>
        </div>
      </section>
    </main>
  );
}
