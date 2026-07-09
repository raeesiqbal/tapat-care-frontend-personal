"use client";
import { useState } from "react";
import Image from "next/image";
import { CareCardProps } from "@/interface";

export function CareCard({
  image,
  title,
  description,
  stat = "",
  defaultExpanded = false,
}: CareCardProps) {
  const [expanded, setExpanded] = useState<boolean>(!!defaultExpanded);

  return (
    <article
      className={`relative rounded-[16px] overflow-hidden transition-all duration-300 ${expanded ? "md:flex-none md:w-[916px]" : "md:flex-none md:w-[490px]"} w-full`}
    >
      <section className="md:hidden w-full rounded-[16px] overflow-hidden bg-gray-50">
        <figure className="relative">
          <div
            className={`relative w-full ${expanded ? "h-[430px]" : "h-[188px]"} transition-all duration-300`}
          >
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover object-center"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 916px"
              quality={85}
            />
          </div>

          <figcaption className="h-full w-full absolute top-0 z-10 overlay-gradient"></figcaption>

          <header className="absolute inset-0 p-[20px] flex flex-col sm:items-start sm:justify-start items-center z-20 pointer-events-none">
            <h3 className="text-[20px] font-semibold text-white text-center max-w-[280px] sm:mx-0 mx-auto drop-shadow-md">
              {title}
            </h3>
            {expanded && (
              <p className="text-[14px] text-white mt-[8px] leading-relaxed drop-shadow-sm max-w-[280px] sm:mx-0 mx-auto sm:text-left text-center">
                {description}
              </p>
            )}

            {expanded && stat && (
              <aside className="mt-[12px] bg-white rounded-[12px] p-[16px] shadow sm:text-left text-center w-full max-w-[280px] sm:mx-0 mx-auto pointer-events-auto">
                <p className="text-[16px] font-semibold text-gray-900">
                  {stat}
                </p>
              </aside>
            )}
          </header>

          <button
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse" : "Expand"}
            aria-expanded={expanded}
            className="absolute right-4 bottom-4 cursor-pointer w-[56px] h-[56px] bg-black/60 rounded-[12px] flex items-center justify-center text-white text-[28px] font-bold hover:bg-black/80 transition-colors z-30"
          >
            {expanded ? "×" : "+"}
          </button>
        </figure>
      </section>

      <section className="hidden md:block relative rounded-[16px] overflow-hidden h-[515px]">
        <figure className="relative w-full h-full">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 916px"
            quality={85}
          />

          <figcaption className="h-full w-full absolute top-0 z-10 overlay-gradient"></figcaption>
        </figure>
        <header className="absolute inset-0 p-[24px] flex items-end z-20 pointer-events-none">
          <div className="max-w-[60%]">
            <h3 className="text-[24px] font-semibold text-white">{title}</h3>
            {expanded && (
              <p className="text-[16px] text-white mt-[8px] text-white leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {expanded && stat && (
            <aside className="ml-auto bg-white rounded-[12px] p-[20px] w-[280px] shadow-lg text-left pointer-events-auto">
              <p className="text-[18px] font-semibold text-gray-900">{stat}</p>
            </aside>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse" : "Expand"}
            aria-expanded={expanded}
            className="absolute top-[16px] cursor-pointer right-[16px] w-[80px] h-[80px] bg-black/60 rounded-[8px] flex items-center justify-center text-white text-[38px] font-bold hover:bg-black/80 transition-colors z-30 pointer-events-auto"
          >
            {expanded ? "×" : "+"}
          </button>
        </header>
      </section>
    </article>
  );
}
