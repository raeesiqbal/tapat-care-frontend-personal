import Image from 'next/image';
import { LinkButton } from '@/components/ui/LinkButton';
import { values } from "@/data/OurValues";

export function OurValues() {
  return (
    <section className="py-8 px-4 md:p-[56px] bg-violet-50">
      <main className="w-full  max-w-[1440px] mx-auto ml-auto mr-auto">
        <header className="flex flex-col justify-center items-center gap-[16px]">
          <p className="text-pink text-[14px]  ">
            Our Values
          </p>

          <h2 className="md:text-[32px] text-[22px] max-w-[607px] w-full font-semibold text-gray-900 text-center">
            SMART
          </h2>

          <p className="text-gray-600 text-[16px] max-w-[584px] w-full text-center">
            The values that guide every caregiver match, every family relationship, and
            every services provided.
          </p>
        </header>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5  gap-[16px] md:mt-[48px] mt-[32px]">
          {values.map((value, index) => (
            <li
              key={index}
              className="bg-white md:h-[262px] h-[196px]  w-full p-6 rounded-[16px] flex flex-col items-start gap-[27px]"
            >
              <figure className="w-12 h-12 text-green-500 relative">
                <Image
                  src={value.icon}
                  alt={value.title}
                  height={56}
                  width={56}
                  className="object-contain"
                />
              </figure>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-900 text-base">{value.description}</p>
              </div>
            </li>
          ))}
        </ul>


        <div className="md:mt-[48px] mt-[32px] flex justify-center">
          <LinkButton
            href="/about"
            className="bg-primary text-white  w-full md:w-[336px]"
            animation="shine"
            animationColor="white/20"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            }
          >
            <span>DISCOVER HOW WE CARE</span>
          </LinkButton>
        </div>
      </main>
    </section>
  );
};
