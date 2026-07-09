import { LogoCarousel } from '@/components/ui/LogoCarousel'

export function TrustedSection({ hideTopBorder }: { hideTopBorder?: boolean }) {
  return (
    <section className={`${hideTopBorder ? 'border-t-0' : 'border-t'} border-b border-gray-200 py-[50px] mt-[16px] `}>
      <h3 className="text-center text-[16px] md:text-[20px] font-bold text-primary">
        Trusted by <span className="text-gray-900 font-normal">families and healthcare professionals</span>
      </h3>
      <article className="mt-[32px]">
        <LogoCarousel />
      </article>
    </section>
  )
}
