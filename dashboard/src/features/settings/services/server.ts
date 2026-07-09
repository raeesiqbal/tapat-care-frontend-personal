import "server-only";

import {
  initialSkillsAvailabilityValues,
  skillsAvailabilityValuesFromState,
  type ApiEnvelope,
  type ServiceCategoryDto,
  type SkillsAvailabilityServiceOption,
  type SkillsAvailabilityValues,
} from "@tapat-care/api-contracts";

import { dashboardBackendRequest } from "@/features/dashboard/server";
import type { DashboardRole } from "@/features/dashboard/types";

type DashboardServicesOnboardingStatePayload = ApiEnvelope<{
  onboarding?: {
    status?: string;
    completed_steps?: string[];
    next_step?: string;
  };
  saved_steps?: string[];
  values_by_step?: {
    "skills-availability"?: Record<string, string>;
  };
}>;

type DashboardServicesCatalogPayload =
  ApiEnvelope<SkillsAvailabilityServiceOption[]>;
type DashboardServicesCategoriesPayload = ApiEnvelope<ServiceCategoryDto[]>;

export type DashboardServicesSettingsSnapshot = {
  values: SkillsAvailabilityValues;
  serviceOptions: SkillsAvailabilityServiceOption[];
  onboardingStatus: string;
  completedSteps: string[];
  nextStep: string;
  canUpdate: boolean;
};

export function canAccessDashboardServicesSettings(role: DashboardRole) {
  return role === "caregiver";
}

export function getDashboardServicesSettingsEndpoint() {
  return "/api/caregivers/update-profile/";
}

function isDashboardServicesUpdateAllowed(
  details: Pick<
    DashboardServicesSettingsSnapshot,
    "completedSteps" | "nextStep" | "onboardingStatus"
  >,
) {
  if (!details.completedSteps.includes("skills-availability")) {
    return false;
  }

  return (
    ["completed", "in_review", "under_review"].includes(
      details.onboardingStatus,
    ) || details.nextStep === "submitted"
  );
}

async function getDashboardServicesCatalog(token: string) {
  const [servicesPayload, categoriesPayload] = await Promise.all([
    dashboardBackendRequest<DashboardServicesCatalogPayload>(
      "/api/services/services/",
      token,
      { method: "GET", cache: "no-store" },
    ),
    dashboardBackendRequest<DashboardServicesCategoriesPayload>(
      "/api/services/categories/",
      token,
      { method: "GET", cache: "no-store" },
    ),
  ]);
  const categoryNameById = new Map(
    (categoriesPayload.data ?? []).map((category) => [
      category.id,
      category.name,
    ]),
  );

  return (servicesPayload.data ?? []).map((service) => ({
    ...service,
    service_category_name:
      service.service_category_name ||
      (service.service_category !== undefined
        ? categoryNameById.get(service.service_category)
        : undefined),
  }));
}

export async function getDashboardServicesSettings(
  token: string,
): Promise<DashboardServicesSettingsSnapshot> {
  const [onboardingPayload, serviceOptions] = await Promise.all([
    dashboardBackendRequest<DashboardServicesOnboardingStatePayload>(
      "/api/caregivers/onboarding-state/",
      token,
      { method: "GET", cache: "no-store" },
    ),
    getDashboardServicesCatalog(token),
  ]);
  const onboarding = onboardingPayload.data?.onboarding ?? {};
  const completedSteps =
    onboarding.completed_steps ?? onboardingPayload.data?.saved_steps ?? [];
  const onboardingStatus = String(onboarding.status || "").trim().toLowerCase();
  const nextStep = String(onboarding.next_step || "").trim();
  const values = skillsAvailabilityValuesFromState(
    onboardingPayload.data?.values_by_step?.["skills-availability"],
  );
  const snapshot = {
    values: {
      ...initialSkillsAvailabilityValues,
      ...values,
    },
    serviceOptions,
    onboardingStatus,
    completedSteps,
    nextStep,
  };

  return {
    ...snapshot,
    canUpdate: isDashboardServicesUpdateAllowed(snapshot),
  };
}
