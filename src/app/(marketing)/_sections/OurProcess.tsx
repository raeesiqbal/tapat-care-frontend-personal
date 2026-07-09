"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import type { StepId } from "@/interface";
import { LinkButton } from "@/components/ui/LinkButton";
import { steps } from "@/data/OurProcess";

export function OurProcess() {
  const [active, setActive] = useState<StepId>(1);
  const [prevActive, setPrevActive] = useState<StepId>(1);
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
      const whiteDiv = el.querySelector("div");

      if (!whiteDiv) return;

      const whiteDivRect = whiteDiv.getBoundingClientRect();
      const top = whiteDivRect.top - containerRect.top;
      const height = whiteDivRect.height;

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
    <section id="how-it-works" className="py-8 px-4 md:p-[56px] bg-violet-50">
      <div className="flex flex-col max-w-[1440px] mx-auto ml-auto mr-auto gap-[16px]">
        <div className="flex flex-col items-center justify-center">
          <p className="text-pink text-center">Our Process</p>
          <h2 className="text-center text-gray-900 md:text-[32px] text-[22px] md:max-w-[658px] max-w-[408px] w-full font-semibold">
            Getting started is simple and stress free
          </h2>
          <p className="text-center text-gray-900 text-[16px] max-w-[408px] md:max-w-[584px] w-full">
            In just a few steps, families and caregivers can connect, match, and
            begin care without the delays or confusion.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between mt-10 relative ">
          <div className="">
            <div className="flex">
              <div className="relative w-[8px]">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[6px] bg-gray-200 rounded" />
                <div ref={progressBarRef} className="progress-bar-segment" />
              </div>

              <ul className="w-full" ref={containerRef}>
                {steps.map((s, idx) => {
                  const isActive = active === s.id;
                  const iconSrc = isActive ? s.activeIcon : s.icon;

                  return (
                    <li
                      key={s.id}
                      ref={(el) => {
                        itemRefs.current[idx] = el;
                      }}
                    >
                      <div
                        className={`w-full rounded-lg transition-all ${isActive ? "bg-white shadow-md" : ""
                          }`}
                      >
                        <button
                          onClick={() => {
                            setPrevActive(active);
                            setActive(s.id);
                          }}
                          className={`w-full text-left flex cursor-pointer flex-col md:flex-row md:items-center gap-2 md:gap-4 px-6 py-6 md:py-5 ${isActive ? "" : "hover:bg-white/50"
                            }`}
                        >
                          <div
                            className={`shrink-0 ${isActive ? "text-primary" : "text-gray-400"
                              } md:mr-4`}
                          >
                            <Image
                              src={iconSrc}
                              alt={`step-${s.id}-icon`}
                              width={32}
                              height={32}
                              className="object-contain w-[32px] h-[32px]"
                              sizes="32px"
                              loading="lazy"
                            />
                          </div>

                          <span
                            className={`mt-2 md:mt-0 text-base md:text-lg font-semibold ${isActive ? "text-gray-900" : "text-gray-600"
                              }`}
                          >
                            {s.title}
                          </span>
                        </button>

                        {isActive && (
                          <div className="xl:hidden px-6 pb-6">
                            <p className="mt-2 text-gray-700 leading-relaxed">
                              Create your profile in minutes and tell us your
                              care needs or caregiver skills. No paperwork
                              headaches, just a simple
                              <br /> form.
                            </p>

                            <figure className="w-full rounded-[16px] bg-lightPink-10 p-6 mt-4">
                              <Image
                                src={s.img}
                                alt={`step-${s.id}`}
                                width={600}
                                height={400}
                                className="w-full h-auto rounded-lg object-cover"
                                sizes="(max-width: 768px) calc(100vw - 80px), 600px"
                                quality={85}
                              />
                            </figure>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="hidden md:block mt-8 md:ml-12 ml-0 text-gray-700 leading-relaxed max-w-md">
              Create your profile in minutes and tell us your care needs or
              caregiver skills. No paperwork headaches, just a simple
              <br /> form.
            </p>
          </div>

          <div className="hidden xl:flex items-center mt-[180px] mr-[15px]">
            <Image
              src="/assets/images/ProcessArrow.svg"
              alt="arrow"
              width={100}
              height={100}
              className="w-[100px] h-auto object-contain"
              sizes="100px"
              aria-hidden="true"
            />
          </div>

          <aside className="hidden xl:flex items-start justify-center">
            <div
              className={`w-[647px] h-[428px] rounded-[16px] flex justify-center items-center bg-lightPink-10 ${active === 3 ? "p-0" : active === 1 ? "pt-8 px-8" : "p-[36px]"
                }`}
            >
              {active === 1 && (
                <Image
                  src="/assets/images/frame_17.png"
                  alt={`step-${active}`}
                  width={647}
                  height={420}
                  className="w-auto h-full max-h-[420px] object-contain"
                  sizes="(min-width: 1280px) 647px, 80vw"
                  quality={85}
                  loading="lazy"
                />
              )}
              {active === 2 && (
                <div className="flex gap-8 relative justify-center items-center">
                  <div className="flex flex-col gap-[18px] h-[200px] justify-center items-center text-center">
                    <Image
                      src="/assets/images/frame_31.png"
                      alt={`step-${active}`}
                      width={350}
                      height={400}
                      className="w-full h-full rounded-lg object-cover"
                      sizes="(min-width: 1280px) 350px, 40vw"
                      quality={85}
                      loading="lazy"
                    />
                    <div
                      className={`flex flex-col justify-center items-center text-center relative bottom-0 ${prevActive === 3
                        ? "animate-[slideFromBottomRight_0.3s_ease-out]"
                        : ""
                        }`}
                    >
                      <h3 className="text-base text-gray-900 font-semibold">
                        Michael Anderson
                      </h3>
                      <span className="text-sm text-slate-500 font-normal">
                        15 Year Experience
                      </span>
                    </div>
                  </div>
                  <Image
                    src="/assets/images/frame_33.svg"
                    alt={`step-${active}-image-s`}
                    width={80}
                    height={80}
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] object-contain ${prevActive === 3
                        ? "animate-[slideFromTopLeft_0.3s_ease-out]"
                        : ""
                      }`}
                    sizes="80px"
                  />
                  <div className="flex flex-col-reverse gap-[18px] h-[200px] justify-center items-center text-center">
                    <Image
                      src="/assets/images/frame_32.png"
                      alt={`step-${active}`}
                      width={250}
                      height={300}
                      className="w-full h-full rounded-lg object-cover"
                      sizes="(min-width: 1280px) 250px, (min-width: 768px) 30vw, 60vw"
                      quality={85}
                    />
                    <div
                      className={`flex flex-col justify-center items-center text-center ${prevActive !== 1
                          ? "animate-[fadeInWalter_0.3s_ease-in-out]"
                          : ""
                        }`}
                    >
                      <h3 className="text-base text-gray-900 font-semibold">
                        Walter Jenkins
                      </h3>
                      <span className="text-sm text-slate-500 font-normal">
                        68 Years Old
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {active === 3 && (
                <div className="relative">
                  <Image
                    src="/assets/images/frame_24.png"
                    alt={`step-${active}-image`}
                    width={647}
                    height={420}
                    className="w-auto h-auto object-contain"
                    sizes="(min-width: 1280px) 647px, (min-width: 768px) 80vw, 100vw"
                    quality={85}
                    loading="lazy"
                  />
                  <Image
                    src="/assets/images/frame_25.svg"
                    alt={`step-${active}-image-p`}
                    width={120}
                    height={120}
                    className={`absolute top-[106px] left-[97px] w-[120px] h-[120px] object-contain ${prevActive !== 1
                        ? "animate-[slideFromCenter_0.2s_ease-out]"
                        : ""
                      }`}
                    sizes="120px"
                  />
                  <Image
                    src="/assets/images/frame_26.svg"
                    alt={`step-${active}-image-b`}
                    width={120}
                    height={120}
                    className={`absolute top-[217px] left-[465px] w-[120px] h-[120px] object-contain ${prevActive !== 1
                        ? "animate-[slideFromBottomLeftJiggle_0.2s_ease-out]"
                        : ""
                      }`}
                    sizes="120px"
                  />
                </div>
              )}
            </div>
          </aside>
        </div>

        <nav className="mt-12 flex flex-col sm:flex-row w-full justify-center gap-4">
          <LinkButton
            href="/contact"
            className="w-full md:w-[190px] text-gray-800 border  border-gray-300 hover:bg-gray-50"
            animation="shine"
            animationColor="black/10"
          >
            BOOK A MEETING
          </LinkButton>
          <LinkButton
            href="/contact"
            className="w-full md:w-[190px] bg-primary text-white "
            animation="shine"
            animationColor="white/30"
            icon={<span>→</span>}
          >
            SIGN IN NOW
          </LinkButton>
        </nav>
      </div>
    </section>
  );
}
