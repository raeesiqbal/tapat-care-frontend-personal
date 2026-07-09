"use client";
import { useState } from "react";
import Image from "next/image";
import { LinkButton } from "@/components/ui/LinkButton";

export function Footer() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  return (
    <footer className="bg-deepPurple-900 text-white py-8 px-4 md:p-[56px]">
      {/* Newsletter Section */}
      <div className="max-w-[1440px] mx-auto">
        <section className="bg-violet-50 rounded-lg p-6 mb-12">
          <div className="flex flex-col md:flex-row justify-between md:text-left text-center items-start md:items-center">
            <article className="mb-4 md:mb-0 w-full">
              <h3 className="text-black text-[38px] italic  mb-2">Tapat</h3>
              <p className="text-[16px] text-gray-900 max-w-[455px]">
                Your opinions matter. Get rewarded for sharing your thoughts and
                influence the brands you love!
              </p>
              <nav className="flex space-x-2  md:space-x-4 w-full mt-4 justify-center md:justify-start">
                <span className="text-black font-semibold">Facebook</span>
                <span className="text-black font-semibold">•</span>
                <span className="text-black font-semibold">Instagram</span>
                <span className="text-black font-semibold">•</span>
                <span className="text-black font-semibold">LinkedIn</span>
              </nav>
            </article>
            <form className="w-full flex flex-row max-[1065px]:flex-col items-center gap-3">
              <div className="relative w-full lg:w-[355px]">
                <input
                  type="email"
                  placeholder="Enter Email"
                  className="border border-gray-300 text-gray-600 bg-white pl-12 pr-5 rounded-[16px] h-[62px] w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Image
                    src="/assets/icons/email.svg"
                    alt="Email icon"
                    width={24}
                    height={24}
                  />
                </div>
              </div>

              <LinkButton
                href="#"
                className="bg-primary text-white font-semibold rounded-[16px] h-[62px] w-full lg:max-w-[355px] xl:w-[251px] flex items-center justify-center hover:bg-purple-700 transition duration-300"
                animation="shine"
                animationColor="white/20"
              >
                SUBSCRIBE NEWSLETTER
              </LinkButton>
            </form>
          </div>
        </section>

        {/* Navigation Links */}
        <nav className="grid grid-cols-1 md:grid-cols-4">
          {/* Company */}
          <section className="md:border-0">
            <header className="flex justify-between items-center">
              <h4 className="font-semibold text-lg">Company</h4>
              <button
                className="md:hidden text-white cursor-pointer"
                onClick={() => toggleSection("company")}
                aria-label={
                  expandedSection === "company"
                    ? "Collapse Company section"
                    : "Expand Company section"
                }
                aria-expanded={expandedSection === "company"}
                aria-controls="company-links"
              >
                {expandedSection === "company" ? (
                  <span className="text-2xl">−</span>
                ) : (
                  <span className="text-2xl">+</span>
                )}
              </button>
            </header>
            <ul
              id="company-links"
              className={`space-y-3 mt-2 ${
                expandedSection === "company" ? "block" : "hidden md:block"
              }`}
            >
              <li>
                <a href="#" className="hover:text-purple-300 transition">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-300 transition">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-300 transition">
                  Process
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-300 transition">
                  Testimonials
                </a>
              </li>
            </ul>
          </section>

          {/* Divider - visible only on mobile */}
          <hr className="border-t border-purple-700 my-4 md:hidden col-span-1" />

          {/* Families */}
          <section className="md:border-0">
            <header className="flex justify-between items-center">
              <h4 className="font-semibold text-lg">Families</h4>
              <button
                className="md:hidden text-white cursor-pointer"
                onClick={() => toggleSection("families")}
                aria-label={
                  expandedSection === "families"
                    ? "Collapse Families section"
                    : "Expand Families section"
                }
                aria-expanded={expandedSection === "families"}
                aria-controls="families-links"
              >
                {expandedSection === "families" ? (
                  <span className="text-2xl">−</span>
                ) : (
                  <span className="text-2xl">+</span>
                )}
              </button>
            </header>
            <ul
              id="families-links"
              className={`space-y-3 mt-2 ${
                expandedSection === "families" ? "block" : "hidden md:block"
              }`}
            >
              <li>
                <a href="#" className="hover:text-purple-300 transition">
                  Find a caregiver
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-300 transition">
                  Book a Consultation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-300 transition">
                  Explore Plan
                </a>
              </li>
            </ul>
          </section>

          {/* Divider - visible only on mobile */}
          <hr className="border-t border-purple-700 my-4 md:hidden col-span-1" />

          {/* Caregivers */}
          <section className="md:border-0">
            <header className="flex justify-between items-center">
              <h4 className="font-semibold text-lg">Caregivers</h4>
              <button
                className="md:hidden text-white cursor-pointer"
                onClick={() => toggleSection("caregivers")}
                aria-label={
                  expandedSection === "caregivers"
                    ? "Collapse Caregivers section"
                    : "Expand Caregivers section"
                }
                aria-expanded={expandedSection === "caregivers"}
                aria-controls="caregivers-links"
              >
                {expandedSection === "caregivers" ? (
                  <span className="text-2xl">−</span>
                ) : (
                  <span className="text-2xl">+</span>
                )}
              </button>
            </header>
            <ul
              id="caregivers-links"
              className={`space-y-3 mt-2 ${
                expandedSection === "caregivers" ? "block" : "hidden md:block"
              }`}
            >
              <li>
                <a href="#" className="hover:text-purple-300 transition">
                  Join as a Caregiver
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-300 transition">
                  Caregiver Resource
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-300 transition">
                  Support
                </a>
              </li>
            </ul>
          </section>

          {/* Divider - visible only on mobile */}
          <hr className="border-t border-purple-700 my-4 md:hidden col-span-1" />

          {/* Contact */}
          <section className="md:border-0">
            <header className="flex justify-between items-center">
              <h4 className="font-semibold text-lg">Contact</h4>
              <button
                className="md:hidden text-white"
                onClick={() => toggleSection("contact")}
                aria-label={
                  expandedSection === "contact"
                    ? "Collapse Contact section"
                    : "Expand Contact section"
                }
                aria-expanded={expandedSection === "contact"}
                aria-controls="contact-info"
              >
                {expandedSection === "contact" ? (
                  <span className="text-2xl">−</span>
                ) : (
                  <span className="text-2xl">+</span>
                )}
              </button>
            </header>
            <address
              id="contact-info"
              className={`space-y-3 mt-2 not-italic ${
                expandedSection === "contact" ? "block" : "hidden md:block"
              }`}
            >
              <div className="flex items-center">
                <span className=" mr-2">
                  <Image
                    src="/assets/icons/address.svg"
                    alt="Address icon"
                    width={20}
                    height={20}
                  />
                </span>
                <span>
                  <strong>Address:</strong> 123 Maple Street, Springfield, USA
                </span>
              </div>
              <div className="flex items-center">
                <span className=" mr-2">
                  <Image
                    src="/assets/icons/phone.svg"
                    alt="Phone icon"
                    width={20}
                    height={20}
                  />
                </span>
                <span>
                  <strong>Phone:</strong> (555) 123-4567
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-purple-400 mr-2">
                  <Image
                    src="/assets/icons/footermail.svg"
                    alt="Email icon"
                    width={20}
                    height={20}
                  />
                </span>
                <span>
                  <strong>Email:</strong> info@tapatcare.com
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-purple-400 mr-2">
                  <Image
                    src="/assets/icons/available.svg"
                    alt="Available icon"
                    width={20}
                    height={20}
                  />
                </span>
                <span>Available 24/7</span>
              </div>
            </address>
          </section>
        </nav>

        {/* Divider */}
        <hr className="border-t border-purple-700 my-4 md:hidden col-span-1" />

        {/* Copyright */}
        <section className="flex flex-col md:flex-row justify-between items-center mt-10">
          <p className="text-[16px] text-white font-semibold text-center italic mb-4 md:mb-0">
            Sincere · Affordable · Reliable · Compassionate Care Since 2002
          </p>
          <p className="text-[16px] text-gray-300">
            © 2025 Tapat. All rights reserved.
          </p>
        </section>
      </div>
    </footer>
  );
}
