"use client";
import { useState, useRef, useEffect } from "react";
import type { ValueId } from "@/interface";
import { LinkButton } from "@/components/ui/LinkButton";
import { values } from "@/data/WhatTapatMeans";
import Image from "next/image";

export function WhatTapatMeans() {
  const [active, setActive] = useState<ValueId>(1);
  const containerRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const el = itemRefs.current[active - 1];
      const progressBar = progressBarRef.current;

      if (!container || !el || !progressBar) return;

      const containerRect = container.getBoundingClientRect();
      const activeDiv = el.querySelector("div");

      if (!activeDiv) return;

      const activeDivRect = activeDiv.getBoundingClientRect();
      const top = activeDivRect.top - containerRect.top;
      const height = activeDivRect.height;

      // Set CSS custom properties instead of inline styles
      progressBar.style.setProperty("--progress-top", `${top}px`);
      progressBar.style.setProperty("--progress-height", `${height}px`);
    };

    update();
    window.addEventListener("resize", update);

    let ro: ResizeObserver | null = null;
    try {
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => requestAnimationFrame(update));
        if (containerRef.current) ro.observe(containerRef.current);
        itemRefs.current.forEach((el) => {
          if (el) ro!.observe(el);
        });
      }
    } catch (e) {
      ro = null;
    }

    const imgs: HTMLImageElement[] = [];
    if (containerRef.current) {
      containerRef.current.querySelectorAll("img").forEach((im) => {
        const img = im as HTMLImageElement;
        imgs.push(img);
        img.addEventListener("load", update);
      });
    }

    return () => {
      window.removeEventListener("resize", update);
      if (ro) ro.disconnect();
      imgs.forEach((img) => img.removeEventListener("load", update));
    };
  }, [active]);

  return (
    <section id="what-tapat-means" className="py-8 px-4 md:p-[56px] bg-white">
      <article className="w-full relative max-w-[1440px] mx-auto ml-auto mr-auto">
        <header className="flex flex-col items-center justify-center gap-[16px]">
          <p className="text-pink text-[14px] ">Conclusion</p>
          <h2 className="md:text-[32px] text-[22px] w-full max-w-[408px] md:max-w-[658px] text-center font-semibold text-gray-900">
            What "tapat" Means, And Why <br className="block md:hidden" />
            It Matters
          </h2>

          <p className="text-[16px] text-gray-900 w-full max-w-[408px] md:max-w-[584px] text-center ">
            At the heart of <span className="font-bold">Tapat</span> is
            sincerity. Our name itself means sincere, and this value guides
            everything we do.
          </p>
        </header>

        <main className="flex flex-col lg:flex-row gap-12 items-start md:mt-[48px] mt-[32px]">
          {/* Left side - Values with interactive selection */}
          <aside className="w-full lg:w-1/2">
            <nav className="flex">
              {/* left rail container (relative so we can position the gray line and purple segment) */}
              <div className="relative w-[6px] ">
                {/* full gray vertical line */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[6px] bg-gray-200 rounded" />
                {/* purple segment positioned over the active item */}
                <div ref={progressBarRef} className="progress-bar-segment" />
              </div>

              <ul className="space-y-1 w-full" ref={containerRef}>
                {values.map((value, idx) => {
                  const isActive = active === value.id;
                  const iconSrc = isActive ? value.activeIcon : value.icon;

                  return (
                    <li
                      key={value.id}
                      ref={(el) => {
                        itemRefs.current[idx] = el;
                      }}
                    >
                      <div
                        className={`w-full rounded-lg transition-all ${
                          isActive ? "bg-gray-100" : ""
                        }`}
                      >
                        <button
                          onClick={() => setActive(value.id)}
                          className={`w-full text-left cursor-pointer flex items-start gap-4 p-4 ${
                            isActive ? "" : "hover:bg-gray-100/50"
                          }`}
                        >
                          {/* Icon */}
                          <figure
                            className={`shrink-0 ${
                              isActive ? "text-primary" : "text-gray-400"
                            } md:mr-4`}
                          >
                            <div className="relative w-8 h-8">
                              <Image
                                src={iconSrc}
                                alt={`value-${value.id}-icon`}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </figure>

                          <div>
                            <h3
                              className={`text-[18px] ${
                                isActive
                                  ? "text-gray-900 font-semibold"
                                  : "text-gray-900"
                              } mb-1`}
                            >
                              {value.title}
                            </h3>

                            {/* Description - always visible when active */}
                            {isActive && (
                              <div className="mt-2">
                                <p className="text-gray-900 text-[16px] leading-[26px] tracking-[0.18px]">
                                  {value.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Right side - Image */}
          <figure className="w-full lg:w-1/2 flex justify-end">
            <div className="relative w-full flex justify-end ">
              <Image
                src="/assets/images/Conclusion.png"
                alt="Caregiver helping patient"
                width={1200}
                height={800}
                className="w-full h-auto object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
                loading="lazy"
              />
            </div>
          </figure>
        </main>
        <div className="flex justify-center w-full md:mt-18 mt-[32px]">
          <LinkButton
            href="/about"
            className="bg-violet-50 border-gray-300 cursor-pointer text-gray-800 font-medium flex justify-center p-4 rounded-[16px] w-full md:w-[184px]"
            animation="shine"
            animationColor="white/60"
          >
            <span>MORE ABOUT US</span>
          </LinkButton>
        </div>
      </article>
    </section>
  );
}
