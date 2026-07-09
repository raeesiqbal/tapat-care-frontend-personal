"use client";

import { useState } from "react";
import Image from "next/image";

import { LinkButton } from "@/components/ui/LinkButton";
import { TabItem } from "@/components/ui/TabItem";
import type { MarketingServiceContent } from "@/lib/marketing-services";

type OurServicesClientProps = {
  tabs: string[];
  data: Record<string, MarketingServiceContent>;
  initialTab: string;
};

export function OurServicesClient({ tabs, data, initialTab }: OurServicesClientProps) {
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
          From companionship to tailored medical care, services adapt to family needs with
          flexibility, respect, and budget-friendly choices.
        </p>
      </header>

      <article className="w-full relative max-w-[1440px] mx-auto ml-auto mr-auto">
        <nav className="hidden xl:flex flex-wrap justify-center mt-[48px]">
          {tabs.map((tab) => (
            <TabItem
              key={tab}
              label={tab}
              isActive={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </nav>
      </article>

      <div className="hidden xl:block border-b border-gray-200" />

      <div className="md:px-[56px] pt-4 md:pt-[48px] ">
        <article className="w-full relative max-w-[1440px] mx-auto ml-auto mr-auto">
          <nav className="xl:hidden  max-[400px]:pt-4">
            <div className="overflow-x-auto -mx-4 px-4 md:snap-x md:snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-3 w-max">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap px-4 border border-gray-200 cursor-pointer py-2 rounded-full text-sm font-medium transition ${isActive ? "bg-indigo-100 text-primary border-none" : "bg-white text-gray-600"}`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>
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
                  <li key={`${feature.text}-${index}`} className="flex items-start gap-4">
                    <figure className="text-emerald-500 text-2xl">
                      {feature.icon.startsWith("/assets/icons/") ? (
                        <Image
                          src={feature.icon}
                          alt={`${feature.text} icon`}
                          width={40}
                          height={38}
                          className="w-[40px] h-[38px]"
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