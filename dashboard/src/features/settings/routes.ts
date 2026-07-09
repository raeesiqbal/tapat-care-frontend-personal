import {
  BadgeCheck,
  CircleHelp,
  HeartPulse,
  LockKeyhole,
  Settings,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { DashboardRole } from "@/features/dashboard/types";

type SettingsNavLink = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  allowedRoles?: readonly DashboardRole[];
};

type SettingsNavSection = {
  title: string;
  links: readonly SettingsNavLink[];
};

export const settingsNavSections: readonly SettingsNavSection[] = [
  {
    title: "Account",
    links: [
      {
        href: "/dashboard/settings/profile",
        label: "Profile",
        description: "Manage your account information.",
        icon: UserRound,
      },
      {
        href: "/dashboard/settings/password-security",
        label: "Password & security",
        description: "Update sign-in and account protection settings.",
        icon: LockKeyhole,
      },
      {
        href: "/dashboard/settings/care-needs",
        label: "Care needs",
        description: "Review family contacts and care preferences.",
        icon: HeartPulse,
        allowedRoles: ["careseeker"],
      },
      {
        href: "/dashboard/settings/services",
        label: "Services & availability",
        description: "Review services and care preferences.",
        icon: Settings,
        allowedRoles: ["caregiver"],
      },
      {
        href: "/dashboard/settings/qualifications-experience",
        label: "Qualifications & experience",
        description:
          "Review certifications, transportation, and care experience.",
        icon: BadgeCheck,
        allowedRoles: ["caregiver"],
      },
    ],
  },
  {
    title: "Help",
    links: [
      {
        href: "/contact",
        label: "Contact support",
        description: "Get help from the Tapat Care team.",
        icon: CircleHelp,
      },
    ],
  },
] as const;

export function isSettingsNavLinkVisible(
  role: DashboardRole,
  link: SettingsNavLink,
) {
  return !link.allowedRoles || link.allowedRoles.includes(role);
}

export function getSettingsNavSectionsForRole(role: DashboardRole) {
  return settingsNavSections
    .map((section) => ({
      ...section,
      links: section.links.filter((link) =>
        isSettingsNavLinkVisible(role, link),
      ),
    }))
    .filter((section) => section.links.length > 0);
}

export function canAccessSettingsHref(role: DashboardRole, href: string) {
  return settingsNavSections.some((section) =>
    section.links.some(
      (link) => link.href === href && isSettingsNavLinkVisible(role, link),
    ),
  );
}

export function getSettingsRedirectHref() {
  return "/dashboard/settings/profile";
}
