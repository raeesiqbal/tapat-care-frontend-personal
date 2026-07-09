import Link from "next/link";

import type { DashboardUser } from "@/features/dashboard/types";
import { getSettingsNavSectionsForRole } from "@/features/settings/routes";

type SettingsSideNavProps = {
  user: DashboardUser;
  activeHref?: string;
};

export function SettingsSideNav({ user, activeHref }: SettingsSideNavProps) {
  const settingsNavSections = getSettingsNavSectionsForRole(user.accountType);

  return (
    <aside className="rounded-lg border border-[var(--tapat-color-gray-200)] bg-white p-5 shadow-[var(--tapat-shadow-card)]">
      <nav className="space-y-6" aria-label="Settings">
        {settingsNavSections.map((section) => (
          <div key={section.title}>
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
              {section.title}
            </p>
            <div className="mt-2 space-y-1">
              {section.links.map((link) => {
                const isActive = link.href === activeHref;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex rounded-md px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-[var(--tapat-color-violet-50)] text-[var(--tapat-color-brand-purple-700)]"
                        : "text-gray-700 hover:bg-violet-50 hover:text-[var(--tapat-color-brand-purple-700)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
