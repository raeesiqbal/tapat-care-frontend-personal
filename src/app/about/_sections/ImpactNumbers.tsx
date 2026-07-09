import { LinkButton } from '@/components/ui/LinkButton';
import { stats } from "@/data/ImpactNumber";
export function ImpactNumbers() {
  return (
    <section className="py-8 px-4 md:p-[56px] bg-white">
      <main className="w-full  max-w-[1440px] mx-auto ml-auto mr-auto">
        <header className="flex flex-col justify-center items-center gap-[16px]">
          <p className="text-pink text-[14px]  ">
            Our Impact in Numbers
          </p>

          <h2 className="md:text-[32px] text-[22px] text-center max-w-[607px] w-full font-semibold text-gray-900 ">
            Making Care Accessible, Affordable,
            <span className="block">and Trusted</span>
          </h2>

          <p className="text-gray-600 max-w-[584px] w-full text-center">
            Every number tells the story of families supported, caregivers empowered,
            and professionals who believe in us.
          </p>
        </header>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-[32px] md:mt-[48px]">
          {stats.map((stat, index) => (
            <li
              key={index}
              className="bg-gray-50 border border-gray-200 p-4 md:p-[24px] rounded-[16px]  md:h-[170px] h-[148px] card-shadow flex flex-col "
            >

              <h3 className="text-2xl md:text-3xl font-semibold text-gray-900">
                {stat.number}
              </h3>
              <p className="text-primary text-sm md:text-base  mt-[8px]">
                {stat.title}
              </p>
              <p className="text-gray-600 text-xs md:text-sm lg:text-base mt-[16px] md:mt-[24px]">
                {stat.description}
              </p>

            </li>
          ))}
        </ul>

        <div className="mt-8 md:mt-12 flex justify-center">
          <LinkButton
            href="/about"
            className="bg-primary text-white p-[16px] text-[16px] w-full md:w-[336px]"
            animation="shine"
            animationColor="white/20"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            }
          >
            <span className="inline max-[400px]:hidden">SEE WHAT WE CAN DO FOR YOU</span>
            <span className="hidden max-[400px]:inline">SEE WHAT WE CAN</span>
          </LinkButton>

        </div>
      </main>
    </section>
  );
};
