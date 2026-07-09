"use client"

import Image from 'next/image';
import {CustomDropdown} from '@/components/ui/Dropdown';
import { useState, useRef, FormEvent } from 'react';
import emailjs from '@emailjs/browser';
import { LinkButton } from '@/components/ui/LinkButton';

export function ContactForm() {
  const [showEmailTooltip, setShowEmailTooltip] = useState(false);
  const [showPhoneTooltip, setShowPhoneTooltip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Select Option');
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});
  const formRef = useRef<HTMLFormElement>(null);
  
  const copyToClipboard = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setShowEmailTooltip(true);
      setTimeout(() => setShowEmailTooltip(false), 2000);
    } else {
      setShowPhoneTooltip(true);
      setTimeout(() => setShowPhoneTooltip(false), 2000);
    }
  };
  
  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
      message?: string;
    } = {};
    let isValid = true;
    
    const form = formRef.current;
    if (!form) return false;
    
    const nameInput = form.elements.namedItem('user_name') as HTMLInputElement;
    const emailInput = form.elements.namedItem('user_email') as HTMLInputElement;
    const messageInput = form.elements.namedItem('message') as HTMLTextAreaElement;
    
    // Validate name
    if (!nameInput.value.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    // Validate email
    if (!emailInput.value.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate message
    if (!messageInput.value.trim()) {
      errors.message = 'Message is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!formRef.current) return;
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(false);
    
    emailjs.sendForm(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
      formRef.current,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
    )
      .then((result) => {
        console.log('Email sent successfully:', result.text);
        setSubmitSuccess(true);
        formRef.current?.reset();
      })
      .catch((error) => {
        console.error('Failed to send email:', error.text);
        setSubmitError(true);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  return (
    <section className="bg-violet-50 py-8 px-4 md:p-[56px] mt-[16px]">
      <div className="w-full max-w-[1440px] mx-auto ">
        {/* Mobile Header - Visible only on mobile */}
        <header className="md:hidden mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tell Us How We Can Help</h2>
          <p className="text-gray-600 text-sm">
            We're always ready to assist. Share your details below or reach us directly —
            our team will get back to you within 24 hours.
          </p>
        </header>

        <main className="flex flex-col md:flex-row justify-between gap-8 lg:gap-16">
          {/* Form Section - First on mobile, second on desktop */}
          <section className="w-full md:w-1/2 md:order-2 flex flex-col justify-center">
            <article className="w-full bg-white p-5 md:p-[24px] rounded-[16px] shadow-sm mb-8 md:mb-0">
              <header>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Send Us a Message</h2>
                <p className="text-[12px] text-gray-900 italic mb-6">*We Value Your Privacy And Never Share Your Details Without Consent.</p>
              </header>

              {submitSuccess && (
                <aside className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </aside>
              )}
              
              {submitError && (
                <aside className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  Sorry, there was a problem sending your message. Please try again later.
                </aside>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <fieldset className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Image src="/assets/icons/contactProfile.png" alt="Contact Profile Icon" width={24} height={24} />
                  </div>
                  <input
                    type="text"
                    name="user_name"
                    placeholder="Enter Your Name"
                    required
                    className={`w-full pl-12 h-[52px] md:h-[62px] pr-4 py-3 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-[16px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </fieldset>

                {/* Email Input */}
                <fieldset className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Image src="/assets/icons/email.svg" alt="Email Icon" width={24} height={24} />
                  </div>
                  <input
                    type="email"
                    name="user_email"
                    placeholder="Enter Email"
                    className={`w-full pl-12 pr-4 py-3 border h-[52px] md:h-[62px] ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-[16px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none`}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </fieldset>

                <input type="hidden" name="user_role" value={selectedOption} />
                <CustomDropdown 
                  value={selectedOption} 
                  onChange={(value) => setSelectedOption(value)}
                />

                {/* Message Input */}
                <fieldset>
                  <textarea
                    name="message"
                    placeholder="Enter Message"
                    rows={4}
                    required
                    className={`w-full px-4 py-3 border ${formErrors.message ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none`}
                  ></textarea>
                  {formErrors.message && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.message}</p>
                  )}
                </fieldset>

                {/* Submit Button using LinkButton */}
                <LinkButton
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary disabled:bg-gray-400 text-white font-medium px-4"
                  animation="shine"
                  animationColor="white/20"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      SENDING...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      SUBMIT
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  )}
                </LinkButton>

                {/* Checkbox */}
                <fieldset className="flex items-center">
                  <input
                    id="newsletter"
                    type="checkbox"
                    className="w-4 h-4 mt-1 accent-primary border-gray-300 rounded focus:ring-primary "
                  />
                  <label htmlFor="newsletter" className="ml-2 text-sm text-gray-600">
                    By filling out this form, I'm excited to sign up for the newsletter!
                  </label>
                </fieldset>
              </form>
            </article>
          </section>

          {/* Content Section - Second on mobile, first on desktop */}
          <section className="w-full md:w-1/2 md:order-1">
            {/* Desktop Header - Hidden on mobile */}
            <header className="hidden md:block mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">Tell Us How We Can Help</h2>
              <p className="text-gray-900 mb-8 " >
                We're always ready to assist. Share your details below or reach us directly —
                our team will get back to you within 24 hours.
              </p>
            </header>
            
            {/* Image */}
            <figure className="relative w-full h-[272px] sm:h-[272px] md:h-[383px] rounded-lg overflow-hidden mb-8">
              <Image
                src="/assets/images/contactimg.png"
                alt="Elderly man using smartphone"
                fill
                className="object-cover"
              />
            </figure>

            {/* Contact Details */}
            <address className="space-y-6 not-italic">
              <article>
                <h3 className="text-[16px] text-gray-900">Our Email</h3>
                <div className="flex items-center justify-between mt-1">
                  <a href="mailto:info@tapat.com" className="text-primary font-semibold text-lg md:text-[24px]">info@tapat.com</a>
                  <div className="relative">
                    <button 
                      className="ml-2 cursor-pointer"
                      onClick={() => copyToClipboard('info@tapat.com', 'email')}
                    >
                      <Image src="/assets/icons/copy.svg" alt="Copy email Icon" width={32} height={32} />
                    </button>
                    {showEmailTooltip && (
                      <div className="absolute right-0 -top-7 bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
                        Copied to clipboard!
                      </div>
                    )}
                  </div>
                </div>
              </article>

              <article>
                <h3 className="text-[16px] text-gray-900">Our Phone</h3>
                <div className="flex items-center justify-between mt-1">
                  <a href="tel:+1234567878" className="text-primary font-semibold text-lg md:text-[24px]">+1 234 567 78</a>
                  <div className="relative">
                    <button 
                      className="ml-2 cursor-pointer"
                      onClick={() => copyToClipboard('+1 234 567 78', 'phone')}
                    >
                      <Image src="/assets/icons/copy.svg" alt="Copy phone number Icon" width={32} height={32} />
                    </button>
                    {showPhoneTooltip && (
                      <div className="absolute right-0 -top-7 bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
                        Copied to clipboard!
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </address>
          </section>
        </main>
      </div>
    </section>
  );
};
