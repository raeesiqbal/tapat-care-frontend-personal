"use client";

import Link from "next/link";
import {
  ChevronDown,
  CircleHelp,
  LogOut,
  Settings,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { logoutWithOnboardingDraftCleanup } from "@tapat-care/navigation";

import type { DashboardUser } from "@/features/dashboard/types";

type ProfileMenuProps = {
  user: DashboardUser;
  logoutHref: string;
};

const menuItems = [
  {
    href: "/dashboard/settings/profile",
    label: "Settings",
    description: "Preferences",
    icon: Settings,
  },
  {
    href: "/contact",
    label: "Help",
    description: "Contact support",
    icon: CircleHelp,
  },
];

export function ProfileMenu({ user, logoutHref }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [user.picture]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    logoutWithOnboardingDraftCleanup(logoutHref);
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--tapat-color-gray-200)] bg-[var(--tapat-color-violet-50)] py-1 pl-1 pr-3 text-left transition hover:border-violet-200 hover:bg-white"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-9 w-9 overflow-hidden rounded-full bg-black">
          {user.picture && !avatarError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.picture}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
              {user.initials}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-700 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-[var(--tapat-color-gray-200)] bg-white shadow-[var(--tapat-shadow-panel)]"
        >
          <div className="flex items-center gap-3 border-b border-[var(--tapat-color-gray-100)] p-4">
            <span className="flex h-11 w-11 shrink-0 overflow-hidden rounded-full bg-black">
              {user.picture && !avatarError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.picture}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                  {user.initials}
                </span>
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-950">
                {user.fullName}
              </p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-violet-50"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-4 w-4 shrink-0 text-[var(--tapat-color-brand-purple-700)]" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-gray-950">
                      {item.label}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-[var(--tapat-color-gray-100)] p-2">
            <a
              href={logoutHref}
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-red-50 hover:text-red-600"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
