import { ServiceData } from "@/interface";
import type { ServiceTab } from "@/interface";

export const serviceData: ServiceData = {
  "Home Assistance": {
    title:
      "When home tasks get harder, caregivers keep your day running smoothly.",
    description:
      "Help with practical, everyday chores so you can stay comfortable at home—meals, light housekeeping, and errands done with care and respect.",
    image: "/assets/images/caregiver1.png",
    features: [
      {
        icon: "/assets/icons/Grocery.svg",
        text: "Meal planning and<br/> preparation",
      },
      {
        icon: "/assets/icons/Home.svg",
        text: "Light housekeeping and<br/> home organization",
      },
      {
        icon: "/assets/icons/Support.svg",
        text: "Errands and<br/> grocery shopping",
      },
      {
        icon: "/assets/icons/Assistance.svg",
        text: "Laundry and<br/> household routines",
      },
      {
        icon: "/assets/icons/Compassionate.svg",
        text: "Transportation and<br/> appointment rides",
      },
      {
        icon: "/assets/icons/Support.svg",
        text: "Phone calls and<br/> correspondence",
      },
    ],
  },
  Companionship: {
    title: "A steady, friendly presence—so you never feel alone.",
    description:
      "Companionship is more than being there. Caregivers offer conversation, encouragement, and shared activities that support emotional wellbeing and confidence.",
    image: "/assets/images/service.png",
    features: [
      { icon: "💬", text: "Engaging conversation and active listening" },
      { icon: "🎮", text: "Shared activities, hobbies, and games" },
      { icon: "📅", text: "Non-medical appointment accompaniment" },
      { icon: "📱", text: "Technology assistance" },
      { icon: "🚶", text: "Outdoor walks and community connection" },
    ],
  },
  "Flexible Care Plans": {
    title: "Care that fits your life—hourly help or ongoing support.",
    description:
      "Needs can change week to week. Tailored schedules and tasks so you get the right level of help—without paying for what you don’t need.",
    image: "/assets/images/service.png",
    features: [
      { icon: "⏱️", text: "Hourly, daily, or weekly care options" },
      { icon: "🔄", text: "Flexible routines as needs change" },
      { icon: "📱", text: "Easy schedule adjustments" },
      { icon: "🏠", text: "Respite care for family caregivers" },
      { icon: "📊", text: "Scalable services as needs change" },
    ],
  },
  "Personal Care Support": {
    title: "Respectful help with personal care—privacy first, always.",
    description:
      "Assists with day-to-day personal care in a dignified, comfortable way—supporting independence while ensuring safety.",
    image: "/assets/images/service.png",
    features: [
      { icon: "🧼", text: "Bathing support" },
      { icon: "👕", text: "Dressing assistance" },
      { icon: "🪥", text: "Personal hygiene and grooming" },
      { icon: "🚽", text: "Toileting and incontinence care" },
      { icon: "🍽️", text: "Feeding assistance (non-medical)" },
    ],
  },
  "Mobility & Safety": {
    title: "Safe movement at home—steady support for every step.",
    description:
      "From getting out of bed to moving around the house with comfort and confidence.",
    image: "/assets/images/service.png",
    features: [
      { icon: "🛏️", text: "Positioning and comfort support" },
      { icon: "🤝", text: "Transferring (bed/chair/toilet)" },
      { icon: "🚶", text: "Ambulating and walking support" },
      { icon: "🧘", text: "Gentle exercise assistance" },
    ],
  },
  "Medication Reminders (Self-Administered)": {
    title: "Gentle reminders—so you stay on track with your own medication.",
    description:
      "Supports self-administered medication: reminders, opening containers, and refill reminders.",
    image: "/assets/images/service.png",
    features: [
      { icon: "💊", text: "Help opening bottles/blister packs" },
      { icon: "⏰", text: "Medication reminders (self-administered)" },
      { icon: "🧾", text: "Refill reminders" },
    ],
  },
};

export const serviceTabs: ServiceTab[] = [
  "Home Assistance",
  "Companionship",
  "Flexible Care Plans",
  "Personal Care Support",
  "Mobility & Safety",
  "Medication Reminders (Self-Administered)",
];