"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Info, MapPin, Star } from "lucide-react";

import { DashboardChip } from "@/features/dashboard/components/dashboard-chip";
import type { CaregiverListing } from "@/features/dashboard/types";

type CaregiverListingCardProps = {
  caregiver: CaregiverListing;
  href?: string;
};

function isInteractiveCardTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        "a,button,input,select,textarea,[role='button'],[data-card-interactive='true']",
      ),
    )
  );
}

export function CaregiverListingCard({
  caregiver,
  href,
}: CaregiverListingCardProps) {
  const router = useRouter();
  const servicesTriggerRef = useRef<HTMLSpanElement | null>(null);
  const servicesPopoverRef = useRef<HTMLSpanElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [servicesPlacement, setServicesPlacement] = useState({
    openAbove: false,
    width: 288,
    left: 0,
  });

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isServicesOpen) {
      return;
    }

    const updatePlacement = () => {
      if (!servicesTriggerRef.current) {
        return;
      }

      const viewportPadding = 16;
      const triggerRect = servicesTriggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const nextWidth = Math.min(
        288,
        Math.max(220, viewportWidth - viewportPadding * 2),
      );

      const estimatedHeight = servicesPopoverRef.current?.offsetHeight ?? 160;
      const spaceBelow = viewportHeight - triggerRect.bottom - viewportPadding;
      const spaceAbove = triggerRect.top - viewportPadding;
      const openAbove = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
      const alignRight =
        triggerRect.left + nextWidth > viewportWidth - viewportPadding &&
        triggerRect.right - nextWidth >= viewportPadding;

      const unclampedLeft = alignRight ? triggerRect.width - nextWidth : 0;
      const absoluteLeft = triggerRect.left + unclampedLeft;
      const minLeft = viewportPadding - triggerRect.left;
      const maxLeft =
        viewportWidth - viewportPadding - triggerRect.left - nextWidth;
      const clampedLeft = Math.min(Math.max(unclampedLeft, minLeft), maxLeft);

      setServicesPlacement({
        openAbove,
        width: nextWidth,
        left: Number.isFinite(clampedLeft) ? clampedLeft : absoluteLeft,
      });
    };

    updatePlacement();

    let frameId = 0;
    const schedulePlacement = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updatePlacement);
    };

    window.addEventListener("resize", schedulePlacement);
    window.addEventListener("scroll", schedulePlacement, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", schedulePlacement);
      window.removeEventListener("scroll", schedulePlacement, true);
    };
  }, [isServicesOpen, caregiver.services.length]);

  function openServicesPopover() {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setIsServicesOpen(true);
  }

  function closeServicesPopover() {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setIsServicesOpen(false);
      closeTimeoutRef.current = null;
    }, 80);
  }

  function navigateToCaregiver() {
    if (href) {
      router.push(href);
    }
  }

  function handleCardClick(event: React.MouseEvent<HTMLElement>) {
    if (!href || isInteractiveCardTarget(event.target)) {
      return;
    }

    navigateToCaregiver();
  }

  function handleCardKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (!href || isInteractiveCardTarget(event.target)) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigateToCaregiver();
    }
  }

  return (
    <article
      aria-label={href ? `View ${caregiver.name} caregiver profile` : undefined}
      className={`relative z-0 rounded-lg border border-[var(--tapat-color-gray-200)] bg-white  shadow-card transition hover:border-violet-200 p-3
  sm:p-2
  md:p-2
  md:transform-gpu
  md:duration-200
  md:ease-out
  md:hover:z-10
  md:hover:-translate-y-1
  md:hover:scale-[1.01]
  md:hover:shadow-[0_18px_45px_rgba(76,29,149,0.16)]
  lg:p-3
  xl:p-4
  2xl:p-5 ${
    href
      ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tapat-color-brand-purple-700)] focus-visible:ring-offset-2"
      : ""
  }`}
      role={href ? "link" : undefined}
      tabIndex={href ? 0 : undefined}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div
        className="grid
  gap-4
  md:gap-3
  lg:gap-3.5
  xl:gap-4
  2xl:gap-5 md:grid-cols-[4rem_minmax(0,1fr)] lg:grid-cols-[4.5rem_minmax(0,1fr)] xl:grid-cols-[4.5rem_minmax(0,1fr)] 2xl:grid-cols-[7.5rem_minmax(0,1fr)] md:items-start"
      >
        <div className="flex flex-row items-start gap-3 sm:gap-4 md:flex-col md:gap-3 lg:gap-2.5 xl:gap-3 2xl:gap-3">
          <div
            className="
  relative shrink-0 overflow-hidden rounded-lg border border-violet-200 bg-violet-50 shadow-sm
  h-24 w-24
  md:h-[60px] md:w-[60px]
  lg:h-[70px] lg:w-[70px]
  xl:h-[75px] xl:w-[75px]
  2xl:h-24 2xl:w-24
"
          >
            <Image
              src={caregiver.imageSrc}
              alt={`${caregiver.name} profile`}
              width={112}
              height={112}
              unoptimized
              className="h-full w-full object-cover"
            />
          </div>
          {caregiver.isBackgroundChecked ? (
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 md:flex-none">
              <DashboardChip
                label="Background checked"
                variant="brand"
                className="
    max-w-full text-xs
    md:max-w-none md:whitespace-nowrap md:px-1.5 md:py-0.5 md:text-[9px] md:leading-4
    lg:px-2 lg:py-0.5 lg:text-[10px]
    xl:px-2.5 xl:py-1 xl:text-[11px]
    2xl:max-w-full 2xl:whitespace-nowrap 2xl:px-3 2xl:py-1 2xl:text-xs"
              />
            </div>
          ) : null}
        </div>
        <div className="min-w-0">
          <div
            className="grid
  gap-3
  md:grid-cols-[minmax(0,1fr)_auto]
  md:items-start
  md:gap-2
  lg:gap-2.5
  xl:gap-3
  2xl:gap-4"
          >
            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-normal text-gray-950 sm:text-xl md:line-clamp-1 md:text-base lg:text-lg xl:line-clamp-2 xl:text-xl 2xl:line-clamp-none 2xl:text-xl">
                {caregiver.name}
              </h2>
              <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-600 md:mt-1 md:gap-1 md:text-[11px] lg:mt-1.5 lg:gap-1.5 lg:text-xs xl:mt-2 xl:text-sm 2xl:mt-2 2xl:text-sm">
                <MapPin
                  className="h-4 w-4 shrink-0 text-gray-400 md:h-3.5 md:w-3.5 xl:h-4 xl:w-4 2xl:h-4 2xl:w-4"
                  aria-hidden
                />
                <span className="min-w-0 break-words md:line-clamp-2 2xl:line-clamp-none">
                  {caregiver.location}
                </span>
              </p>
              <p className="mt-2 break-words text-sm font-medium text-gray-700 md:mt-1 md:line-clamp-1 md:text-[11px] lg:mt-1.5 lg:line-clamp-2 lg:text-xs xl:mt-2 xl:text-sm 2xl:line-clamp-none 2xl:mt-2 2xl:text-sm">
                {caregiver.experience}
              </p>
            </div>

            <RateBlock rate={caregiver.rate} className="md:pt-1" />
          </div>
        </div>
      </div>
      <div className="mt-5 max-w-full text-sm leading-6  text-gray-600 md:mt-3 md:text-xs md:leading-5 lg:mt-3.5 lg:text-[13px] lg:leading-5 xl:mt-4 xl:text-sm xl:leading-6 2xl:mt-5 2xl:text-sm 2xl:leading-6">
        <p
          className="line-clamp-2
  md:line-clamp-2
  lg:line-clamp-2
  xl:line-clamp-3
  2xl:line-clamp-2"
        >
          {" "}
          {caregiver.summary}{" "}
        </p>{" "}
        <span className="text-gray-400">offers</span>{" "}
        <span
          data-card-interactive="true"
          className="group/services relative inline-flex max-w-full align-baseline"
          onMouseEnter={openServicesPopover}
          onMouseLeave={closeServicesPopover}
        >
          <span
            tabIndex={0}
            ref={servicesTriggerRef}
            onFocus={openServicesPopover}
            onBlur={(event) => {
              if (
                servicesPopoverRef.current?.contains(
                  event.relatedTarget as Node | null,
                )
              ) {
                return;
              }

              closeServicesPopover();
            }}
            className="inline-flex max-w-full items-center gap-1 font-semibold text-gray-950 outline-none transition hover:text-[var(--tapat-color-brand-purple-700)] focus-visible:text-[var(--tapat-color-brand-purple-700)] md:gap-0.5 lg:gap-1 2xl:gap-1"
          >
            <span className="min-w-0 break-words">
              {caregiver.services.length} services
            </span>
            <Info
              className="h-3.5 w-3.5 shrink-0 text-gray-400 md:h-3 md:w-3 lg:h-3.5 lg:w-3.5 2xl:h-3.5 2xl:w-3.5"
              aria-hidden
            />
          </span>
          {isServicesOpen ? (
            <span
              ref={servicesPopoverRef}
              tabIndex={-1}
              onMouseEnter={openServicesPopover}
              onMouseLeave={closeServicesPopover}
              onBlur={(event) => {
                if (
                  servicesTriggerRef.current?.contains(
                    event.relatedTarget as Node | null,
                  )
                ) {
                  return;
                }

                closeServicesPopover();
              }}
              className={`absolute z-20 rounded-xl border border-gray-200 bg-white p-3 shadow-lg ${
                servicesPlacement.openAbove
                  ? "bottom-full mb-2"
                  : "top-full mt-2"
              }`}
              style={{
                width: `${servicesPlacement.width}px`,
                maxWidth: "calc(100vw - 2rem)",
                left: `${servicesPlacement.left}px`,
              }}
            >
              <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                All services
              </span>

              <span className="flex max-w-full flex-wrap gap-2">
                {caregiver.services.map((service) => (
                  <DashboardChip
                    key={service}
                    label={service}
                    className="max-w-full whitespace-normal break-words text-left"
                  />
                ))}
              </span>
            </span>
          ) : null}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 md:mt-3 md:gap-1.5 lg:mt-3.5 lg:gap-1.5 xl:mt-4 xl:gap-2 2xl:mt-4 2xl:gap-2">
        {caregiver.services.slice(0, 7).map((service, index) => (
          <DashboardChip
            key={service}
            label={service}
            className={`${getServiceVisibilityClassName(index)} md:px-2 md:py-0.5 md:text-[10px] md:leading-4 lg:px-2.5 lg:py-0.5 lg:text-[11px] xl:px-3 xl:py-1 xl:text-xs 2xl:px-3 2xl:py-1 2xl:text-xs`}
          />
        ))}
      </div>
    </article>
  );
}

function getServiceVisibilityClassName(index: number) {
  if (index < 4) {
    return "";
  }

  if (index === 4) {
    return "hidden md:inline-flex";
  }

  if (index === 5) {
    return "hidden lg:inline-flex";
  }

  if (index === 6) {
    return "hidden xl:inline-flex";
  }

  return "hidden";
}

function RateBlock({
  rate,
  className = "",
}: {
  rate: string;
  className?: string;
}) {
  return (
    <div
      className={`shrink-0 text-left md:min-w-[3.5rem] md:text-right lg:min-w-[4rem] xl:min-w-[4.5rem] 2xl:min-w-0 ${className}`}
    >
      <p className="text-sm font-bold leading-none tracking-normal text-black md:text-md lg:text-lg xl:text-xl 2xl:text-2xl">
        {rate}
      </p>
      <p className="mt-0.5 text-xs font-medium text-gray-600 md:text-[10px] md:leading-4 lg:text-[11px] xl:text-xs 2xl:text-xs">
        per hour
      </p>
      <div className="mt-1 flex items-center gap-1 text-[var(--tapat-color-brand-purple-700)] md:mt-1 md:justify-end lg:mt-1 xl:mt-1 2xl:mt-3">
        <Star
          className="h-4 w-4 fill-current md:h-3.5 md:w-3.5 xl:h-4 xl:w-4 2xl:h-4 2xl:w-4"
          aria-hidden
        />
        <span className="text-sm font-semibold md:text-xs lg:text-[13px] xl:text-sm 2xl:text-sm">
          4.9
        </span>
      </div>
    </div>
  );
}
