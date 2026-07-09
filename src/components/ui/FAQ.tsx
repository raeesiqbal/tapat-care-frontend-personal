"use client";
import Image from 'next/image';
import { LinkButton } from '@/components/ui/LinkButton';
import { useState } from 'react';
import { FAQProps } from '@/interface';



export function FAQ({
  title = "You Ask, We Answer",
  subtitle = "Quick answers to some of the most common questions families, caregivers, and healthcare professionals ask.",
  items,
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-8 px-4 md:p-[56px]">
      <article className="w-full max-w-[1440px] mx-auto ml-auto mr-auto">
        {/* Header */}
        <header className="flex flex-col gap-[16px] justify-center items-center">
          <hgroup className="text-center justify-center flex flex-col gap-[16px] items-center">
            <span className="text-[14px] text-pink tracking-wide">
              Frequently Asked Questions
            </span>

            {title && (
              <h2 className="text-[32px] font-semibold text-gray-900 ">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-[16px] text-center text-gray-900 leading-[24px] w-full max-w-[408px] md:max-w-[584px]">
                {subtitle}
              </p>
            )}
          </hgroup>
        </header>

        {/* FAQ Items */}
        <main className="space-y-[24px] pt-8 pb-8 px-4 md:px-[120px] mt-[48px] bg-gray-100-alt h-auto min-h-fit rounded-[30px]">
          {items.map((item, index) => (
            <article
              key={index}
              className={`rounded-[16px] p-[24px] ${openIndex !== index ? 'bg-gray-50' : 'bg-white'} flex flex-col gap-[16px] card-shadow`}

            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer transition-colors duration-200"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="text-xl font-semibold text-gray-900 pr-8">
                  {item.question}
                </h3>
                <span className="shrink-0">
                  {openIndex === index ? (
                    <Image src="/assets/icons/minus.svg" alt="Collapse" width={24} height={24} />
                  ) : (
                    <Image src="/assets/icons/plus.svg" alt="Expand" width={24} height={24} />
                  )}
                </span>
              </button>
              {openIndex === index && (
                <details open id={`faq-answer-${index}`} className="">
                  <summary className="sr-only">{item.question}</summary>
                  <p className="text-lg text-gray-900 leading-[26px] tracking-[0.18px]">
                    {item.answer}
                  </p>
                </details>
              )}
            </article>
          ))}
        </main>

        {/* CTA Button */}
        <div className="mt-8 md:mt-12 flex justify-center">
          <LinkButton
            href="/about"
            className="bg-primary text-white w-full md:w-[287px]"
            animation="shine"
            animationColor="white/30"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            }
          >
            Discover How We Care
          </LinkButton>
        </div>

      </article>
    </section>
  );
};
