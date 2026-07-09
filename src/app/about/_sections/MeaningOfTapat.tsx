import Image from "next/image";
import { LinkButton } from "@/components/ui/LinkButton";

export function MeaningOfTapat() {
  return (
    <section className="py-8 px-4 md:p-[56px] bg-white">
      <article className="w-full relative max-w-[1440px] mx-auto ml-auto mr-auto">
        <header className="text-pink text-[14px]  mb-4 text-center lg:text-left">
          A Message from Our Founders
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center text-center lg:text-left">
          <div className="lg:max-w-xl w-full">
            <h2 className="text-2xl sm:text-3xl md:text-[32px] font-semibold leading-tight md:leading-[40px] tracking-[0px] text-gray-900 mb-4 sm:mb-6">
              The Meaning of Tapat
            </h2>

            <section className="space-y-4 sm:space-y-6">
              <p className="text-gray-900 font-semibold text-[16px] sm:text-[18px] leading-[24px] sm:leading-[26px] tracking-[0px]">
                At Tapat, sincerity isn't just our name — it reflects the way we approach our work.
                Since day one, our mission has been to make care more human,
                affordable, and trustworthy for every family and every
                caregiver.
              </p>

              <p className="text-gray-900 text-[14px] sm:text-[16px] leading-[22px] sm:leading-[26px] tracking-[0.18px]">
                When we started Tapat, we had one guiding thought: caregiving
                should feel like family, not business. We witnessed how families
                struggled to find reliable support and how caregivers often felt
                undervalued. Our solution was to create a platform built on
                sincerity — where families get peace of mind, caregivers earn
                fair respect, and professionals confidently recommend us. Every
                decision we make comes back to sincerity, safety, and trust.
                That is what Tapat means, and that is what we stand for.
              </p>

              <address className="text-gray-900 font-semibold text-[16px] sm:text-[18px] mt-4 sm:mt-6 not-italic">
                Susan - CEO / Founder
              </address>

              <div className="mt-4 sm:mt-6 w-full flex lg:justify-start justify-center">
                <LinkButton
                  href="/contact"
                  className="bg-primary text-[14px] md:w-[291px] sm:text-[16px] w-full text-white p-[16px]"
                  animation="shine"
                  animationColor="white/20"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5"
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
                  <span>REACH OUT TO OUR TEAM</span>
                </LinkButton>
              </div>
            </section>
          </div>
          <figure className="relative flex  lg:justify-end w-full mt-6 lg:mt-0">
            <div className="md:w-[579px] md:h-[441px] h-[310px] w-[408px]">
              <Image
                src="/assets/images/founder.png"
                alt="Susan - CEO and Founder"
                fill
                className="object-contain"
                loading="lazy"
              />
            </div>
          </figure>
        </main>
      </article>
    </section>
  );
}
