"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

import type { DashboardUser } from "@/features/dashboard/types";
import { ProfileMenu } from "@/features/dashboard/components/profile-menu";

type DashboardTopbarProps = {
  user: DashboardUser;
  logoutHref: string;
};

export function DashboardTopbar({ user, logoutHref }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--tapat-color-gray-200)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link
          href="/dashboard"
          className="text-[32px] font-semibold italic leading-none tracking-normal text-black"
          aria-label="Tapat dashboard"
        >
          tapat
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/dashboard/messages"
            className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition hover:bg-violet-50 hover:text-[var(--tapat-color-brand-purple-700)] sm:h-auto sm:w-auto sm:flex-col sm:gap-0.5 sm:rounded-lg sm:px-2 sm:py-1"
            aria-label="Messages"
          >
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--tapat-color-brand-purple-700)] px-1 text-[11px] font-semibold text-white sm:right-1 sm:top-0">
              2
            </span>
            <MessageCircle className="h-5 w-5" aria-hidden />
            <span className="hidden text-xs font-medium sm:block">Messages</span>
          </Link>

          <ProfileMenu user={user} logoutHref={logoutHref} />
        </div>
      </div>
    </header>
  );
}
