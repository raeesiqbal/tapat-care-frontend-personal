"use client";

import { LinkButton } from "@/components/ui/LinkButton";
import { proofPoints } from "@/data/TrustedReferrals";
import Image from "next/image";

export function TrustedReferrals() {
  return (
    <section className="bg-gray-50">
      <div className="py-8 px-4 md:p-[56px]">
        <article className="w-full relative max-w-[1440px] mx-auto ml-auto mr-auto ">
          <header className="flex flex-wrap gap-[16px] items-center mb-12 justify-between  max-[1231px]:text-center  max-[1231px]:justify-center">
            {/* Left side - Heading */}
            <hgroup>
              <p className="text-pink text-[14px]">Our Referrals</p>
              <h2 className="md:text-[32px] text-[22px] font-semibold text-gray-900 mt-2 max-w-[607px] max-[1231px]:text-center">
                Trusted Referrals from Doctors, Nurses, Case Managers and
                Social workers.
              </h2>
            </hgroup>

            {/* Right side - Description */}
            <aside>
              <p className="text-gray-900 text-[16px] max-w-[497px]  max-[1231px]:text-center">
                Healthcare professionals turn to Tapat when their patients need
                reliable support at home. Their referrals are proof of our
                sincerity, safety, and consistency.
              </p>
            </aside>
          </header>

          {/* Proof Points Section */}
          <section className="bg-gray-100 rounded-[30px] flex flex-col justify-center md:px-[56px] md:py-[32px] p-[24px] ">
            <h3 className="text-[24px] font-semibold text-gray-900 text-center mb-8">
              Proof Points
            </h3>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {proofPoints.map((point, index) => (
                <li
                  key={index}
                  className="bg-white w-full max-w-[384px] rounded-[20px] p-6 shadow-sm flex flex-col items-center"
                >
                  <figure className="mb-4 overflow-hidden rounded-lg w-full relative h-[282px]">
                    <Image
                      src={point.image}
                      alt={point.alt}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  </figure>
                  <p className="text-gray-900 text-[18px] mt-6 text-left">
                    {point.title}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex justify-center mt-[32px]">
            <LinkButton
              href="/about"
              className="bg-primary text-white w-full md:w-[274px] "
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
              LEARN MORE ABOUT US
            </LinkButton>
          </div>
        </article>
      </div>
    </section>
  );
}
