"use client";

import { LinkButton } from "@/components/ui/LinkButton";
import { Marquee } from "@/components/ui/Marquee";
import { reviews } from "@/data/UserReviews";
import { UserReviewsProps } from "@/interface";
import Image from "next/image";

export function UserReviews({ title = "User Reviews" }: UserReviewsProps) {
  return (
    <section id="reviews" className="bg-gray-50">
      <div className="p-0 md:pt-[56px] md:pb-[56px]  py-8  md:py-0 md:px-0">
        <article className="w-full relative">
          <div className="px-4">
            <header className="flex flex-col items-center justify-center gap-[16px]">
              <p className="text-pink text-[14px]">{title}</p>
              <h2 className="md:text-[32px] text-[22px] font-semibold text-gray-900 text-center">
                Stories from Families and Caregivers
                <br />
                Who Believe in Us
              </h2>
              <p className="text-[16px] text-gray-900 w-full max-w-[408px] md:max-w-[584px] text-center ">
                Real experiences from people who rely on{" "}
                <span className="font-bold">tapat</span> every day—families,
                caregivers, and medical professionals who trust us to deliver
                sincerity, safety, and respect.
              </p>
            </header>
          </div>

          {/* Scrollable cards container */}
          <Marquee
            as="ul"
            speed={80}
            repeats={3}
            containerClassName="relative overflow-hidden pb-8 mt-[48px]"
            trackClassName="flex flex-row items-stretch gap-6 w-max will-change-transform"
            ariaLabel="User reviews marquee"
          >
            {reviews.map((review, index) => {
              // mobile min-height 278px; desktop: card 3 taller (394px), others 342px
              const isTall = index % reviews.length === 2;
              const heightClass = isTall
                ? "min-h-[278px] md:h-[394px]"
                : "min-h-[278px] md:h-[342px]";
              return (
                <li
                  key={index}
                  className={`bg-white rounded-lg p-6 w-[360px] max-w-[380px] flex flex-col shadow-md ${heightClass} md:snap-center`}
                >
                  <h3 className="font-semibold max-w-[316px] text-gray-900 mb-6 text-[18px]">
                    {review.title}
                  </h3>
                  <p className="text-[16px] leading-[26px] max-w-[316px] tracking-[0.18px] text-gray-900 ">
                    {review.content}
                  </p>

                  <div
                    className={`flex items-end h-full ${isTall ? "mt-4" : ""}`}
                  >
                    <div className="flex items-center">
                      <figure className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0 relative">
                        <Image
                          src={review.avatar}
                          alt={`${review.author} avatar`}
                          fill
                          className="object-cover"
                        />
                      </figure>
                      <figcaption className="ml-3">
                        <p className="text-[14px] text-gray-900">
                          {review.author}
                        </p>
                      </figcaption>
                    </div>
                  </div>
                </li>
              );
            })}
          </Marquee>

          <nav className="flex flex-col items-center w-full gap-4 mt-8 px-4 ">
            {/* Always visible on mobile, hidden on tablet/desktop */}
            <LinkButton
              href="/about"
              className="bg-violet-50 border border-gray-300 w-full md:w-[232px] hover:bg-primary text-gray-800 py-3 px-6 md:hidden"
              animation="shine"
              animationColor="white/30"
            >
              View More
            </LinkButton>
            {/* Visible on all devices, centered on desktop/tablet */}
            <LinkButton
              href="/about"
              className="bg-primary w-full md:w-[232px] font-semibold  text-white p-[16px]"
              animation="shine"
              animationColor="white/20"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 md:h-5 md:w-5"
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
              FIND A CAREGIVER
            </LinkButton>
          </nav>
        </article>
      </div>
    </section>
  );
}
