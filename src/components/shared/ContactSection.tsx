"use client";
import {LinkButton} from "@/components/ui/LinkButton";
import { ContactSectionProps } from "@/interface";
import Image from "next/image";


export function ContactSection({
  title = "We're here when you need us",
  description = "Whether you're a family searching for trusted care or a caregiver ready to offer support, we're only a message away.",
  buttonText = "CONTACT US TODAY",
  imageSrc = "/assets/images/landingcontact.png",
  doctorName = "",
  isAboutPage = false,
}:ContactSectionProps)  {
  return (
    <section className="md:mt-[120px] mt-0 px-4 py-8 md:px-[56px] md:py-[56px] flex justify-center">
      <article className="relative w-full max-w-[1440px] bg-green-500 rounded-[20px] flex flex-col-reverse lg:flex-row items-center text-center lg:text-left overflow-hidden lg:overflow-visible">
        {/* Left Text Section */}
        <main className="flex flex-col justify-center items-center lg:items-start p-6 sm:p-8 md:p-[56px] w-full lg:w-1/2 xl:w-[550px] mt-[-20px] sm:mt-0">
          <h2 className="text-white font-semibold md:text-[32px] text-[22px]  leading-[40px] mb-3 sm:mb-4">
            {title}
          </h2>
          <p className="text-white md:text-[20px] text-[16px]  leading-[28px] mb-6 sm:mb-8">
            {description}
          </p>
          {doctorName && (
            <address className="text-white mb-6 text-[16px] font-bold not-italic">
              {doctorName}
            </address>
          )}

          <LinkButton
            href="/contact"
            className="bg-primary text-white w-full md:w-[244px]"
            animationColor="white/20"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            {buttonText}
          </LinkButton>
        </main>

        {/* Right Image Section */}
        <aside className="relative w-full lg:w-1/2 flex justify-center lg:justify-end overflow-visible">
          {/* Decorative Blurred Pill Shape */}
          <figure
            className={`absolute overlay-gradient-vertical max-[400px]:hidden
   ${isAboutPage ? "right-[211px]" : "right-[234px]"} top-[27px]
    w-[80px] h-[220px]

    sm:right-[305px] sm:top-[11px] sm:w-[120px] sm:h-[300px] sm:block
    xs:right-[305px] xs:top-[11px] xs:w-[120px] xs:h-[300px] xs:block
    md:hidden
    lg:right-[180px] lg:top-[-160px] lg:w-[160px] lg:h-[400px] lg:hidden
    xl:right-[240px] xl:top-[-180px] xl:w-[180px] xl:h-[440px] xl:block
    rounded-[100px]
    rotate-[301deg]

    z-10`}

            aria-hidden="true"
          ></figure>

          <div className={`relative w-[320px] sm:w-[360px] md:w-[400px] lg:w-[450px] lg:h-[390px]
    xl:absolute xl:right-0 ${isAboutPage ? "xl:top-[-213px] z-10" : "xl:top-[-265px] lg:bottom-0"
            } xl:scale-[1.25] xl:max-w-[520px] transition-all duration-300`}>
            <Image
              src={imageSrc}
              alt="Caregiver"
              width={520}
              height={450}
              className="object-contain w-full h-full"
              loading="lazy"
            />
          </div>

          {/* Bottom Blur Shade — only visible on small and tablet screens */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[100px] bg-linear-to-t from-green-500 to-transparent blur-[25px] pointer-events-none lg:hidden" aria-hidden="true" />
        </aside>
      </article>
    </section>
  );
};