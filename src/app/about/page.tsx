import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/shared/Footer";
import { AboutHero } from "@/app/about/_sections/AboutHero";
import {MeaningOfTapat} from "@/app/about/_sections/MeaningOfTapat";
import { TrustedSection } from  '@/components/shared/TrustedSection'
import { UserReviews } from '@/components/shared/UserReviews';
import {OurValues} from "@/app/about/_sections/OurValues";
import {ImpactNumbers} from "@/app/about/_sections/ImpactNumbers";
import {ContactSection} from "@/components/shared/ContactSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Tapat Care",
  description: "Learn about our compassionate caregiving services since 2002",
  keywords: "about Tapat, healthcare mission, caregiver values, home care company",
  openGraph: {
    title: "About Tapat Care",
    description: "Learn about our compassionate caregiving services since 2002",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tapat Care Compassionate Caregiving"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Tapat Care",
    description: "Learn about our compassionate caregiving services since 2002",
    images: ["/og-image.png"],
    creator: "@tapatcare"
  }
};


export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isTransparent={false} />
      <AboutHero />
      <TrustedSection hideTopBorder={true}/>
      <MeaningOfTapat />
      <OurValues />
      <ImpactNumbers />
      <UserReviews title="Testimonials"/>
      <ContactSection 
        title="Referred by Professionals Who Care"
        description="When my patients are discharged, I want them safe and supported. Tapat gives me confidence to recommend a platform that's affordable, sincere, and reliable."
        buttonText="REFER A PATIENT"
        isAboutPage={true}
        imageSrc="/assets/images/landingabout.png"
        bgImageSrc="/assets/images/landingcontactbg.png"
        doctorName="Dr. Elaine C., Nurse Practitioner"
      />
      <Footer />
    </div>
  );
}