import type {
  CaregiverListing,
  CaregiverReview,
  CaregiverScheduleItem,
} from "@/features/dashboard/types";

export const caregiverListings: CaregiverListing[] = [
  {
    id: "kelsey-estrada",
    name: "Kelsey Estrada",
    initials: "KE",
    location: "Flatbush, Brooklyn - 11226",
    experience: "6 yrs experience",
    rate: "$30",
    services: [
      "Personal care",
      "Meal preparation",
      "Companionship",
      "Transportation",
      "Medication reminders",
      "Housekeeping",
    ],
    summary:
      "Calm, dependable caregiver experienced with daily routines, mobility support, meals, and companionship for older adults at home.",
    imageSrc: "/assets/images/profile.png",
    isBackgroundChecked: true,
  },
  {
    id: "maggie-wilson",
    name: "Maggie Wilson",
    initials: "MW",
    location: "Ditmar Park, Brooklyn - 11226",
    experience: "4 yrs experience",
    rate: "$25",
    services: [
      "Companionship",
      "Light housekeeping",
      "Errands",
      "Meal preparation",
      "Medication reminders",
      "Respite care",
    ],
    summary:
      "Warm and organized support for families who need steady daytime care, conversation, meal help, and household routines.",
    imageSrc: "/assets/images/profile.png",
    isBackgroundChecked: true,
  },
  {
    id: "joyful-adebayo",
    name: "Joyful Adebayo",
    initials: "JA",
    location: "Park Slope, Brooklyn - 11226",
    experience: "12 yrs experience",
    rate: "$35",
    services: [
      "Dementia care",
      "Personal care",
      "Mobility support",
      "Overnight care",
      "Medication reminders",
      "Transportation",
      "Meal preparation",
      "Companionship",
    ],
    summary:
      "Senior caregiver with deep experience supporting memory care, safe transfers, overnight routines, and complex family schedules.",
    imageSrc: "/assets/images/profile.png",
    isBackgroundChecked: true,
  },
  {
    id: "jenifer-hall",
    name: "Jenifer Hall",
    initials: "JH",
    location: "Flatbush, Brooklyn - 11226",
    experience: "8 yrs experience",
    rate: "$40",
    services: [
      "Personal care",
      "Transportation",
      "Medication reminders",
      "Mobility support",
      "Companionship",
    ],
    summary:
      "Patient, detail-oriented caregiver for families who need reliable help with personal care, appointments, and weekly routines.",
    imageSrc: "/assets/images/profile.png",
    isBackgroundChecked: true,
  },
];

export const caregiverSchedule: CaregiverScheduleItem[] = [
  {
    id: "dorothy-morning",
    time: "9:00 AM",
    client: "Dorothy Simmons",
    service: "Personal care",
    location: "Oak Ave",
    duration: "3 hrs",
    status: "booked",
  },
  {
    id: "kim-afternoon",
    time: "1:00 PM",
    client: "Harold & June Kim",
    service: "Companionship",
    location: "47 Birch St",
    duration: "3 hrs",
    status: "booked",
  },
  {
    id: "open-evening",
    time: "4:00 PM",
    client: "Available - no shift",
    service: "",
    location: "",
    duration: "+ Add",
    status: "available",
  },
];

export const caregiverReviews: CaregiverReview[] = [
  {
    id: "kim-family",
    family: "Kim family",
    rating: 5,
    quote: "Sarah is incredibly kind and Harold adores her. Punctual every time.",
    age: "2 days ago",
  },
  {
    id: "lees",
    family: "The Lees",
    rating: 5,
    quote: "We felt so at ease knowing Mom was in good hands.",
    age: "1 week ago",
  },
  {
    id: "simmons",
    family: "Simmons family",
    rating: 4,
    quote: "Very attentive and professional. Took great care of Dorothy.",
    age: "2 weeks ago",
  },
];
