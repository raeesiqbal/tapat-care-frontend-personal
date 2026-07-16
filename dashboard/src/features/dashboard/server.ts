import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getPersonalDetailsLanguageLabel,
  groupSkillsAvailabilityServicesByCategory,
  normalizeQualificationsExperienceOptions,
  qualificationsExperienceValuesFromApi,
  type ExperienceItemOption,
  type ExperienceSkillLevel,
  type QualificationsChoiceOption,
  type QualificationsExperienceBackendData,
  type SkillsAvailabilityServiceOption,
} from "@tapat-care/api-contracts";

import { buildPublicAppUrl, buildPublicLoginUrl } from "@/lib/public-app-url";
import type {
  CaregiverDetail,
  CaregiverListing,
  CaregiverListingPage,
  CaregiverQualificationsDetail,
  DashboardRole,
  DashboardUser,
} from "@/features/dashboard/types";

type CurrentUserPayload = {
  data?: {
    id?: number;
    email?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    picture?: string | null;
    roles?: string[];
    account_type?: string;
    is_verified?: boolean;
    phone_verified?: boolean;
  };
};

type DashboardOnboardingStatePayload = {
  data?: {
    onboarding?: {
      status?: string;
      completed_steps?: string[];
      next_step?: string;
    };
    account_status?: string;
    screening_status?: string;
    phone_verified?: boolean;
    saved_steps?: string[];
  };
};

type BackendCaregiverListing = {
  id?: number | string;
  user?: number | string;
  name?: string | null;
  picture?: string | null;
  location?: string | null;
  headline?: string | null;
  bio?: string | null;
  hourly_rate_cents?: number | null;
  years_experience?: number | null;
  screening_status?: string | null;
  services?: unknown;
};

type BackendCaregiverDetail = BackendCaregiverListing & {
  availability?: unknown;
  languages?: unknown;
  qualifications_experience?: QualificationsExperienceBackendData | null;
};

type CaregiverListPayload = {
  data?:
    | {
        count?: number;
        next?: string | null;
        results?: BackendCaregiverListing[];
      }
    | BackendCaregiverListing[];
};

type CaregiverDetailPayload = {
  data?: BackendCaregiverDetail;
};

const API_BASE =
  process.env.BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ||
  "http://127.0.0.1:8000";

export const CAREGIVER_LISTING_PAGE_SIZE = 10;

export const DASHBOARD_AUTH_COOKIE_NAMES = [
  "tapat_onboarding_access_token",
  "access_token",
  "token",
] as const;

const PROVIDER_ONBOARDING_STEPS = new Set([
  "verification",
  "personal-details",
  "skills-availability",
  "qualifications-experience",
  "review",
  "screening-payment",
  "submitted",
]);

const CARESEEKER_ONBOARDING_STEPS = new Set([
  "verification",
  "personal-details",
]);

const TERMINAL_PROVIDER_ONBOARDING_STATUSES = new Set([
  "completed",
  "in_review",
  "under_review",
]);

const TERMINAL_CARESEEKER_ONBOARDING_STATUSES = new Set(["completed"]);

function joinBackendUrl(pathname: string) {
  const normalizedBase = API_BASE.replace(/\/$/, "");
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${normalizedBase}${normalizedPath}`;
}

export class DashboardBackendError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "DashboardBackendError";
    this.status = status;
    this.payload = payload;
  }
}

export async function dashboardBackendRequest<TPayload>(
  pathname: string,
  token: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  const isFormDataBody =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  if (init.body && !headers.has("Content-Type") && !isFormDataBody) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(joinBackendUrl(pathname), {
    ...init,
    cache: init.cache ?? "no-store",
    headers,
  });
  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new DashboardBackendError(
      payload?.message || `Request failed with ${response.status}`,
      response.status,
      payload,
    );
  }

  return payload as TPayload;
}

function normalizeDashboardRole(accountType?: string, roles: string[] = []): DashboardRole {
  const normalizedAccountType = String(accountType || "").trim().toLowerCase();
  const normalizedRoles = roles.map((role) => role.trim().toLowerCase());

  if (normalizedAccountType === "caregiver" || normalizedRoles.includes("caregiver")) {
    return "caregiver";
  }

  if (normalizedAccountType === "careseeker" || normalizedRoles.includes("careseeker")) {
    return "careseeker";
  }

  if (
    normalizedAccountType === "superadmin" ||
    normalizedAccountType === "superuser" ||
    normalizedRoles.includes("superuser") ||
    normalizedRoles.includes("staff")
  ) {
    return "superadmin";
  }

  return "careseeker";
}

function normalizeStatus(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function buildVerifyEmailPath(email: string) {
  if (!email) {
    return "/verify-email";
  }

  return `/verify-email?email=${encodeURIComponent(email)}`;
}

function getOnboardingStateEndpoint(role: DashboardRole) {
  if (role === "caregiver") {
    return "/api/caregivers/onboarding-state/";
  }

  if (role === "careseeker") {
    return "/api/careseekers/onboarding-state/";
  }

  return null;
}

function getProviderOnboardingRedirect(payload: DashboardOnboardingStatePayload) {
  const accountStatus = normalizeStatus(payload.data?.account_status);
  const onboardingStatus = normalizeStatus(payload.data?.onboarding?.status);
  const nextStep = String(payload.data?.onboarding?.next_step || "").trim();
  const phoneVerified = Boolean(payload.data?.phone_verified);

  if (!phoneVerified) {
    return "/onboarding/provider/verification";
  }

  if (accountStatus === "approved") {
    return null;
  }

  if (
    ["in_review", "review_required", "rejected"].includes(accountStatus) ||
    TERMINAL_PROVIDER_ONBOARDING_STATUSES.has(onboardingStatus)
  ) {
    return "/onboarding/provider/submitted";
  }

  if (nextStep && PROVIDER_ONBOARDING_STEPS.has(nextStep)) {
    return `/onboarding/provider/${nextStep}`;
  }

  return "/onboarding/provider/personal-details";
}

function getCareseekerOnboardingRedirect(payload: DashboardOnboardingStatePayload) {
  const accountStatus = normalizeStatus(payload.data?.account_status);
  const onboardingStatus = normalizeStatus(payload.data?.onboarding?.status);
  const nextStep = String(payload.data?.onboarding?.next_step || "").trim();
  const phoneVerified = Boolean(payload.data?.phone_verified);

  if (!phoneVerified) {
    return "/onboarding/careseeker/verification";
  }

  if (accountStatus === "approved") {
    return null;
  }

  if (
    TERMINAL_CARESEEKER_ONBOARDING_STATUSES.has(onboardingStatus) ||
    (accountStatus && accountStatus !== "onboarding_in_progress")
  ) {
    return "/onboarding/careseeker/submitted";
  }

  if (nextStep && CARESEEKER_ONBOARDING_STEPS.has(nextStep)) {
    return `/onboarding/careseeker/${nextStep}`;
  }

  return "/onboarding/careseeker/personal-details";
}

async function getDashboardAccessRedirect(
  token: string,
  currentUser: CurrentUserPayload,
  user: DashboardUser,
) {
  const email = String(currentUser.data?.email || user.email || "").trim();

  if (!currentUser.data?.is_verified) {
    return buildVerifyEmailPath(email);
  }

  if (user.accountType === "superadmin") {
    return null;
  }

  const endpoint = getOnboardingStateEndpoint(user.accountType);

  if (!endpoint) {
    return "/get-started";
  }

  try {
    const payload = await dashboardBackendRequest<DashboardOnboardingStatePayload>(
      endpoint,
      token,
      { method: "GET", cache: "no-store" },
    );

    return user.accountType === "caregiver"
      ? getProviderOnboardingRedirect(payload)
      : getCareseekerOnboardingRedirect(payload);
  } catch (error) {
    if (
      error instanceof DashboardBackendError &&
      (error.status === 401 || error.status === 403)
    ) {
      return buildVerifyEmailPath(email);
    }

    return "/get-started";
  }
}

function makeInitials(name: string, email: string) {
  const source = name.trim() || email.split("@")[0] || "User";
  const parts = source.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "U";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
  return `${first}${second || ""}`.toUpperCase();
}

function getRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeServices(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((service) => {
      if (typeof service === "string") {
        return service.trim();
      }

      return getString(getRecord(service).name);
    })
    .filter(Boolean);
}

function normalizeDetailedServiceOptions(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<number | string>();

  return value.reduce<SkillsAvailabilityServiceOption[]>((result, service) => {
    const record = getRecord(service);
    const name = getString(record.name);
    const idValue = record.id;
    const id =
      typeof idValue === "number"
        ? idValue
        : typeof idValue === "string" && idValue.trim()
          ? Number(idValue)
          : null;
    const dedupeKey = id ?? name;

    if (!name || !dedupeKey || seen.has(dedupeKey)) {
      return result;
    }

    seen.add(dedupeKey);
    return [
      ...result,
      {
        id: typeof id === "number" && Number.isFinite(id) ? id : 0,
        name,
        service_category:
          typeof record.service_category === "number"
            ? record.service_category
            : undefined,
        service_category_name: getString(record.service_category_name),
      },
    ];
  }, []);
}

function normalizeServiceGroups(value: unknown) {
  const serviceOptions = normalizeDetailedServiceOptions(value);

  if (serviceOptions.length === 0) {
    return [];
  }

  return groupSkillsAvailabilityServicesByCategory(serviceOptions).map(
    (group) => ({
      category: group.category,
      services: group.services.map((service) => service.name),
    }),
  );
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();

  return value.reduce<string[]>((result, item) => {
    const normalized = String(item ?? "").trim();

    if (!normalized || seen.has(normalized)) {
      return result;
    }

    seen.add(normalized);
    return [...result, normalized];
  }, []);
}

function formatAvailabilityTime(value: unknown) {
  const rawValue = getString(value);
  const [rawHour, rawMinute] = rawValue.split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (
    !rawValue ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return rawValue;
  }

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const displayMinute = String(minute).padStart(2, "0");

  return `${displayHour}:${displayMinute} ${period}`;
}

function normalizeAvailability(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();

  return value.reduce<string[]>((result, item) => {
    if (typeof item === "string") {
      const normalized = item.trim();

      if (!normalized || seen.has(normalized)) {
        return result;
      }

      seen.add(normalized);
      return [...result, normalized];
    }

    const record = getRecord(item);
    const day = getString(record.day);
    const start = formatAvailabilityTime(record.start);
    const end = formatAvailabilityTime(record.end);
    const timeRange = [start, end].filter(Boolean).join(" - ");
    const normalized = [day, timeRange].filter(Boolean).join(" ");

    if (!normalized || seen.has(normalized)) {
      return result;
    }

    seen.add(normalized);
    return [...result, normalized];
  }, []);
}

function formatExperience(yearsExperience: unknown) {
  const years = getFiniteNumber(yearsExperience);

  if (years === null) {
    return "Experience not listed";
  }

  if (years === 1) {
    return "1 yr experience";
  }

  return `${years} yrs experience`;
}

function formatHourlyRate(hourlyRateCents: unknown) {
  const cents = getFiniteNumber(hourlyRateCents);

  if (cents === null || cents <= 0) {
    return "Contact";
  }

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
    style: "currency",
  }).format(cents / 100);
}

function getImageSrc(picture: unknown) {
  const imageSrc = getString(picture);

  if (imageSrc.startsWith("/") || imageSrc.startsWith("data:")) {
    return imageSrc;
  }

  return "/assets/images/profile.png";
}

function getOptionLabel<TValue extends string>(
  value: string,
  options: readonly QualificationsChoiceOption<TValue>[],
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function getExperienceItemName(
  itemId: number,
  options: readonly ExperienceItemOption[],
) {
  return options.find((option) => option.id === itemId)?.name ?? String(itemId);
}

function formatQualificationsBoolean(value: string) {
  if (value === "true") {
    return "Yes";
  }

  if (value === "false") {
    return "No";
  }

  return "";
}

function normalizeQualificationExperience(
  values: Array<{ item_id: number; skill_level: ExperienceSkillLevel }>,
  itemOptions: readonly ExperienceItemOption[],
  skillLevelOptions: readonly QualificationsChoiceOption<ExperienceSkillLevel>[],
) {
  return values.map(
    (item) =>
      `${getExperienceItemName(item.item_id, itemOptions)}: ${getOptionLabel(
        item.skill_level,
        skillLevelOptions,
      )}`,
  );
}

function normalizeQualifications(
  qualifications?: QualificationsExperienceBackendData | null,
): CaregiverQualificationsDetail {
  const options = normalizeQualificationsExperienceOptions(qualifications);
  const values = qualificationsExperienceValuesFromApi(qualifications);
  const certificationNameById = new Map(
    options.certifications.map((certification) => [
      certification.id,
      certification.name,
    ]),
  );
  const transportation = [
    values.hasDriversLicense
      ? `Driver's license: ${formatQualificationsBoolean(
          values.hasDriversLicense,
        )}`
      : "",
    values.hasCar ? `Car: ${formatQualificationsBoolean(values.hasCar)}` : "",
    values.hasAutoInsuranceRegistration
      ? `Insurance/registration: ${formatQualificationsBoolean(
          values.hasAutoInsuranceRegistration,
        )}`
      : "",
    values.transportationComfort
      ? `Comfort: ${getOptionLabel(
          values.transportationComfort,
          options.transportationComfort,
        )}`
      : "",
  ].filter(Boolean);
  const petLabels = values.petTypesComfortable.map((petType) =>
    getOptionLabel(petType, options.petTypes),
  );
  const preferences = [
    values.willingWithPets === "true"
      ? `Pets: ${petLabels.join(", ") || "Yes"}`
      : values.willingWithPets
        ? `Pets: ${formatQualificationsBoolean(values.willingWithPets)}`
        : "",
    values.willingWithSmokers
      ? `Smokers: ${formatQualificationsBoolean(values.willingWithSmokers)}`
      : "",
  ].filter(Boolean);

  return {
    certifications: values.certifications.map(
      (certificationId) =>
        certificationNameById.get(certificationId) ?? String(certificationId),
    ),
    transportation,
    preferences,
    conditionExperience: normalizeQualificationExperience(
      values.conditionExperience,
      options.conditionExperienceItems,
      options.skillLevels,
    ),
    equipmentExperience: normalizeQualificationExperience(
      values.equipmentExperience,
      options.equipmentExperienceItems,
      options.skillLevels,
    ),
  };
}

function normalizeCaregiverListing(
  caregiver: BackendCaregiverListing,
  index: number,
  offset: number,
): CaregiverListing {
  const name = getString(caregiver.name) || "Caregiver";
  const id = String(caregiver.id ?? caregiver.user ?? `caregiver-${offset + index}`);
  const headline = getString(caregiver.headline);
  const bio = getString(caregiver.bio);

  return {
    id,
    name,
    initials: makeInitials(name, name),
    location: getString(caregiver.location) || "Location not available",
    experience: formatExperience(caregiver.years_experience),
    rate: formatHourlyRate(caregiver.hourly_rate_cents),
    services: normalizeServices(caregiver.services),
    summary: bio || headline || "Caregiver profile details coming soon.",
    imageSrc: getImageSrc(caregiver.picture),
    isBackgroundChecked:
      getString(caregiver.screening_status).toLowerCase() === "approved",
  };
}

function normalizeCaregiverListPayload(
  payload: CaregiverListPayload,
  offset: number,
): CaregiverListingPage {
  const data = payload.data;
  const pageData = Array.isArray(data) ? {} : data || {};
  const results = Array.isArray(data)
    ? data
    : Array.isArray(pageData.results)
      ? pageData.results
      : [];
  const total =
    typeof pageData.count === "number" && Number.isFinite(pageData.count)
      ? pageData.count
      : results.length;
  const caregivers = results.map((caregiver, index) =>
    normalizeCaregiverListing(caregiver, index, offset),
  );
  const hasMore =
    Boolean(pageData.next) || offset + caregivers.length < total;

  return {
    caregivers,
    total,
    nextOffset: hasMore ? offset + CAREGIVER_LISTING_PAGE_SIZE : null,
    hasMore,
  };
}

function normalizeCaregiverDetailPayload(
  payload: CaregiverDetailPayload,
): CaregiverDetail {
  const caregiver = payload.data;

  if (!caregiver) {
    throw new DashboardBackendError(
      "Caregiver profile not found.",
      404,
      payload,
    );
  }

  const listing = normalizeCaregiverListing(caregiver, 0, 0);
  const bio = getString(caregiver.bio) || listing.summary;

  return {
    listing,
    bio,
    availability: normalizeAvailability(caregiver.availability),
    services: listing.services,
    serviceGroups: normalizeServiceGroups(caregiver.services),
    languages: normalizeStringArray(caregiver.languages).map(
      getPersonalDetailsLanguageLabel,
    ),
    qualifications: normalizeQualifications(caregiver.qualifications_experience),
  };
}

export async function getCaregiverListingPage(token: string, offset = 0) {
  const normalizedOffset = Math.max(0, Math.floor(offset));
  const payload = await dashboardBackendRequest<CaregiverListPayload>(
    `/api/caregivers/?limit=${CAREGIVER_LISTING_PAGE_SIZE}&offset=${normalizedOffset}`,
    token,
  );

  return normalizeCaregiverListPayload(payload, normalizedOffset);
}

export async function getCaregiverDetail(token: string, id: string) {
  const caregiverId = encodeURIComponent(id.trim());
  const payload = await dashboardBackendRequest<CaregiverDetailPayload>(
    `/api/caregivers/${caregiverId}/`,
    token,
  );

  return normalizeCaregiverDetailPayload(payload);
}

function normalizeUser(payload: CurrentUserPayload): DashboardUser {
  const data = payload.data || {};
  const email = String(data.email || "");
  const firstName = String(data.first_name || "").trim();
  const lastName = String(data.last_name || "").trim();
  const fullName = String(data.full_name || `${firstName} ${lastName}`).trim();
  const roles = Array.isArray(data.roles)
    ? data.roles.map((role) => String(role)).filter(Boolean)
    : [];

  return {
    id: typeof data.id === "number" ? data.id : null,
    email,
    firstName,
    lastName,
    fullName: fullName || email,
    initials: makeInitials(fullName, email),
    picture: data.picture || null,
    roles,
    accountType: normalizeDashboardRole(data.account_type, roles),
  };
}

export async function getDashboardAuthToken() {
  const cookieStore = await cookies();

  for (const cookieName of DASHBOARD_AUTH_COOKIE_NAMES) {
    const token = cookieStore.get(cookieName)?.value;
    if (token) {
      return token;
    }
  }

  return null;
}

export async function getDashboardSession(nextPath = "/dashboard") {
  const token = await getDashboardAuthToken();

  if (!token) {
    redirect(buildPublicLoginUrl(nextPath));
  }

  let payload: CurrentUserPayload;

  try {
    const response = await fetch(joinBackendUrl("/api/users/me/"), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Current user request failed with ${response.status}`);
    }

    payload = (await response.json()) as CurrentUserPayload;
  } catch {
    redirect(buildPublicLoginUrl(nextPath));
  }

  const user = normalizeUser(payload);
  const onboardingRedirect = await getDashboardAccessRedirect(
    token,
    payload,
    user,
  );

  if (onboardingRedirect) {
    redirect(buildPublicAppUrl(onboardingRedirect));
  }

  return {
    token,
    user,
  };
}
