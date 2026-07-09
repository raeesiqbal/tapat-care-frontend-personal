"use client";
import Image from "next/image";
import { LinkButton } from "@/components/ui/LinkButton";
import {
  directHireFeatures,
  continuousHireBenefits,
} from "@/data/InsuranceAndDirectHire";

export function InsuranceAndDirectHire() {
  return (
    <section className="relative">
      {/* Mobile-only section title */}
      <div className="px-4 md:px-0 max-w-[1440px] mx-auto">
        <div className="text-center mb-8 lg:hidden mt-5">
          <h3 className="text-pink text-[14px] mb-2">Care Options</h3>
          <h1 className="text-[22px] text-gray-900 font-semibold mb-4">
            Two Easy Ways to Get the Care You Need
          </h1>
          <p className="text-gray-500 text-[16px]">
            Choose the care option that suits you best.
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Full-width background layers */}
        <div className="absolute inset-0 hidden lg:grid lg:grid-cols-2 pointer-events-none ">
          <div className="bg-deepPurple-800"></div>
          <div className="bg-gray-50"></div>
        </div>

        {/* Content container with max-w */}
        <div className="md:px-[56px] px-4">
          <div className="relative max-w-[1440px] mx-auto ">
            <div className="grid grid-cols-1 lg:grid-cols-2 ">
              {/* Left Column - Direct Hire Content */}
              <div className="relative overflow-hidden text-white bg-deepPurple-800 max-[1023px]:rounded-[16px]   lg:rounded-none lg:bg-transparent">
                <div className="py-8 px-4 md:p-[56px] max-w-[485px] lg:pr-[56px] lg:pt-[56px] lg:pb-[56px] lg:pl-0">
                  <div className="relative rounded-lg lg:rounded-none">
                    {/* Background image (decorative, fixed size, absolute) */}
                    <div
                      aria-hidden
                      className="absolute right-0 md:right-28 top-18 md:top-38 w-[300px] h-[300px] md:w-[340px] md:h-[380px] lg:w-[420px] lg:h-[460px] pointer-events-none"
                    >
                      <Image
                        src="/assets/images/directhire.png"
                        alt="Direct hire 1"
                        fill
                        loading="lazy"
                        className="object-contain"
                      />
                    </div>
                    <div className="relative z-10">
                      <h2 className="text-[18px] md:text-[24px] font-semibold mb-2">
                        Choose Direct-Hire for Affordable and Transparent Care
                      </h2>
                      <p className="mb-8 text-gray-200 text-[16px]">
                        Families can connect directly with caregivers, helping
                        reduce extra costs and keep arrangements
                        straightforward. This option supports clear
                        communication, flexible scheduling, and a more personal
                        care experience.
                      </p>

                      {/* Features */}
                      <div className="space-y-6 mb-6">
                        {directHireFeatures.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="shrink-0">
                              <Image
                                src={feature.icon}
                                alt={feature.text}
                                width={24}
                                height={24}
                                className="object-contain"
                                loading="lazy"
                              />
                            </div>
                            <p className="text-gray-100">{feature.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <LinkButton
                      href="/contact"
                      className="btn-gradient w-full md:w-[291px] text-white"
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
                      Direct-Hire Caregivers
                    </LinkButton>
                  </div>
                </div>
              </div>

              {/* Right Column - Insurance Content */}
              <div className="relative overflow-hidden bg-gray-50 rounded-[16px] lg:rounded-none lg:bg-transparent mt-4 lg:mt-0">
                <div className="w-full flex justify-center min-[1351px]:justify-end">
                  <div className="w-full max-[1023px]:max-w-full max-w-[485px] flex flex-col justify-normal min-[1351px]:justify-end">
                    <div className="relative max-[1350px]:p-[56px] max-[767px]:px-4  max-[767px]:py-8 z-10  lg:pt-[56px] lg:pb-[56px] rounded-lg md:rounded-none">
                      <div
                        aria-hidden
                        className="absolute top-10 left-0  md:top-40 w-[300px] h-[300px] md:w-[360px] md:h-[360px] lg:w-[440px] lg:h-[440px] pointer-events-none"
                      >
                        <Image
                          src="/assets/images/directhire2.png"
                          alt="Direct Hire"
                          fill
                          loading="lazy"
                          className="object-contain"
                        />
                      </div>

                      <h2 className="text-[18px] md:text-[24px] font-semibold text-gray-900 mb-2">
                        Choose Constant-Hire Without the Complexity
                      </h2>
                      <p className="mb-4 text-[16px]">
                        Finding consistent care doesn’t have to be complicated.
                        This model is designed to support continuity,
                        coordination, and a smoother experience for families.
                      </p>

                      {/* Insurance Logos */}
                      {/* <div className="mb-3">
                        <div className="bg-white rounded-[16px] p-4 md:mt-[24px] shadow-sm">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
                            {insuranceLogos.map((logo, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-center p-2"
                              >
                                <Image
                                  src={logo.logo}
                                  alt={logo.name}
                                  width={120}
                                  height={40}
                                  className="max-h-10 max-w-full w-auto h-auto"
                                  loading="lazy"
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-primary text-sm mt-3">
                            and 15 + more trusted insurance partners •{" "}
                            <span className="text-gray-500 cursor-pointer">
                              View all list
                            </span>
                          </p>
                        </div>
                      </div> */}

                      {/* Benefits */}
                      <div className="flex justify-start mb-6 mt-4">
                        <div className="space-y-4">
                          {continuousHireBenefits.map((benefit, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <Image
                                src="/assets/icons/tick.svg"
                                alt=""
                                width={20}
                                height={20}
                                className="flex-shrink-0 mt-1"
                                loading="lazy"
                              />
                              <p className="text-gray-700">{benefit}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="flex">
                        <LinkButton
                          href="/contact"
                          className="btn-gradient w-full md:w-[291px] text-white"
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
                          Constant-Hire Caregivers
                        </LinkButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Image - constrained to max-w */}
        <div className="absolute bottom-0 z-0 max-[1350px]:hidden flex justify-center w-full h-[620px] pointer-events-none">
          <div className="max-w-[1440px] w-full relative flex justify-center">
            <div className="relative w-auto h-full">
              <Image
                src="/assets/images/Insurance.png"
                alt="Caregiver pointing"
                width={620}
                height={620}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
