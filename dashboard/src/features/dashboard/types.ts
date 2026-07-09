export type DashboardRole = "caregiver" | "careseeker" | "superadmin";

export type DashboardUser = {
  id: number | null;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  picture: string | null;
  roles: string[];
  accountType: DashboardRole;
};

export type CaregiverListing = {
  id: string;
  name: string;
  initials: string;
  location: string;
  experience: string;
  rate: string;
  services: string[];
  summary: string;
  imageSrc: string;
  isBackgroundChecked: boolean;
};

export type CaregiverListingPage = {
  caregivers: CaregiverListing[];
  total: number;
  nextOffset: number | null;
  hasMore: boolean;
};

export type CaregiverQualificationsDetail = {
  certifications: string[];
  transportation: string[];
  preferences: string[];
  conditionExperience: string[];
  equipmentExperience: string[];
};

export type CaregiverServiceGroup = {
  category: string;
  services: string[];
};

export type CaregiverDetail = {
  listing: CaregiverListing;
  bio: string;
  availability: string[];
  services: string[];
  serviceGroups: CaregiverServiceGroup[];
  languages: string[];
  qualifications: CaregiverQualificationsDetail;
};

export type CaregiverScheduleItem = {
  id: string;
  time: string;
  client: string;
  service: string;
  location: string;
  duration: string;
  status: "booked" | "available";
};

export type CaregiverReview = {
  id: string;
  family: string;
  rating: number;
  quote: string;
  age: string;
};
