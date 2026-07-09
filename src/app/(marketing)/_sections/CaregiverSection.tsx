import { CareCard } from "@/components/ui/CareCard";
import { Carousel } from "@/components/ui/Carousel";
import { LinkButton } from "@/components/ui/LinkButton";
import { cards } from "@/data/Caregiver";

export function CaregiverSection() {
  return (
    <section className="py-8 px-4 md:pt-[56px] md:pb-[56px] md:pl-[56px] ">
      <div className="max-w-[1440px] mx-auto ml-auto mr-auto">
        <header className="flex justify-center items-center flex-col">
          {/* <p className="text-pink text-[14px]">Why We as Caregiver</p> */}
          <h2 className="md:text-[32px] text-[22px] gap-[16px] text-center font-semibold text-gray-900">
            Care that is sincere, smart, and always
            <br />
            there since 2002
          </h2>

          {/* CTA Button */}
          <div className="mt-[20px] w-full md:w-[184px]">
            <LinkButton
              href="/about"
              className="bg-primary text-white md:w-[184px] font-semibold"
              size="lg"
            >
              MORE ABOUT US
            </LinkButton>
          </div>
        </header>

        {/* Carousel container */}
        <main className="relative mt-[32px]">
          <Carousel>
            {cards.map((card, index) => (
              <li key={index}>
                <CareCard {...card} defaultExpanded={index === 0} />
              </li>
            ))}
          </Carousel>
        </main>
      </div>
    </section>
  );
}
