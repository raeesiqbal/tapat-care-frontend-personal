import { Navbar } from "@/components/ui/Navbar";
import { HeroSection } from "@/app/(marketing)/_sections/HeroSection";
import { CaregiverSection } from "@/app/(marketing)/_sections/CaregiverSection";
import { OurProcess } from "@/app/(marketing)/_sections/OurProcess";
import { OurServices } from "@/app/(marketing)/_sections/OurServices";
import { TrustedReferrals } from "@/app/(marketing)/_sections/TrustedReferrals";
import { InsuranceAndDirectHire } from "@/app/(marketing)/_sections/InsuranceAndDirectHire";
import { WhatTapatMeans } from "@/app/(marketing)/_sections/WhatTapatMeans";
import { TrustedSection } from "@/components/shared/TrustedSection";
import { UserReviews } from "@/components/shared/UserReviews";
import { ContactSection } from "@/components/shared/ContactSection";
import { Footer } from "@/components/shared/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home - Tapat Care",
  description:
    "Find reliable and compassionate caregivers for your loved ones with Tapat Care's home healthcare services.",
  keywords:
    "home healthcare, caregivers, elderly care, home care services, Tapat",
  openGraph: {
    title: "Home Tapat Care - Compassionate Home Healthcare Services",
    description:
      "Find reliable and compassionate caregivers for your loved ones with Tapat Care's home healthcare services.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tapat Care Home Healthcare Services",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tapat Care - Compassionate Home Healthcare Services",
    description:
      "Find reliable and compassionate caregivers for your loved ones with Tapat Care's home healthcare services.",
    images: ["/og-image.png"],
    creator: "@tapatcare",
  },
};

export default function Home() {
  return (
    <div className="">
      <Navbar />
      <div>
        <HeroSection />
        <TrustedSection />
        <CaregiverSection />
        <OurProcess />
        <OurServices />
        <TrustedReferrals />
        <InsuranceAndDirectHire />
        <WhatTapatMeans />
        <UserReviews />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}
