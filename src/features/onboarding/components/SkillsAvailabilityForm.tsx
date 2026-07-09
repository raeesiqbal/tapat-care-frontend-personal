"use client";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { DollarSign } from "lucide-react";
import {
  InfoCallout,
  notifyFormErrors,
  SelectChip,
  SelectChipGroup,
  TextField as Field,
} from "@tapat-care/ui-primitives";
import {
  hasFieldErrors,
  groupSkillsAvailabilityServicesByCategory,
  mergeSkillsAvailabilityFieldErrors,
  skillsAvailabilityFormInfoCallout,
  skillsAvailabilityOptions,
  skillsAvailabilityValuesFromState,
  skillsAvailabilityValuesToState,
  validateSkillsAvailabilityForm,
  type SkillsAvailabilityFieldErrors,
  type SkillsAvailabilityServiceOption,
  type SkillsAvailabilityValues,
} from "@tapat-care/api-contracts";
import { OnboardingFooter } from "./OnboardingFooter";
import { getServices } from "@/lib/api/services";
import { saveProviderSkillsAvailability } from "../actions";
import type { OnboardingActionState } from "../types";
import { useOnboardingDraft } from "../draft/OnboardingDraftProvider";
import { OnboardingFormFrame } from "./OnboardingFormFrame";

type Props = {
  previousPath: string;
  nextPath: string;
};
const initialState: OnboardingActionState = {
  status: "idle",
  message: "",
};

function buildFormData(values: SkillsAvailabilityValues) {
  const formData = new FormData();
  values.services.forEach((id) => formData.append("services", String(id)));
  formData.append("hourlyRate", values.hourlyRate);
  formData.append("yearsExperience", values.yearsExperience);
  values.availability.forEach((item) => formData.append("availability", item));
  formData.append("bio", values.bio);
  return formData;
}

export function SkillsAvailabilityForm({ previousPath, nextPath }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    saveProviderSkillsAvailability,
    initialState,
  );
  const {
    hydrated,
    valuesByStep,
    savedValuesByStep,
    setStepFieldValue,
    markStepSaved,
    hasSavedSnapshot,
    isStepDirty,
    clearStep,
  } = useOnboardingDraft();
  const [services, setServices] = useState<SkillsAvailabilityServiceOption[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [hourlyRate, setHourlyRate] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<SkillsAvailabilityFieldErrors>({});
  const hasHandledSuccessRef = useRef(false);
  const lastServerErrorMessageRef = useRef("");
  const fieldErrors = mergeSkillsAvailabilityFieldErrors(
    state.fieldErrors as SkillsAvailabilityFieldErrors | undefined,
    errors,
  );
  const stepValues = skillsAvailabilityValuesToState({
    services: selectedServices,
    hourlyRate,
    yearsExperience,
    availability,
    bio,
  });
  const copy = skillsAvailabilityFormInfoCallout;
  const serviceGroups = groupSkillsAvailabilityServicesByCategory(services);
  const submitLabel =
    hasSavedSnapshot("skills-availability") &&
    !isStepDirty("skills-availability", stepValues)
      ? "Continue"
      : "Save details";

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await getServices();
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const stateValues = skillsAvailabilityValuesFromState(state.values);
    const draftValues = skillsAvailabilityValuesFromState(
      valuesByStep["skills-availability"],
    );
    const savedValues = skillsAvailabilityValuesFromState(
      savedValuesByStep["skills-availability"],
    );

    setSelectedServices(
      stateValues.services.length > 0
        ? stateValues.services
        : draftValues.services.length > 0
          ? draftValues.services
          : savedValues.services,
    );
    setHourlyRate(
      stateValues.hourlyRate ||
        draftValues.hourlyRate ||
        savedValues.hourlyRate,
    );
    setYearsExperience(
      stateValues.yearsExperience ||
        draftValues.yearsExperience ||
        savedValues.yearsExperience,
    );
    setAvailability(
      stateValues.availability.length > 0
        ? stateValues.availability
        : draftValues.availability.length > 0
          ? draftValues.availability
          : savedValues.availability,
    );
    setBio(stateValues.bio || draftValues.bio || savedValues.bio);
  }, [hydrated, savedValuesByStep, state.values, valuesByStep]);

  useEffect(() => {
    if (state.status !== "success") {
      hasHandledSuccessRef.current = false;
      return;
    }

    if (hasHandledSuccessRef.current) {
      return;
    }

    hasHandledSuccessRef.current = true;
    if (state.message) {
      toast.success(state.message);
    }

    const nextStepValues = skillsAvailabilityValuesToState({
      services: selectedServices,
      hourlyRate,
      yearsExperience,
      availability,
      bio,
    });
    const wasAlreadySaved = hasSavedSnapshot("skills-availability");
    const hasStepChanged = isStepDirty("skills-availability", nextStepValues);

    markStepSaved("skills-availability", nextStepValues);

    if (wasAlreadySaved && hasStepChanged) {
      clearStep("qualifications-experience");
      clearStep("review");
      clearStep("screening-payment");
      clearStep("submitted");
    }

    router.push(state.nextPath || nextPath);
  }, [
    availability,
    clearStep,
    hasSavedSnapshot,
    bio,
    hourlyRate,
    yearsExperience,
    isStepDirty,
    markStepSaved,
    nextPath,
    router,
    selectedServices,
    state.nextPath,
    state.status,
    state.message,
  ]);

  useEffect(() => {
    if (state.status !== "error" || !state.message) {
      return;
    }

    if (lastServerErrorMessageRef.current === state.message) {
      return;
    }

    lastServerErrorMessageRef.current = state.message;
    toast.error(state.message);
  }, [state.message, state.status]);

  function toggleService(serviceId: number) {
    const next = selectedServices.includes(serviceId)
      ? selectedServices.filter((id) => id !== serviceId)
      : [...selectedServices, serviceId];
    setSelectedServices(next);
    setStepFieldValue("skills-availability", "services", JSON.stringify(next));
  }

  function toggleAvailability(item: string) {
    const next = availability.includes(item)
      ? availability.filter((value) => value !== item)
      : [...availability, item];
    setAvailability(next);
    setStepFieldValue(
      "skills-availability",
      "availability",
      JSON.stringify(next),
    );
  }

  function handleHourlyRateChange(value: string) {
    setHourlyRate(value);
    setStepFieldValue("skills-availability", "hourlyRate", value);
  }

  function handleYearsExperienceChange(value: string) {
    setYearsExperience(value);
    setStepFieldValue("skills-availability", "yearsExperience", value);
  }

  function handleBioChange(value: string) {
    setBio(value);
    setStepFieldValue("skills-availability", "bio", value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = {
      services: selectedServices,
      hourlyRate,
      yearsExperience,
      availability,
      bio,
    };
    const nextFieldErrors = validateSkillsAvailabilityForm(values);
    setErrors(nextFieldErrors);

    if (hasFieldErrors(nextFieldErrors)) {
      notifyFormErrors();
      return;
    }

    const nextStepValues = skillsAvailabilityValuesToState(values);
    if (
      hasSavedSnapshot("skills-availability") &&
      !isStepDirty("skills-availability", nextStepValues)
    ) {
      startTransition(() => {
        formAction(buildFormData(values));
      });
      return;
    }

    startTransition(() => {
      formAction(buildFormData(values));
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <OnboardingFormFrame>
        {/* SERVICES */}
        <div>
          <h2 className="text-[18px] font-semibold text-gray-950">
            Services you offer
          </h2>
        </div>
        <SelectChipGroup error={fieldErrors.services}>
          <div className="flex w-full flex-col gap-5">
            {serviceGroups.map((group) => (
              <section key={group.category}>
                <h3 className="text-sm font-semibold text-gray-800">
                  {group.category}
                </h3>
                <div className="mt-3 flex flex-wrap gap-3">
                  {group.services.map((service) => {
                    const active = selectedServices.includes(service.id);
                    return (
                      <SelectChip
                        key={service.id}
                        label={service.name}
                        active={active}
                        onClick={() => toggleService(service.id)}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </SelectChipGroup>
        <InfoCallout className="mt-4">{copy.servicesCalloutText}</InfoCallout>
        {/* RATE AND EXPERIENCE */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div>
            <Field
              label="Hourly rate"
              name="hourlyRate"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="25.00"
              value={hourlyRate}
              error={fieldErrors.hourlyRate}
              icon={<DollarSign className="h-4 w-4" />}
              iconClassName="left-3 text-gray-500"
              inputClassName="pl-9"
              onChange={(event) => handleHourlyRateChange(event.target.value)}
            />
            <InfoCallout className="mt-4">
              {copy.hourlyRateCalloutText}
            </InfoCallout>
          </div>
          <div>
            <Field
              label="Years of experience"
              name="yearsExperience"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="5"
              value={yearsExperience}
              error={fieldErrors.yearsExperience}
              onChange={(event) =>
                handleYearsExperienceChange(event.target.value)
              }
            />
            <InfoCallout className="mt-4">
              {copy.yearsExperienceCalloutText}
            </InfoCallout>
          </div>
        </div>
        {/* AVAILABILITY */}
        <div className="mt-10">
          <h2 className="text-[18px] font-semibold text-gray-950">
            Availability
          </h2>
        </div>
        <SelectChipGroup error={fieldErrors.availability}>
          {skillsAvailabilityOptions.map((item) => {
            const active = availability.includes(item);
            return (
              <SelectChip
                key={item}
                label={item}
                active={active}
                onClick={() => toggleAvailability(item)}
              />
            );
          })}
        </SelectChipGroup>
        <InfoCallout className="mt-4">
          {copy.availabilityCalloutText}
        </InfoCallout>
        {/* INTRO */}
        <div className="mt-10">
          <h2 className="text-[18px] font-semibold text-gray-950">
            A short intro clients will see
          </h2>
          <textarea
            value={bio}
            onChange={(e) => handleBioChange(e.target.value)}
            maxLength={400}
            rows={5}
            className="mt-4 w-full rounded-xl border border-gray-200 p-4 text-sm outline-none focus:border-primary"
            placeholder="Write a short intro..."
          />
          {fieldErrors.bio && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors.bio}</p>
          )}
          <div className="mt-2 text-right text-xs text-gray-500">
            {bio.length} / 400 characters
          </div>
          <InfoCallout className="mt-4">{copy.bioCalloutText}</InfoCallout>
        </div>
      </OnboardingFormFrame>
      <OnboardingFooter
        previousPath={previousPath}
        submitLabel={submitLabel}
        isPending={isPending}
        submitDisabled={loading}
      />
    </form>
  );
}
