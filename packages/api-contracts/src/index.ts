export type AppRole = "caregiver" | "careseeker" | "staff" | "superuser";

export * from "./form-validation";
export * from "./change-password";
export * from "./care-needs";
export * from "./personal-details";
export * from "./password-policy";
export * from "./reset-password";
export * from "./skills-availability";
export * from "./qualifications-experience";

export type ApiEnvelope<TData> = {
  data: TData;
  message: string;
  status_code: number;
};

export type ApiListEnvelope<TItem> = ApiEnvelope<TItem[]>;

export type UserDto = {
  id: number;
  email: string;
  phone: string;
  picture?: string | null;
  is_verified: boolean;
};

export type UserAddressDto = {
  id: number;
  user: number;
  line_1: string;
  line_2?: string | null;
  city: string;
  state: string;
  zip: string;
  lat?: number | null;
  lng?: number | null;
};

export type CaregiverDto = {
  user: number;
  headline?: string | null;
  bio?: string | null;
  hourly_rate_cents?: number | null;
  years_experience?: number | null;
};

export type CareseekerDto = {
  careseeker_user: number;
  birth_date?: string | null;
  primary_address?: number | null;
};

export type ServiceCategoryDto = {
  id: number;
  name: string;
  slug: string;
  is_new: boolean;
  is_active: boolean;
};

export type ServiceDto = {
  id: number;
  name: string;
  slug: string;
  description: string;
  service_category: number;
  service_category_name?: string;
};

export type CaregiverSkillLevel = "basic" | "intermediate" | "advanced";

export type CaregiverSkillDto = {
  skill: number;
  caregiver: number;
  level: CaregiverSkillLevel;
};
