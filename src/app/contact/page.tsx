import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/shared/Footer";
import {ContactHero} from "@/app/contact/_sections/ContactHero";
import {ContactForm} from "@/app/contact/_sections/ContactForm";
import {FAQ} from "@/components/ui/FAQ";
import { contactFAQs } from "@/data/faqData";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Tapat Care",
  description: "Contact Tapat Care for inquiries about our home healthcare services, caregiver opportunities, or to schedule a consultation.",
  keywords: "contact Tapat, healthcare inquiries, caregiver jobs, home care consultation",
  openGraph: {
    title: "Contact Tapat Care",
    description: "Contact Tapat Care for inquiries about our home healthcare services, caregiver opportunities, or to schedule a consultation.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tapat Care Contact Information"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Tapat Care",
    description: "Contact Tapat Care for inquiries about our home healthcare services, caregiver opportunities, or to schedule a consultation.",
    images: ["/og-image.png"],
    creator: "@tapatcare"
  }
};

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isTransparent={false} />
      <ContactHero />
      <ContactForm />
      <FAQ 
        items={contactFAQs}
      />
      <Footer />
    </div>
  );
}