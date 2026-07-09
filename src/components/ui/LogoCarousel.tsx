'use client'
import Image from 'next/image'
import { logos } from '@/data/Carousel';
import { Marquee } from '@/components/ui/Marquee';

export function LogoCarousel({ speed = 80 }: { speed?: number }) {
  return (
    <Marquee
      as="div"
      speed={speed}
      repeats={3}
      containerClassName="w-full overflow-hidden"
      trackClassName="flex items-center gap-[16px] py-6"
      ariaLabel="Partner logos marquee"
    >
      {logos.map((src, i) => (
        <div
          key={i}
          className="shrink-0 w-[160px] opacity-90 p-[8px] flex items-center justify-center"
        >
          <div className="relative w-full max-w-[160px] h-[64px]">
            <Image
              src={src}
              alt={`logo-${i}`}
              fill
              className="object-contain grayscale"
            />
          </div>
        </div>
      ))}
    </Marquee>
  )
}
