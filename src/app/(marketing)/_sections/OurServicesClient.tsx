"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";

import { LinkButton } from "@/components/ui/LinkButton";
import { TabItem } from "@/components/ui/TabItem";
import type { MarketingServiceContent } from "@/lib/marketing-services";

type OurServicesClientProps = {
  tabs: string[];
  data: Record<string, MarketingServiceContent>;
  initialTab: string;
};

type ScrollMetrics = {
  canScroll: boolean;
  thumbLeft: number;
  thumbWidth: number;
};

type TabScrollerProps = {
  tabs: string[];
  activeTab: string;
  variant: "desktop" | "mobile";
  onSelect: (tab: string) => void;
};

const EMPTY_SCROLL_METRICS: ScrollMetrics = {
  canScroll: false,
  thumbLeft: 0,
  thumbWidth: 0,
};

const MIN_THUMB_WIDTH = 72;
const DRAG_THRESHOLD = 5;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function useTabScroller() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({
    hasMoved: false,
    pointerId: null as number | null,
    scrollLeft: 0,
    startX: 0,
  });
  const suppressClickRef = useRef(false);
  const [metrics, setMetrics] = useState<ScrollMetrics>(EMPTY_SCROLL_METRICS);

  const updateMetrics = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const viewportWidth = viewport.clientWidth;
    const scrollWidth = viewport.scrollWidth;
    const maxScrollLeft = scrollWidth - viewportWidth;
    const canScroll = maxScrollLeft > 1;

    if (!canScroll || viewportWidth <= 0 || scrollWidth <= 0) {
      setMetrics((previous) =>
        previous.canScroll ? EMPTY_SCROLL_METRICS : previous,
      );
      return;
    }

    const thumbWidth = clamp(
      Math.round((viewportWidth / scrollWidth) * viewportWidth),
      MIN_THUMB_WIDTH,
      viewportWidth,
    );
    const maxThumbLeft = viewportWidth - thumbWidth;
    const thumbLeft =
      maxThumbLeft > 0
        ? Math.round((viewport.scrollLeft / maxScrollLeft) * maxThumbLeft)
        : 0;
    const nextMetrics = {
      canScroll,
      thumbLeft,
      thumbWidth,
    };

    setMetrics((previous) =>
      previous.canScroll === nextMetrics.canScroll &&
      previous.thumbLeft === nextMetrics.thumbLeft &&
      previous.thumbWidth === nextMetrics.thumbWidth
        ? previous
        : nextMetrics,
    );
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    let animationFrame = 0;

    const scheduleMetricsUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateMetrics);
    };

    const handleWheel = (event: WheelEvent) => {
      const canScrollHorizontally = viewport.scrollWidth > viewport.clientWidth;

      if (!canScrollHorizontally) {
        return;
      }

      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();
        viewport.scrollLeft += event.deltaY;
        scheduleMetricsUpdate();
      }
    };

    viewport.addEventListener("scroll", scheduleMetricsUpdate, {
      passive: true,
    });
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("resize", scheduleMetricsUpdate);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleMetricsUpdate);

    resizeObserver?.observe(viewport);

    if (viewport.firstElementChild) {
      resizeObserver?.observe(viewport.firstElementChild);
    }

    scheduleMetricsUpdate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      viewport.removeEventListener("scroll", scheduleMetricsUpdate);
      viewport.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", scheduleMetricsUpdate);
      resizeObserver?.disconnect();
    };
  }, [updateMetrics]);

  const moveToTrackPosition = useCallback(
    (clientX: number, track: HTMLDivElement) => {
      const viewport = viewportRef.current;

      if (!viewport) {
        return;
      }

      const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;

      if (maxScrollLeft <= 0) {
        return;
      }

      const trackWidth = track.getBoundingClientRect().width;
      const thumbWidth = clamp(
        Math.round((viewport.clientWidth / viewport.scrollWidth) * trackWidth),
        MIN_THUMB_WIDTH,
        trackWidth,
      );
      const maxThumbLeft = trackWidth - thumbWidth;

      if (maxThumbLeft <= 0) {
        return;
      }

      const trackLeft = track.getBoundingClientRect().left;
      const nextThumbLeft = clamp(
        clientX - trackLeft - thumbWidth / 2,
        0,
        maxThumbLeft,
      );

      viewport.scrollLeft = (nextThumbLeft / maxThumbLeft) * maxScrollLeft;
      updateMetrics();
    },
    [updateMetrics],
  );

  const handleTrackPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();

      const track = event.currentTarget;
      const pointerId = event.pointerId;

      track.setPointerCapture(pointerId);
      moveToTrackPosition(event.clientX, track);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        moveToTrackPosition(moveEvent.clientX, track);
      };
      const handlePointerEnd = () => {
        track.removeEventListener("pointermove", handlePointerMove);
        track.removeEventListener("pointerup", handlePointerEnd);
        track.removeEventListener("pointercancel", handlePointerEnd);

        if (track.hasPointerCapture(pointerId)) {
          track.releasePointerCapture(pointerId);
        }
      };

      track.addEventListener("pointermove", handlePointerMove);
      track.addEventListener("pointerup", handlePointerEnd);
      track.addEventListener("pointercancel", handlePointerEnd);
    },
    [moveToTrackPosition],
  );

  const handleViewportPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      const target = event.target;

      if (target instanceof Element && target.closest("button")) {
        return;
      }

      const viewport = viewportRef.current;

      if (!viewport || viewport.scrollWidth <= viewport.clientWidth) {
        return;
      }

      dragRef.current = {
        hasMoved: false,
        pointerId: event.pointerId,
        scrollLeft: viewport.scrollLeft,
        startX: event.clientX,
      };
      viewport.setPointerCapture(event.pointerId);
    },
    [],
  );

  const handleViewportPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;

      if (drag.pointerId !== event.pointerId) {
        return;
      }

      const viewport = viewportRef.current;

      if (!viewport) {
        return;
      }

      const deltaX = event.clientX - drag.startX;

      if (!drag.hasMoved && Math.abs(deltaX) < DRAG_THRESHOLD) {
        return;
      }

      drag.hasMoved = true;
      suppressClickRef.current = true;
      event.preventDefault();
      viewport.scrollLeft = drag.scrollLeft - deltaX;
      updateMetrics();
    },
    [updateMetrics],
  );

  const endViewportDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;

      if (drag.pointerId !== event.pointerId) {
        return;
      }

      const viewport = viewportRef.current;
      const shouldSuppressClick = drag.hasMoved;

      if (viewport?.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }

      dragRef.current = {
        hasMoved: false,
        pointerId: null,
        scrollLeft: 0,
        startX: 0,
      };

      if (shouldSuppressClick) {
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      } else {
        suppressClickRef.current = false;
      }

      updateMetrics();
    },
    [updateMetrics],
  );

  const handleViewportClickCapture = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!suppressClickRef.current) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    },
    [],
  );

  return {
    metrics,
    viewportHandlers: {
      onClickCapture: handleViewportClickCapture,
      onPointerCancel: endViewportDrag,
      onPointerDown: handleViewportPointerDown,
      onPointerMove: handleViewportPointerMove,
      onPointerUp: endViewportDrag,
    },
    viewportRef,
    trackHandlers: {
      onPointerDown: handleTrackPointerDown,
    },
  };
}

function ServiceTabScroller({
  tabs,
  activeTab,
  variant,
  onSelect,
}: TabScrollerProps) {
  const { metrics, viewportHandlers, viewportRef, trackHandlers } =
    useTabScroller();
  const isDesktop = variant === "desktop";

  return (
    <div>
      <div
        ref={viewportRef}
        className={`services-category-scroll overflow-x-auto overflow-y-hidden select-none [touch-action:pan-x] ${
          isDesktop ? "pb-0" : "-mx-4 px-4 pb-3 md:snap-x md:snap-mandatory"
        }`}
        {...viewportHandlers}
      >
        <div
          className={
            isDesktop
              ? "flex w-max min-w-full justify-center gap-3"
              : "flex w-max gap-3"
          }
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;

            if (isDesktop) {
              return (
                <TabItem
                  key={tab}
                  label={tab}
                  isActive={isActive}
                  onClick={() => onSelect(tab)}
                />
              );
            }

            return (
              <button
                key={tab}
                onClick={() => onSelect(tab)}
                className={`cursor-pointer whitespace-nowrap rounded-full border border-gray-200 px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-transparent bg-indigo-100 text-primary"
                    : "bg-white text-gray-600"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {metrics.canScroll && (
        <div aria-hidden="true" className="mt-1 h-4 w-full">
          <div
            className="relative flex h-full cursor-pointer items-center [touch-action:none]"
            {...trackHandlers}
          >
            <div className="relative h-[4px] w-full rounded-full">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-[var(--tapat-color-violet-100)]"
                style={{
                  transform: `translateX(${metrics.thumbLeft}px)`,
                  width: `${metrics.thumbWidth}px`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function OurServicesClient({
  tabs,
  data,
  initialTab,
}: OurServicesClientProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const content = data[activeTab] || data[initialTab];

  return (
    <section id="services" className="md:py-[56px] py-8 px-4">
      <header className="flex flex-col justify-center items-center gap-[16px]">
        <p className="text-pink text-[14px] ">Services</p>
        <h2 className="text-[22px] md:text-[32px] font-semibold text-gray-900 text-center">
          Care Services, Built Around
          <br />
          Sincerity and Trust
        </h2>
        <p className="text-gray-900 text-[16px] text-center w-full max-w-[408px] md:max-w-[584px]">
          From companionship to tailored medical care, services adapt to family
          needs with flexibility, respect, and budget-friendly choices.
        </p>
      </header>

      <article className="w-full relative max-w-[1440px] mx-auto">
        <nav className="hidden xl:block mt-[48px]">
          <ServiceTabScroller
            tabs={tabs}
            activeTab={activeTab}
            variant="desktop"
            onSelect={setActiveTab}
          />
        </nav>
      </article>

      <div className="hidden xl:block border-b border-gray-200" />

      <div className="md:px-[56px] pt-4 md:pt-[48px] ">
        <article className="w-full relative max-w-[1440px] mx-auto ml-auto mr-auto">
          <nav className="xl:hidden  max-[400px]:pt-4">
            <ServiceTabScroller
              tabs={tabs}
              activeTab={activeTab}
              variant="mobile"
              onSelect={setActiveTab}
            />
          </nav>

          <main className="flex flex-col xl:grid xl:grid-cols-2 ">
            <article className="flex flex-col gap-[20px] md:gap-[32px] pt-4 md:pt-[32px] px-[12px]">
              <h3 className="text-[18px] font-semibold text-gray-900 leading-[26px] ">
                {content.title}
              </h3>
              <p className="text-gray-900 text-[16px] leading-[26px] tracking-[0.18px]">
                {content.description}
              </p>

              <ul className="grid  max-[480px]:grid-cols-1 grid-cols-2 gap-6">
                {content.features.map((feature, index) => (
                  <li
                    key={`${feature.text}-${index}`}
                    className="flex items-center gap-2"
                  >
                    <figure>
                      {feature.icon.startsWith("/assets/icons/") ? (
                        <Image
                          src={feature.icon}
                          alt={`${feature.text} icon`}
                          width={22}
                          height={22}
                        />
                      ) : (
                        feature.icon
                      )}
                    </figure>
                    <p className="text-gray-900 leading-[26px] tracking-[0.18px] text-[16px]">
                      {feature.text}
                    </p>
                  </li>
                ))}
              </ul>
            </article>

            <figure className="flex justify-end md:justify-center w-full pt-3 md:pt-0">
              <div className="relative w-full max-w-[360px] aspect-square rounded-full overflow-hidden shadow-lg max-[400px]:mt-[32px]">
                <Image
                  src={content.image}
                  alt={`${activeTab} services`}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 80vw, 360px"
                  quality={85}
                />
              </div>
            </figure>
          </main>

          <div className=" flex md:flex-row flex-col w-full justify-center items-center gap-[16px] mt-[48px]">
            <LinkButton
              href="/about"
              className="bg-violet-50 hover:bg-gray-200 text-gray-800 md:w-[184px] w-full p-[16px]"
              animation="shine"
              animationColor="white/60"
            >
              MORE ABOUT US
            </LinkButton>
            <LinkButton
              href="/contact"
              className="bg-primary text-white md:w-[260px] w-full p-[16px]"
              animation="shine"
              animationColor="white/30"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            >
              DISCUSS YOUR STORY
            </LinkButton>
          </div>
        </article>
      </div>
    </section>
  );
}
