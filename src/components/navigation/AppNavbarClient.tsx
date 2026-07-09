"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, Search, X } from "lucide-react";
import { logoutWithOnboardingDraftCleanup } from "@tapat-care/navigation";
import { LinkButton } from "@/components/ui/LinkButton";
import {
  getCrossZoneNavigationHref,
  isCrossZonePath,
} from "@/lib/cross-zone-navigation";
import type {
  NavbarAction,
  NavbarContextLabel,
  NavigationAppearance,
  NavigationItem,
} from "@/config/navigation";

type AppNavbarClientProps = {
  actions: NavbarAction[];
  appearance: NavigationAppearance;
  contextLabel?: string;
  contextLabels: NavbarContextLabel[];
  navItems: NavigationItem[];
  showLogoutLink: boolean;
  showSearch: boolean;
};

export function AppNavbarClient({
  actions,
  appearance,
  contextLabel,
  contextLabels,
  navItems,
  showLogoutLink,
  showSearch,
}: AppNavbarClientProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isTransparent = appearance === "transparent";

  const activeLabel =
    pathname === "/"
      ? ""
      : (navItems.find((item) => pathname === item.href)?.label ?? "");

  const getNavigationHref = (href: string) => {
    if (href.startsWith("#") && pathname !== "/") {
      return `/${href}`;
    }

    return href;
  };
  const shouldUseHardNavigation = (href: string) => isCrossZonePath(href);

  const linkActions = actions.filter((action) => action.kind === "link");
  const buttonActions = actions.filter((action) => action.kind !== "link");
  const mobileItems = [...navItems, ...linkActions];
  const showMobileMenu = mobileItems.length > 0;
  const hoverClass = "hover:text-primary";
  const resolvedContextLabel =
    contextLabel ??
    contextLabels.find(
      (item) =>
        pathname === item.hrefPrefix ||
        pathname.startsWith(`${item.hrefPrefix}/`),
    )?.label;
  const handleOnboardingLogout = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();
    logoutWithOnboardingDraftCleanup("/api/onboarding/logout");
  };

  return (
    <>
      <header
        className={`${isTransparent ? "absolute top-[20px]" : "relative top-0 bg-white"} left-0 right-0 z-30 w-full`}
      >
        <nav
          className={`${isTransparent ? "text-white sm:mx-[24px] rounded-[12px] text-[16px] md:rounded-[16px]" : "bg-white text-black"}`}
        >
          <div className="relative w-full">
            <div className="flex min-h-[83px] w-full items-center justify-between p-[16px]">
              <div className="flex shrink-0 items-center space-x-2 sm:space-x-3">
                <Link
                  href="/"
                  className={`ml-[2px] text-[38px] italic tracking-wide ${
                    isTransparent ? "text-white" : "text-black"
                  }`}
                >
                  Tapat
                </Link>
              </div>

              <div className="hidden items-center space-x-4 text-[16px] [@media(min-width:1200px)]:flex xl:space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={getNavigationHref(item.href)}
                    aria-current={
                      activeLabel === item.label ? "page" : undefined
                    }
                    className={`${hoverClass} ${
                      activeLabel === item.label
                        ? "font-bold text-primary"
                        : isTransparent
                          ? "text-white"
                          : "text-gray-800"
                    } whitespace-nowrap transition`}
                  >
                    {item.label}
                  </Link>
                ))}

              </div>

              <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-3">
                {resolvedContextLabel ? (
                  <span
                    className={`hidden text-sm sm:inline ${
                      isTransparent ? "text-white/80" : "text-gray-600"
                    }`}
                  >
                    {resolvedContextLabel}
                  </span>
                ) : null}

                {showSearch ? (
                  <div className="relative h-[48px] w-[48px] sm:h-[50px] sm:w-[200px] 2xl:w-[250px]">
                    <Search className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-gray-500 sm:left-[12px] sm:h-4 sm:w-4 sm:translate-x-0" />
                    <input
                      aria-label="Find a caregiver"
                      type="search"
                      placeholder="Find a Caregiver"
                      className="h-full w-full cursor-pointer rounded-full border border-gray-300 bg-white pl-[24px] pr-[4px] text-[16px] text-gray-500 outline-none placeholder-transparent focus:ring-2 focus:ring-primary sm:cursor-text sm:pl-[40px] sm:pr-[12px] sm:placeholder-gray-500"
                    />
                  </div>
                ) : null}

                {buttonActions.map((action) => {
                  if (
                    action.kind === "secondary" &&
                    action.label.toLowerCase() === "log in"
                  ) {
                    return (
                      <Link
                        key={action.label}
                        href={action.href}
                        className={`text-sm font-semibold transition ${
                          isTransparent
                            ? "text-white hover:text-primary"
                            : "text-gray-800 hover:text-primary"
                        }`}
                      >
                        {action.label}
                      </Link>
                    );
                  }

                  if (action.kind === "primary") {
                    return (
                      <LinkButton
                        key={action.label}
                        href={action.href}
                        className="w-[146px] max-[400px]:w-[112px] bg-primary text-white"
                        size="sm"
                        animation="shine"
                        animationColor="white/30"
                      >
                        <span>{action.label}</span>
                      </LinkButton>
                    );
                  }

                  if (action.kind === "secondary") {
                    return (
                      <LinkButton
                        key={action.label}
                        href={action.href}
                        className="w-[100px] max-[200px]:w-[112px] bg-white text-gray-800 hover:bg-gray-100"
                        size="sm"
                        animation="shine"
                        animationColor="black/10"
                      >
                        <span>{action.label}</span>
                      </LinkButton>
                    );
                  }

                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-primary hover:text-primary"
                    >
                      {action.label}
                    </Link>
                  );
                })}
                {linkActions.map((action) => (
                  shouldUseHardNavigation(action.href) ? (
                    <a
                      key={action.label}
                      href={getCrossZoneNavigationHref(action.href)}
                      className={`${hoverClass} ${
                        isTransparent ? "text-white" : "text-gray-800"
                      } whitespace-nowrap text-sm font-semibold transition`}
                    >
                      {action.label}
                    </a>
                  ) : (
                    <Link
                      key={action.label}
                      href={action.href}
                      className={`${hoverClass} ${
                        isTransparent ? "text-white" : "text-gray-800"
                      } whitespace-nowrap text-sm font-semibold transition`}
                    >
                      {action.label}
                    </Link>
                  )
                ))}
                {showLogoutLink ? (
                  <a
                    href="/api/onboarding/logout"
                    onClick={handleOnboardingLogout}
                    className={`text-sm font-semibold transition hover:text-red-600 ${
                      isTransparent ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Logout
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {showMobileMenu ? (
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="fixed bottom-6 left-6 z-50 flex h-[72px] w-[72px] cursor-pointer items-center justify-center rounded-[46px] bg-white [@media(min-width:1200px)]:hidden"
        >
          {open ? (
            <X className="h-[24px] w-[24px] text-gray-900" />
          ) : (
            <Menu className="h-[24px] w-[24px] text-gray-900" />
          )}
        </button>
      ) : null}

      {showMobileMenu && open ? (
        <div className="fixed inset-0 z-40 [@media(min-width:1200px)]:hidden">
          <div className="absolute inset-0 flex flex-col bg-primary sm:hidden">
            <nav className="mt-9 flex-1">
              <ul className="flex flex-col text-[30px] font-bold text-white">
                {mobileItems.map((item) => {
                  const href = getNavigationHref(item.href);
                  const isActive =
                    activeLabel === item.label || pathname === item.href;

                  return (
                    <li key={item.label}>
                      {shouldUseHardNavigation(href) ? (
                        <a
                          href={getCrossZoneNavigationHref(href)}
                          onClick={() => setOpen(false)}
                          className={`flex w-full cursor-pointer items-center justify-between px-4 py-4 text-left text-[30px] font-bold transition ${
                            isActive
                              ? "bg-violet-400 text-white"
                              : "hover:bg-white/10"
                          }`}
                        >
                          <span>{item.label}</span>
                          <ChevronRight className="h-6 w-6" />
                        </a>
                      ) : (
                        <Link
                          href={href}
                          onClick={() => setOpen(false)}
                          className={`flex w-full cursor-pointer items-center justify-between px-4 py-4 text-left text-[30px] font-bold transition ${
                            isActive
                              ? "bg-violet-400 text-white"
                              : "hover:bg-white/10"
                          }`}
                        >
                          <span>{item.label}</span>
                          <ChevronRight className="h-6 w-6" />
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="absolute inset-0 hidden sm:flex">
            <div className="flex w-[320px] flex-col bg-purple-800 p-6">
              <nav className="mt-6 flex-1">
                <ul className="flex flex-col gap-4 text-[20px] font-semibold text-white">
                  {mobileItems.map((item) => {
                    const href = getNavigationHref(item.href);
                    const isActive =
                      activeLabel === item.label || pathname === item.href;

                    return (
                      <li key={item.label}>
                        {shouldUseHardNavigation(href) ? (
                          <a
                            href={getCrossZoneNavigationHref(href)}
                            onClick={() => setOpen(false)}
                            className={`flex w-full cursor-pointer items-center justify-between rounded-md px-4 py-4 text-left transition ${
                              isActive
                                ? "bg-primary text-white"
                                : "hover:bg-white/10"
                            }`}
                          >
                            <span>{item.label}</span>
                            <ChevronRight className="h-6 w-6" />
                          </a>
                        ) : (
                          <Link
                            href={href}
                            onClick={() => setOpen(false)}
                            className={`flex w-full cursor-pointer items-center justify-between rounded-md px-4 py-4 text-left transition ${
                              isActive
                                ? "bg-primary text-white"
                                : "hover:bg-white/10"
                            }`}
                          >
                            <span>{item.label}</span>
                            <ChevronRight className="h-6 w-6" />
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            <button
              aria-label="Close menu"
              type="button"
              className="flex-1 bg-black/80"
              onClick={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
