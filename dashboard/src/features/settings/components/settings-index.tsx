import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { DashboardUser } from "@/features/dashboard/types";
import { getSettingsNavSectionsForRole } from "@/features/settings/routes";

type SettingsMobileNavProps = {
  user: DashboardUser;
};

export function SettingsMobileNav({ user }: SettingsMobileNavProps) {
  const settingsNavSections = getSettingsNavSectionsForRole(user.accountType);

  return (
    <section className="mx-auto w-full max-w-[720px] lg:hidden">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--tapat-color-brand-purple-700)]">
        Account
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-normal text-black">Settings</h1>
      <p className="mt-3 text-base leading-7 text-gray-600">
        Manage your account information, sign-in details, care preferences, and support options.
      </p>

      <nav className="mt-8 space-y-8" aria-label="Settings sections">
        {settingsNavSections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold tracking-normal text-gray-950">
              {section.title}
            </h2>
            <div className="mt-3 divide-y divide-[var(--tapat-color-gray-200)]">
              {section.links.map((link) => {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between gap-4 py-5 text-2xl font-medium tracking-normal text-gray-500 transition hover:text-[var(--tapat-color-brand-purple-700)]"
                  >
                    <span className="min-w-0 truncate">{link.label}</span>
                    <ArrowRight className="h-7 w-7 shrink-0 text-gray-950" aria-hidden />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
    </section>
  );
}
