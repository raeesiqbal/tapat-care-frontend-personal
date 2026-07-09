"use client"
import Image from 'next/image';
export function ContactHero() {
  return (
   
    <div className="relative w-full p bg-[#F9FAFB]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/assets/images/about-hero.png"
          alt="Contact Hero Background"
          fill
          className="object-cover "
          priority
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0"></div>
      </div>

      {/* Content */}
      <div className='py-8 px-4 md:p-[56px] '>
      <div className="relative z-10  text-gray-900 max-w-[1440px] mx-auto text-center">
        <h1 className="text-3xl md:text-[48px] leading-[56px] tracking-[-0.48]  font-bold mb-6">
          We're Here Whenever You<br/> Need Us
        </h1>
        <p className="text-[20px] text-gray-900 max-w-3xl mx-auto mb-8">
          Whether you're a family searching for care, a caregiver looking for guidance, 
          or a healthcare professional referring a patient — Tapat is ready to help you 24/7.
        </p>
      </div>
      </div>
    </div>

  );
};

