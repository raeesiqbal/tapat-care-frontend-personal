"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Info, MapPin, Star } from "lucide-react";

import { DashboardChip } from "@/features/dashboard/components/dashboard-chip";
import type { CaregiverListing } from "@/features/dashboard/types";

type CaregiverListingCardProps = {
  caregiver: CaregiverListing;
};

export function CaregiverListingCard({ caregiver }: CaregiverListingCardProps) {
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

      const unclampedLeft = alignRight
        ? triggerRect.width - nextWidth
        : 0;
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

  return (
    <article className="rounded-lg border border-[var(--tapat-color-gray-200)] bg-white p-3 shadow-card transition hover:border-violet-200 sm:p-4 md:p-5 lg:p-6">
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[7.5rem_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-row items-start gap-3 sm:gap-4 lg:flex-col lg:gap-3">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-violet-200 bg-violet-50 shadow-sm sm:h-28 sm:w-28">
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
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 lg:flex-none">
              <DashboardChip
                label="Background checked"
                variant="brand"
                className="max-w-full"
              />
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-normal text-gray-950 sm:text-xl">
                {caregiver.name}
              </h2>
              <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-600">
                <MapPin
                  className="h-4 w-4 shrink-0 text-gray-400"
                  aria-hidden
                />
                <span className="min-w-0 break-words">
                  {caregiver.location}
                </span>
              </p>
              <p className="mt-2 break-words text-sm font-medium text-gray-700">
                {caregiver.experience}
              </p>
            </div>

            <RateBlock rate={caregiver.rate} className="md:pt-1" />
          </div>
        </div>
      </div>
      <p className="mt-5 max-w-full text-sm leading-6 text-gray-600">
        {caregiver.summary} <span className="text-gray-400">offers</span>{" "}
        <span
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
            className="inline-flex max-w-full items-center gap-1 font-semibold text-gray-950 outline-none transition hover:text-[var(--tapat-color-brand-purple-700)] focus-visible:text-[var(--tapat-color-brand-purple-700)]"
          >
            <span className="min-w-0 break-words">
              {caregiver.services.length} services
            </span>
            <Info className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
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
                servicesPlacement.openAbove ? "bottom-full mb-2" : "top-full mt-2"
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
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {caregiver.services.slice(0, 7).map((service, index) => (
          <DashboardChip
            key={service}
            label={service}
            className={getServiceVisibilityClassName(index)}
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
    <div className={`shrink-0 text-left md:text-right ${className}`}>
      <p className="text-xs font-medium text-gray-500">from</p>
      <p className="text-2xl font-bold leading-none tracking-normal text-black sm:text-3xl">
        {rate}
      </p>
      <p className="mt-0.5 text-xs font-medium text-gray-600">per hour</p>
      <div className="mt-3 flex items-center gap-1 text-[var(--tapat-color-brand-purple-700)] md:justify-end">
        <Star className="h-4 w-4 fill-current" aria-hidden />
        <span className="text-sm font-semibold">4.9</span>
      </div>
    </div>
  );
}
