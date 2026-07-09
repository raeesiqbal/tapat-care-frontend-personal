"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getServices } from "@/lib/api/services";
import { SquarePen } from "lucide-react";
import {
  formatPersonalDetailsBirthDate,
  formatPersonalDetailsDisplayValue,
  formatPersonalDetailsLanguages,
  formatQualificationsCertifications,
  formatQualificationsExperienceSummary,
  formatQualificationsPreferences,
  formatQualificationsTransportation,
  formatSkillsAvailabilityBio,
  formatSkillsAvailabilityHourlyRate,
  formatSkillsAvailabilityList,
  formatSkillsAvailabilityServices,
  formatSkillsAvailabilityYearsExperience,
  initialQualificationsExperienceOptions,
  normalizeQualificationsExperienceOptions,
  personalDetailsValuesFromState,
  qualificationsExperienceValuesFromApi,
  qualificationsExperienceValuesFromState,
  qualificationsExperienceValuesWithOptions,
  skillsAvailabilityValuesFromState,
  type ApiEnvelope,
  type QualificationsExperienceBackendData,
  type QualificationsExperienceOptions,
  type QualificationsExperienceValues,
  type SkillsAvailabilityServiceOption,
} from "@tapat-care/api-contracts";
import { ReviewSection } from "@tapat-care/ui-primitives";
import { useOnboardingDraft } from "../draft/OnboardingDraftProvider";
import { OnboardingFooter } from "./OnboardingFooter";
import { OnboardingFormFrame } from "./OnboardingFormFrame";

type Props = {
  previousPath: string;
  nextPath: string;
  personalDetailsPath: string;
  skillsAvailabilityPath: string;
  qualificationsExperiencePath: string;
};

export function ReviewForm({
  previousPath,
  nextPath,
  personalDetailsPath,
  skillsAvailabilityPath,
  qualificationsExperiencePath,
}: Props) {
  const router = useRouter();
  const { valuesByStep, savedValuesByStep } = useOnboardingDraft();
  const [servicesCatalog, setServicesCatalog] = useState<
    SkillsAvailabilityServiceOption[]
  >([]);
  const [qualificationsOptions, setQualificationsOptions] =
    useState<QualificationsExperienceOptions>(
      initialQualificationsExperienceOptions,
    );
  const [canonicalQualifications, setCanonicalQualifications] =
    useState<QualificationsExperienceValues | null>(null);

  useEffect(() => {
    async function loadServices() {
      try {
        const services = await getServices();
        setServicesCatalog(services);
      } catch {
        setServicesCatalog([]);
      }
    }

    loadServices();
  }, []);

  useEffect(() => {
    async function loadQualifications() {
      try {
        const response = await fetch(
          "/api/onboarding/provider/qualifications-experience/",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load qualifications and experience.");
        }

        const payload =
          (await response.json()) as ApiEnvelope<QualificationsExperienceBackendData>;
        const nextOptions = normalizeQualificationsExperienceOptions(
          payload.data,
        );
        setQualificationsOptions(nextOptions);
        setCanonicalQualifications(
          qualificationsExperienceValuesFromApi(payload.data),
        );
      } catch {
        setQualificationsOptions(initialQualificationsExperienceOptions);
        setCanonicalQualifications(null);
      }
    }

    loadQualifications();
  }, []);

  const personalState =
    savedValuesByStep["personal-details"] ?? valuesByStep["personal-details"];
  const skillsState =
    savedValuesByStep["skills-availability"] ??
    valuesByStep["skills-availability"];
  const qualificationsState =
    savedValuesByStep["qualifications-experience"] ??
    valuesByStep["qualifications-experience"];
  const personal = personalDetailsValuesFromState(personalState);
  const skills = skillsAvailabilityValuesFromState(skillsState);
  const qualifications = qualificationsExperienceValuesWithOptions(
    canonicalQualifications ??
      qualificationsExperienceValuesFromState(qualificationsState),
    qualificationsOptions,
  );

  const serviceNames = useMemo(() => {
    return formatSkillsAvailabilityServices(skills.services, servicesCatalog);
  }, [servicesCatalog, skills.services]);

  const personalRows = [
    { label: "Full name", value: formatPersonalDetailsDisplayValue(personal.fullName) },
    { label: "Pronouns", value: formatPersonalDetailsDisplayValue(personal.pronouns) },
    { label: "Date of birth", value: formatPersonalDetailsBirthDate(personal.birthDate) },
    {
      label: "Gender identity",
      value: formatPersonalDetailsDisplayValue(personal.genderIdentity),
    },
    { label: "Ethnicity", value: formatPersonalDetailsDisplayValue(personal.ethnicity) },
    { label: "Languages", value: formatPersonalDetailsLanguages(personal.languages) },
    { label: "Home address", value: formatPersonalDetailsDisplayValue(personal.line1) },
    {
      label: "Apartment, suite, unit",
      value: formatPersonalDetailsDisplayValue(personal.line2),
    },
    { label: "ZIP", value: formatPersonalDetailsDisplayValue(personal.zip) },
  ];

  const skillsRows = [
    { label: "Services offered", value: serviceNames },
    {
      label: "Hourly rate",
      value: formatSkillsAvailabilityHourlyRate(skills.hourlyRate),
    },
    {
      label: "Years of experience",
      value: formatSkillsAvailabilityYearsExperience(skills.yearsExperience),
    },
    {
      label: "Availability",
      value: formatSkillsAvailabilityList(skills.availability),
    },
    { label: "Bio", value: formatSkillsAvailabilityBio(skills.bio) },
  ];

  const qualificationsRows = [
    {
      label: "Certifications",
      value: formatQualificationsCertifications(
        qualifications.certifications,
        qualificationsOptions.certifications,
      ),
    },
    {
      label: "Transportation",
      value: formatQualificationsTransportation(
        qualifications,
        qualificationsOptions,
      ),
    },
    {
      label: "Pets and smokers",
      value: formatQualificationsPreferences(
        qualifications,
        qualificationsOptions,
      ),
    },
    {
      label: "Condition experience",
      value: formatQualificationsExperienceSummary(
        qualifications.conditionExperience,
        qualificationsOptions.conditionExperienceItems,
        qualificationsOptions.skillLevels,
      ),
    },
    {
      label: "Equipment experience",
      value: formatQualificationsExperienceSummary(
        qualifications.equipmentExperience,
        qualificationsOptions.equipmentExperienceItems,
        qualificationsOptions.skillLevels,
      ),
    },
  ];

  const personalEditAction = (
    <Link
      href={personalDetailsPath}
      className="inline-flex items-center rounded-[8px] border border-gray-200 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-primary/5"
    >
      <SquarePen className="mr-2 h-4 w-4" />
      Edit
    </Link>
  );
  const skillsEditAction = (
    <Link
      href={skillsAvailabilityPath}
      className="inline-flex items-center rounded-[8px] border border-gray-200 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-primary/5"
    >
      <SquarePen className="mr-2 h-4 w-4" />
      Edit
    </Link>
  );
  const qualificationsEditAction = (
    <Link
      href={qualificationsExperiencePath}
      className="inline-flex items-center rounded-[8px] border border-gray-200 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-primary/5"
    >
      <SquarePen className="mr-2 h-4 w-4" />
      Edit
    </Link>
  );

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        router.push(nextPath);
      }}
    >
      <OnboardingFormFrame withCard={false}>
        <div className="space-y-6">
          <ReviewSection
            title="Personal details"
            action={personalEditAction}
            rows={personalRows}
          />
          <ReviewSection
            title="Services and availability"
            action={skillsEditAction}
            rows={skillsRows}
          />
          <ReviewSection
            title="Qualifications and experience"
            action={qualificationsEditAction}
            rows={qualificationsRows}
          />
        </div>
      </OnboardingFormFrame>
      <OnboardingFooter previousPath={previousPath} submitLabel="Continue" />
    </form>
  );
}
