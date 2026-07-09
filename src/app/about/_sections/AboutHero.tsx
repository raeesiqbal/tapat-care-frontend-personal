"use client";
import Image from "next/image";
import { LinkButton } from "@/components/ui/LinkButton";
import { images } from "@/data/AboutHero";
import { Marquee } from "@/components/ui/Marquee";
import { dimsBySrc } from "@/data/AboutHero";
export function AboutHero() {

  return (

    <section className="relative w-full h-auto min-h-[700px] sm:min-h-[750px] md:min-h-[600px] lg:min-h-[888px] bg-[#F9FAFB] ">
      {/* Background Image - covers entire section */}
      <figure className="absolute inset-0 z-0">
        <Image
          src="/assets/images/about-hero.png"
          alt="About Hero Background"
          fill
          className="object-cover object-center"
          sizes="100vw"
          quality={90}
          priority
        />
        {/* Overlay for better text readability */}
        <figcaption className="absolute inset-0"></figcaption>
      </figure>

      <main className="flex flex-col">
        {/* Mobile: Images at top, marquee carousel preserving existing sizes */}
        <section className="relative z-10 pt-4 mb-8 lg:hidden block">
          <Marquee
            as="ul"
            speed={60}
            repeats={3}
            containerClassName="relative overflow-x-auto pb-4 no-scrollbar"
            trackClassName="flex flex-row items-stretch gap-4 pr-4 snap-x snap-mandatory flex-nowrap w-max"
            ariaLabel="About page image carousel mobile"
          >
            {images.map((image, index) => (
              <li
                key={`about-marquee-mobile-${index}`}
                className={`snap-center overflow-hidden rounded-lg p-1 ${index === 1
                  ? "flex justify-center items-center mt-5 h-[120px] w-[200px] min-w-[200px]"
                  : "w-[150px] min-w-[150px] h-[150px]"
                  } relative`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className={`${index === 1 ? "object-contain" : "object-cover object-center"}`}
                  sizes={index === 1 ? "200px" : "150px"}
                  quality={85}
                  loading="lazy"
                />
              </li>
            ))}
          </Marquee>
        </section>

        {/* Content */}
        <article className="relative z-10 container mx-auto px-8 py-8 md:p-[58px] lg:pt-14 lg:pb-8 text-center text-gray-900">
          <header>
            <h1 className="text-[30px] leading-[56px] tracking-[-0.48px] md:text-[48px] font-bold mb-6">
              What Sincerity in Care Truly
              <br /> Means
            </h1>
          </header>
          <p className="text-[16px] leading-[28px] md:text-[20px] text-gray-900 max-w-3xl mx-auto mb-8">
            Since 2024, Tapat has helped families find trusted caregivers and
            empowered caregivers to work with dignity, respect, and fairness.
          </p>
          <div className='flex justify-center items-center'>
            <LinkButton
              href="/contact"
              className="bg-primary w-full md:w-[200px] text-white"
              animation="shine"
              animationColor="white/30"
            >
              TALK TO US TODAY
            </LinkButton>
          </div>
        </article>

        {/* Desktop: Image Gallery */}
        {/* <section className="relative pt-8 hidden md:block w-full">
          <ul className="flex w-full gap-7">
            <li className="">
              <Image
                src="/assets/images/about1.png"
                alt="Caregiver Image 1"
                height={422}
                width={300}
              />
            </li>
            <li className="col-span-1 overflow-hidden flex items-center rounded-lg p-1">
              <Image
                src="/assets/images/about2.png"
                alt="Caregiver Image 2"
                height={300}
                width={451}

              />
            </li>
            <li className="col-span-1 overflow-hidden rounded-lg p-1">
              <Image
                src="/assets/images/about3.png"
                alt="Caregiver Image 3"
                height={422}
                width={300}

              />
            </li>
            <li className="col-span-1 overflow-hidden rounded-lg p-1">
              <Image
                src="/assets/images/about4.png"
                alt="Caregiver Image 4"
                height={383}
                width={300}
              />
            </li>
          </ul>
        </section> */}

        {/* Full-width Image Carousel */}
        <section className="relative hidden lg:block z-10 w-full ">
          <Marquee
            as="ul"
            speed={70}
            repeats={3}
            containerClassName="w-full overflow-hidden"
            trackClassName="flex items-center gap-4 md:gap-6"
            ariaLabel="About page image carousel"
          >
            {images.map((image, index) => (
              <li
                key={`about-marquee-${index}`}
                className="relative shrink-0 rounded-lg overflow-hidden p-1"
              >
                {(() => {
                  const dims = dimsBySrc[image.src];
                  return (
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={dims.width}
                      height={dims.height}
                      className="w-auto h-auto object-contain"
                      sizes={`${dims.width}px`}
                      quality={85}
                      loading="lazy"
                    />
                  );
                })()}
              </li>
            ))}
          </Marquee>
        </section>
      </main>
    </section>

  );
};