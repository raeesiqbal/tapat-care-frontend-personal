"use client";
import { useEffect, useRef, useState } from "react";
import { LinkButton } from "@/components/ui/LinkButton";
import Image from "next/image";

const AnimatedWordBadge = ({ text }: { text: string }) => {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);

  const measure = () => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;
    const newWidth = textEl.offsetWidth + 36;
    container.style.width = `${newWidth}px`;
  };

  useEffect(() => {
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <span
      ref={containerRef}
      className="inline-block bg-orange-500 w-auto text-white rounded-[10px] px-[18px] py-[6px] transition-[width] duration-300 ease-in-out overflow-hidden align-middle"
    >
      {/* key={text} forces the fade-in animation to replay on change */}
      <span
        ref={textRef}
        key={text}
        className="inline-block animate-fade-in whitespace-nowrap"
      >
        {text}
      </span>
    </span>
  );
};

const WORDS = [
  "Safety",
  "Motivation",
  "Assiduity",
  "Reliable",
  "Trustworthy",
] as const;

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Set up intersection observer
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }, // 10% visibility is enough to consider it "visible"
    );

    observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Word rotation effect
  useEffect(() => {
    if (!isVisible || prefersReducedMotion) return; // Only run when visible and motion is allowed

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % WORDS.length);
    }, 1000); // Change word every 1 second

    return () => clearInterval(interval);
  }, [isVisible, prefersReducedMotion]);

  return (
    <section ref={sectionRef} className="w-full">
      <article className="w-full h-[600px] lg:h-[650px] 2xl:h-[900px] overflow-hidden relative">
        <Image
          src="/assets/images/heroImage.png"
          alt="Hero Image"
          fill
          className="object-cover object-center"
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={90}
        />
        <div className="hidden sm:block absolute inset-0 z-10 pointer-events-none">
          <Image
            src="/assets/images/shade.png"
            alt="Shade overlay"
            fill
            className="object-cover object-center"
            sizes="100vw"
            quality={85}
          />
        </div>
        <div className="h-full w-full absolute top-0 z-10 gradient-overlay"></div>

        {/* Constrained content container (does not affect background images) */}
        <div className="absolute inset-0 z-20">
          <div className="w-full relative max-w-[1440px] mx-auto ml-auto mr-auto h-full">
            {/* Mobile stacked overlay (small screens) */}
            <main className="absolute inset-0 flex flex-col  items-center justify-center text-center px-[20px] gap-[18px] md:hidden">
              {/* <h1 className="text-[34px] sm:text-[40px]  font-bold text-white flex flex-col items-center justify-center gap-y-[12px]">
                <span>We deliver care with</span>
                <AnimatedWordBadge text={WORDS[currentIndex]} />
              </h1> */}

              <aside className="inline-flex items-center rounded-[999px]  bg-black/60 backdrop-blur-[6px] px-[14px] py-[8px]">
                <div className="flex -space-x-3 mr-[10px]">
                  <Image
                    src="/assets/images/avatar3.svg"
                    alt="Partner avatar"
                    width={34}
                    height={34}
                    className="rounded-full border-2 border-white w-[34px] h-[34px]"
                    sizes="34px"
                  />
                  <Image
                    src="/assets/images/avatar1.svg"
                    alt="Partner avatar"
                    width={34}
                    height={34}
                    className="rounded-full border-2 border-white w-[34px] h-[34px]"
                    sizes="34px"
                  />
                  <Image
                    src="/assets/images/avatar2.svg"
                    alt="Partner avatar"
                    width={34}
                    height={34}
                    className="rounded-full border-2 border-white w-[34px] h-[34px]"
                    sizes="34px"
                  />
                </div>
                <span className="text-white font-medium">
                  500+ Happy Partners
                </span>
              </aside>

              <p className="text-[16px] text-white max-w-[560px]">
                Clarity and compassion with your caregiver connection.
              </p>

              <nav className="w-full max-w-[420px] flex flex-col gap-[12px]">
                <LinkButton
                  href="/contact"
                  className="w-full bg-primary text-white "
                  fullWidth
                >
                  CONNECT AS PATIENT
                </LinkButton>
                <LinkButton
                  href="/contact"
                  className="w-full bg-white hover:bg-gray-100 text-gray-800"
                  fullWidth
                  animationColor="black/10"
                >
                  Direct-Hire Caregivers
                </LinkButton>
              </nav>
            </main>

            {/* Testimonial pill - top-left for md+ */}
            <div className="flex flex-col md:pl-[56px]">
              <aside className="hidden lg:flex md:absolute  md:hidden lg:bottom-[340px] text-white rounded-[999px] items-center gap-[12px] backdrop-blur-[6px] p-[12px] bg-[#00000080]">
                <div className="flex -space-x-[10px]">
                  <Image
                    src="/assets/images/avatar3.svg"
                    alt="Partner avatar"
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-white w-[36px] h-[36px]"
                    sizes="36px"
                  />
                  <Image
                    src="/assets/images/avatar1.svg"
                    alt="Partner avatar"
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-white w-[36px] h-[36px]"
                    sizes="36px"
                  />
                  <Image
                    src="/assets/images/avatar2.svg"
                    alt="Partner avatar"
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-white w-[36px] h-[36px]"
                    sizes="36px"
                  />
                  <Image
                    src="/assets/images/avatar3.svg"
                    alt="Partner avatar"
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-white w-[36px] h-[36px]"
                    sizes="36px"
                  />
                </div>
                <span className="ml-[8px] text-white font-medium">
                  500+ Happy Partners
                </span>
              </aside>

              {/* Main heading block - bottom-left for md+ */}
              <main className="hidden md:block md:absolute  md:bottom-[80px] text-white max-w-[1440px]">
                {/* <h1 className="text-[56px]  font-bold text-white flex flex-wrap items-center gap-x-[12px]">
                  <span>We deliver care with</span>
                  <AnimatedWordBadge text={WORDS[currentIndex]} />
                </h1> */}
                <p className="mt-[18px] text-[18px] text-white w-ful max-w-[800px]">
                  Clarity and compassion with your caregiver connection.
                </p>

                <nav className="mt-[28px] flex gap-[16px]">
                  <LinkButton
                    href="/contact"
                    className="bg-primary text-white md:w-[226px]"
                  >
                    CONNECT AS PATIENT
                  </LinkButton>
                  <LinkButton
                    href="/contact"
                    className="bg-white hover:bg-gray-100 text-gray-800 md:w-[226px]"
                    animationColor="black/10"
                  >
                    Direct-Hire Caregivers
                  </LinkButton>
                </nav>
              </main>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
