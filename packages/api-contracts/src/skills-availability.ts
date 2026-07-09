import type { FieldErrors } from "./form-validation";

export const SKILLS_AVAILABILITY_FIELD_IDS = [
  "services",
  "hourlyRate",
  "yearsExperience",
  "availability",
  "bio",
] as const;

export type SkillsAvailabilityFormField =
  (typeof SKILLS_AVAILABILITY_FIELD_IDS)[number];

export type SkillsAvailabilityValues = {
  services: number[];
  hourlyRate: string;
  yearsExperience: string;
  availability: string[];
  bio: string;
};

export type SkillsAvailabilityFieldErrors =
  FieldErrors<SkillsAvailabilityFormField>;

export type SkillsAvailabilityServiceOption = {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  service_category?: number;
  service_category_name?: string;
};

export type SkillsAvailabilityServiceCategoryGroup = {
  category: string;
  services: SkillsAvailabilityServiceOption[];
};

export type SkillsAvailabilityUpdatePayload = {
  services?: number[];
  hourly_rate_cents?: number | null;
  years_experience?: number | null;
  availability?: string[];
  bio?: string;
};

export const initialSkillsAvailabilityValues: SkillsAvailabilityValues = {
  services: [],
  hourlyRate: "",
  yearsExperience: "",
  availability: [],
  bio: "",
};

export type SkillsAvailabilityFormInfoCallout = {
  servicesCalloutText: string;
  hourlyRateCalloutText: string;
  yearsExperienceCalloutText: string;
  availabilityCalloutText: string;
  bioCalloutText: string;
};

export const skillsAvailabilityFieldLabels: Record<
  SkillsAvailabilityFormField,
  string
> = {
  services: "Services offered",
  hourlyRate: "Hourly rate",
  yearsExperience: "Years of experience",
  availability: "Availability",
  bio: "Bio",
};

export const skillsAvailabilityFormInfoCallout: SkillsAvailabilityFormInfoCallout =
  {
    servicesCalloutText:
      "These services help families understand how you can provide care. Select every service you're comfortable and experienced offering.",
    hourlyRateCalloutText:
      "Set your preferred hourly rate for caregiving services. Families can use this to find caregivers within their budget.",
    yearsExperienceCalloutText:
      "Share how many years of caregiving experience you have. Families use this to understand your background and choose the right care fit.",
    availabilityCalloutText:
      "Tell families when you're available to provide care. Your availability helps us match you with the right opportunities.",
    bioCalloutText:
      "Introduce yourself in a few sentences. Share your caregiving experience, strengths, and what families can expect when working with you",
  };

export const skillsAvailabilityOptions = [
  "Full-time",
  "Part-time",
  "Morning",
  "Night",
  "Weekends",
] as const;

const hourlyRatePattern = /^\d+(?:\.\d{1,2})?$/;
const yearsExperiencePattern = /^\d+$/;

function parseStoredArray<T>(value: string | undefined): T[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function hourlyRateValueFromCents(value: string | undefined): string {
  if (!value) {
    return "";
  }

  const cents = Number(value);

  if (!Number.isFinite(cents) || cents <= 0) {
    return "";
  }

  return (cents / 100)
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");
}

export function normalizeSkillsAvailabilityHourlyRate(value?: string) {
  return String(value ?? "").trim();
}

export function normalizeSkillsAvailabilityYearsExperience(value?: string) {
  return String(value ?? "").trim();
}

export function skillsAvailabilityHourlyRateCentsFromValue(
  value: string,
): number | null {
  const normalized = normalizeSkillsAvailabilityHourlyRate(value);

  if (!hourlyRatePattern.test(normalized)) {
    return null;
  }

  const cents = Math.round(Number(normalized) * 100);
  return cents > 0 ? cents : null;
}

export function skillsAvailabilityYearsExperienceFromValue(
  value: string,
): number | null {
  const normalized = normalizeSkillsAvailabilityYearsExperience(value);

  if (!yearsExperiencePattern.test(normalized)) {
    return null;
  }

  const years = Number(normalized);
  return Number.isSafeInteger(years) && years >= 0 ? years : null;
}

function getHourlyRateValidationError(value: string) {
  const normalized = normalizeSkillsAvailabilityHourlyRate(value);

  if (!normalized) {
    return "Hourly rate is required.";
  }

  if (!hourlyRatePattern.test(normalized)) {
    return "Enter a valid hourly rate.";
  }

  return skillsAvailabilityHourlyRateCentsFromValue(normalized)
    ? undefined
    : "Hourly rate must be greater than $0.";
}

function getYearsExperienceValidationError(value: string) {
  const normalized = normalizeSkillsAvailabilityYearsExperience(value);

  if (!normalized) {
    return "Years of experience is required.";
  }

  return skillsAvailabilityYearsExperienceFromValue(normalized) === null
    ? "Enter whole years of experience."
    : undefined;
}

export function skillsAvailabilityValuesFromFormData(
  formData: FormData,
): SkillsAvailabilityValues {
  return {
    services: formData.getAll("services").map((value) => Number(value)),
    hourlyRate: normalizeSkillsAvailabilityHourlyRate(
      String(formData.get("hourlyRate") || ""),
    ),
    yearsExperience: normalizeSkillsAvailabilityYearsExperience(
      String(formData.get("yearsExperience") || ""),
    ),
    availability: formData.getAll("availability").map((value) => String(value)),
    bio: String(formData.get("bio") || "").trim(),
  };
}

export function skillsAvailabilityValuesFromState(
  values?: Record<string, string>,
): SkillsAvailabilityValues {
  return {
    services: parseStoredArray<number>(values?.services),
    hourlyRate: normalizeSkillsAvailabilityHourlyRate(
      values?.hourlyRate ??
        hourlyRateValueFromCents(
          values?.hourlyRateCents ?? values?.["hourly_rate_cents"],
        ),
    ),
    yearsExperience: normalizeSkillsAvailabilityYearsExperience(
      values?.yearsExperience ?? values?.["years_experience"],
    ),
    availability: parseStoredArray<string>(values?.availability),
    bio: values?.bio ?? values?.intro ?? "",
  };
}

export function skillsAvailabilityValuesToState(
  values: SkillsAvailabilityValues,
): Record<SkillsAvailabilityFormField, string> {
  return {
    services: JSON.stringify(values.services),
    hourlyRate: values.hourlyRate,
    yearsExperience: values.yearsExperience,
    availability: JSON.stringify(values.availability),
    bio: values.bio,
  };
}

export function validateSkillsAvailabilityForm(
  values: SkillsAvailabilityValues,
  fields: ReadonlyArray<SkillsAvailabilityFormField> = SKILLS_AVAILABILITY_FIELD_IDS,
): SkillsAvailabilityFieldErrors {
  const fieldSet = new Set(fields);
  const fieldErrors: SkillsAvailabilityFieldErrors = {};

  if (fieldSet.has("services") && values.services.length === 0) {
    fieldErrors.services = "Select at least one service.";
  }

  const hourlyRateError = getHourlyRateValidationError(values.hourlyRate);

  if (fieldSet.has("hourlyRate") && hourlyRateError) {
    fieldErrors.hourlyRate = hourlyRateError;
  }

  const yearsExperienceError = getYearsExperienceValidationError(
    values.yearsExperience,
  );

  if (fieldSet.has("yearsExperience") && yearsExperienceError) {
    fieldErrors.yearsExperience = yearsExperienceError;
  }

  if (fieldSet.has("availability") && values.availability.length === 0) {
    fieldErrors.availability = "Select at least one availability option.";
  }

  if (fieldSet.has("bio") && !values.bio) {
    fieldErrors.bio = "Bio is required.";
  }

  return fieldErrors;
}

export function mergeSkillsAvailabilityFieldErrors(
  ...fieldErrors: Array<SkillsAvailabilityFieldErrors | undefined>
): SkillsAvailabilityFieldErrors {
  return fieldErrors.reduce<SkillsAvailabilityFieldErrors>(
    (result, errors) => ({ ...result, ...(errors ?? {}) }),
    {},
  );
}

export function buildSkillsAvailabilityUpdatePayload(
  values: SkillsAvailabilityValues,
  fields: ReadonlyArray<SkillsAvailabilityFormField> = SKILLS_AVAILABILITY_FIELD_IDS,
): SkillsAvailabilityUpdatePayload {
  const fieldSet = new Set(fields);
  const payload: SkillsAvailabilityUpdatePayload = {};

  if (fieldSet.has("services")) {
    payload.services = values.services;
  }

  if (fieldSet.has("hourlyRate")) {
    payload.hourly_rate_cents = skillsAvailabilityHourlyRateCentsFromValue(
      values.hourlyRate,
    );
  }

  if (fieldSet.has("yearsExperience")) {
    payload.years_experience = skillsAvailabilityYearsExperienceFromValue(
      values.yearsExperience,
    );
  }

  if (fieldSet.has("availability")) {
    payload.availability = values.availability;
  }

  if (fieldSet.has("bio")) {
    payload.bio = values.bio;
  }

  return payload;
}

export function formatSkillsAvailabilityList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "-";
}

export function formatSkillsAvailabilityBio(value: string) {
  return value.trim() || "-";
}

export function formatSkillsAvailabilityHourlyRate(value: string) {
  const cents = skillsAvailabilityHourlyRateCentsFromValue(value);

  if (cents === null) {
    return "-";
  }

  const rate = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);

  return `${rate} per hour`;
}

export function formatSkillsAvailabilityYearsExperience(value: string) {
  const years = skillsAvailabilityYearsExperienceFromValue(value);

  if (years === null) {
    return "-";
  }

  return `${years} ${years === 1 ? "year" : "years"} experience`;
}

export function formatSkillsAvailabilityServices(
  serviceIds: number[],
  serviceCatalog: ReadonlyArray<SkillsAvailabilityServiceOption>,
) {
  if (serviceIds.length === 0) {
    return "-";
  }

  if (serviceCatalog.length === 0) {
    return serviceIds.join(", ");
  }

  return serviceIds
    .map(
      (serviceId) =>
        serviceCatalog.find((service) => service.id === serviceId)?.name ??
        String(serviceId),
    )
    .join(", ");
}

export function groupSkillsAvailabilityServicesByCategory(
  serviceCatalog: ReadonlyArray<SkillsAvailabilityServiceOption>,
): SkillsAvailabilityServiceCategoryGroup[] {
  const groupedServices = new Map<string, SkillsAvailabilityServiceOption[]>();

  for (const service of serviceCatalog) {
    const category = service.service_category_name?.trim() || "Other services";
    const services = groupedServices.get(category);

    if (services) {
      services.push(service);
    } else {
      groupedServices.set(category, [service]);
    }
  }

  return Array.from(groupedServices, ([category, services]) => ({
    category,
    services,
  }));
}
