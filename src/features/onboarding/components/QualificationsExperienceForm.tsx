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
import {
  CheckboxCard,
  CheckboxGrid,
  ExperienceSelectionField,
  FormSection,
  InfoCallout,
  notifyFormErrors,
  RadioGroup,
  SelectChip,
  SelectChipGroup,
  SelectField as Select,
} from "@tapat-care/ui-primitives";
import {
  hasFieldErrors,
  hasMeaningfulQualificationsExperienceValues,
  initialQualificationsExperienceOptions,
  initialQualificationsExperienceValues,
  mergeQualificationsExperienceFieldErrors,
  normalizeQualificationsExperienceOptions,
  qualificationsBooleanOptions,
  qualificationsExperienceValuesFromApi,
  qualificationsExperienceValuesFromState,
  qualificationsExperienceValuesToState,
  qualificationsExperienceValuesWithOptions,
  validateQualificationsExperienceForm,
  type ApiEnvelope,
  type ExperienceSkillLevel,
  type QualificationsExperienceBackendData,
  type QualificationsExperienceField,
  type QualificationsExperienceFieldErrors,
  type QualificationsExperienceOptions,
  type QualificationsExperienceValues,
} from "@tapat-care/api-contracts";
import { OnboardingFooter } from "./OnboardingFooter";
import { OnboardingFormFrame } from "./OnboardingFormFrame";
import { saveProviderQualificationsExperience } from "../actions";
import { useOnboardingDraft } from "../draft/OnboardingDraftProvider";
import type { OnboardingActionState } from "../types";

type Props = {
  previousPath: string;
  nextPath: string;
};

const initialState: OnboardingActionState = {
  status: "idle",
  message: "",
};

function buildFormData(values: QualificationsExperienceValues) {
  const formData = new FormData();
  formData.append("values", JSON.stringify(values));
  return formData;
}

export function QualificationsExperienceForm({
  previousPath,
  nextPath,
}: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    saveProviderQualificationsExperience,
    initialState,
  );
  const {
    hydrated,
    valuesByStep,
    savedValuesByStep,
    setStepValues,
    markStepSaved,
    hasSavedSnapshot,
    isStepDirty,
    clearStep,
  } = useOnboardingDraft();
  const [options, setOptions] = useState<QualificationsExperienceOptions>(
    initialQualificationsExperienceOptions,
  );
  const [backendValues, setBackendValues] =
    useState<QualificationsExperienceValues>(
      initialQualificationsExperienceValues,
    );
  const [values, setValues] = useState<QualificationsExperienceValues>(
    initialQualificationsExperienceValues,
  );
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<QualificationsExperienceFieldErrors>({});
  const hasHandledSuccessRef = useRef(false);
  const lastServerErrorMessageRef = useRef("");

  const stepValues = qualificationsExperienceValuesToState(values);
  const fieldErrors = mergeQualificationsExperienceFieldErrors(
    state.fieldErrors as QualificationsExperienceFieldErrors | undefined,
    errors,
  );
  const submitLabel =
    hasSavedSnapshot("qualifications-experience") &&
    !isStepDirty("qualifications-experience", stepValues)
      ? "Continue"
      : "Save details";

  useEffect(() => {
    let isActive = true;

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
        const nextValues = qualificationsExperienceValuesFromApi(payload.data);

        if (!isActive) {
          return;
        }

        setOptions(nextOptions);
        setBackendValues(nextValues);
      } catch (error) {
        console.error("Error fetching qualifications and experience:", error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadQualifications();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || loading) {
      return;
    }

    const stateValues = qualificationsExperienceValuesFromState(
      state.values,
      options,
    );
    const draftValues = qualificationsExperienceValuesFromState(
      valuesByStep["qualifications-experience"],
      options,
    );
    const savedValues = qualificationsExperienceValuesFromState(
      savedValuesByStep["qualifications-experience"],
      options,
    );
    const candidate = hasMeaningfulQualificationsExperienceValues(stateValues)
      ? stateValues
      : hasMeaningfulQualificationsExperienceValues(draftValues)
        ? draftValues
        : hasMeaningfulQualificationsExperienceValues(savedValues)
          ? savedValues
          : backendValues;

    setValues(qualificationsExperienceValuesWithOptions(candidate, options));
  }, [
    backendValues,
    hydrated,
    loading,
    options,
    savedValuesByStep,
    state.values,
    valuesByStep,
  ]);

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

    const canonicalValues = qualificationsExperienceValuesWithOptions(
      qualificationsExperienceValuesFromState(state.values, options),
      options,
    );
    const nextStepValues =
      qualificationsExperienceValuesToState(canonicalValues);
    const wasAlreadySaved = hasSavedSnapshot("qualifications-experience");
    const hasStepChanged = isStepDirty(
      "qualifications-experience",
      nextStepValues,
    );

    setValues(canonicalValues);
    markStepSaved("qualifications-experience", nextStepValues);

    if (wasAlreadySaved && hasStepChanged) {
      clearStep("review");
      clearStep("screening-payment");
      clearStep("submitted");
    }

    router.push(state.nextPath || nextPath);
  }, [
    clearStep,
    hasSavedSnapshot,
    isStepDirty,
    markStepSaved,
    nextPath,
    options,
    router,
    state.message,
    state.nextPath,
    state.status,
    state.values,
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

  function clearFieldError(field: QualificationsExperienceField) {
    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function commitValues(nextValues: QualificationsExperienceValues) {
    const normalized = qualificationsExperienceValuesWithOptions(
      nextValues,
      options,
    );
    setValues(normalized);
    setStepValues(
      "qualifications-experience",
      qualificationsExperienceValuesToState(normalized),
    );
  }

  function updateField<TField extends keyof QualificationsExperienceValues>(
    field: TField,
    value: QualificationsExperienceValues[TField],
    errorField: QualificationsExperienceField,
  ) {
    const nextValues = {
      ...values,
      [field]: value,
      ...(field === "willingWithPets" && value === "false"
        ? { petTypesComfortable: [] }
        : {}),
    };
    commitValues(nextValues);
    clearFieldError(errorField);
  }

  function toggleCertification(certificationId: number) {
    const next = values.certifications.includes(certificationId)
      ? values.certifications.filter((id) => id !== certificationId)
      : [...values.certifications, certificationId];
    updateField("certifications", next, "certifications");
  }

  function togglePetType(
    petType: QualificationsExperienceValues["petTypesComfortable"][number],
  ) {
    const next = values.petTypesComfortable.includes(petType)
      ? values.petTypesComfortable.filter((item) => item !== petType)
      : [...values.petTypesComfortable, petType];
    updateField("petTypesComfortable", next, "petTypesComfortable");
  }

  function updateExperience(
    field: "conditionExperience" | "equipmentExperience",
    itemId: number,
    skillLevel: ExperienceSkillLevel,
  ) {
    const currentItems = values[field];
    const nextItems = currentItems.some((item) => item.item_id === itemId)
      ? currentItems.map((item) =>
          item.item_id === itemId ? { ...item, skill_level: skillLevel } : item,
        )
      : [...currentItems, { item_id: itemId, skill_level: skillLevel }];

    updateField(field, nextItems, field);
  }

  function toggleExperienceItem(
    field: "conditionExperience" | "equipmentExperience",
    itemId: number,
  ) {
    const currentItems = values[field];
    const nextItems = currentItems.some((item) => item.item_id === itemId)
      ? currentItems.filter((item) => item.item_id !== itemId)
      : [
          ...currentItems,
          {
            item_id: itemId,
            skill_level: options.skillLevels[0]?.value ?? "",
          },
        ];

    updateField(field, nextItems, field);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFieldErrors = validateQualificationsExperienceForm(
      values,
      options,
    );
    setErrors(nextFieldErrors);

    if (hasFieldErrors(nextFieldErrors)) {
      notifyFormErrors();
      return;
    }

    startTransition(() => {
      formAction(buildFormData(values));
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <OnboardingFormFrame>
        <FormSection title="Certifications">
          <SelectChipGroup error={fieldErrors.certifications}>
            {options.certifications.map((certification) => (
              <SelectChip
                key={certification.id}
                label={certification.name}
                active={values.certifications.includes(certification.id)}
                onClick={() => toggleCertification(certification.id)}
              />
            ))}
          </SelectChipGroup>
          {options.certifications.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">
              Certification options are unavailable right now.
            </p>
          ) : null}
        </FormSection>

        <InfoCallout className="mt-5">
          Certifications are self-reported unless Tapat Care verifies them
          separately.
        </InfoCallout>

        <FormSection
          title="Transportation"
          className="mt-10 border-t border-gray-100 pt-10"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <RadioGroup
              label="Driver's license"
              name="hasDriversLicense"
              required
              value={values.hasDriversLicense}
              error={fieldErrors.hasDriversLicense}
              options={qualificationsBooleanOptions}
              onChange={(value) =>
                updateField(
                  "hasDriversLicense",
                  value as QualificationsExperienceValues["hasDriversLicense"],
                  "hasDriversLicense",
                )
              }
            />
            <RadioGroup
              label="Has car"
              name="hasCar"
              required
              value={values.hasCar}
              error={fieldErrors.hasCar}
              options={qualificationsBooleanOptions}
              onChange={(value) =>
                updateField(
                  "hasCar",
                  value as QualificationsExperienceValues["hasCar"],
                  "hasCar",
                )
              }
            />
            <RadioGroup
              label="Insurance/registration"
              name="hasAutoInsuranceRegistration"
              required
              value={values.hasAutoInsuranceRegistration}
              error={fieldErrors.hasAutoInsuranceRegistration}
              options={qualificationsBooleanOptions}
              onChange={(value) =>
                updateField(
                  "hasAutoInsuranceRegistration",
                  value as QualificationsExperienceValues["hasAutoInsuranceRegistration"],
                  "hasAutoInsuranceRegistration",
                )
              }
            />
            <Select
              label="Transportation comfort"
              name="transportationComfort"
              required
              value={values.transportationComfort}
              error={fieldErrors.transportationComfort}
              placeholder="Select comfort level"
              options={options.transportationComfort}
              onChange={(event) =>
                updateField(
                  "transportationComfort",
                  event.target
                    .value as QualificationsExperienceValues["transportationComfort"],
                  "transportationComfort",
                )
              }
            />
          </div>
        </FormSection>

        <InfoCallout className="mt-5">
          Families use transportation details to understand if rides, errands,
          or non-driving care are the best match.
        </InfoCallout>

        <FormSection
          title="Home environment preferences"
          className="mt-10 border-t border-gray-100 pt-10"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <RadioGroup
              label="Willing to work with pets"
              name="willingWithPets"
              required
              value={values.willingWithPets}
              error={fieldErrors.willingWithPets}
              options={qualificationsBooleanOptions}
              onChange={(value) =>
                updateField(
                  "willingWithPets",
                  value as QualificationsExperienceValues["willingWithPets"],
                  "willingWithPets",
                )
              }
            />
          </div>
          {values.willingWithPets === "true" ? (
            <div className="mt-6">
              <CheckboxGrid
                label="Pet types"
                error={fieldErrors.petTypesComfortable}
              >
                {options.petTypes.map((petType) => (
                  <CheckboxCard
                    key={petType.value}
                    label={petType.label}
                    checked={values.petTypesComfortable.includes(petType.value)}
                    onChange={() => togglePetType(petType.value)}
                  />
                ))}
              </CheckboxGrid>
            </div>
          ) : null}
          <div className="grid gap-6 lg:grid-cols-2 mt-6">
            <RadioGroup
              label="Willing to work around smokers"
              name="willingWithSmokers"
              required
              value={values.willingWithSmokers}
              error={fieldErrors.willingWithSmokers}
              options={qualificationsBooleanOptions}
              onChange={(value) =>
                updateField(
                  "willingWithSmokers",
                  value as QualificationsExperienceValues["willingWithSmokers"],
                  "willingWithSmokers",
                )
              }
            />
          </div>
        </FormSection>

        <InfoCallout className="mt-5">
          These preferences help prevent mismatches before a family reaches out.
        </InfoCallout>

        <FormSection
          title="Condition experience"
          className="mt-10 border-t border-gray-100 pt-10"
        >
          <ExperienceSelectionField
            label="Conditions"
            items={options.conditionExperienceItems}
            values={values.conditionExperience}
            selectOptions={options.skillLevels}
            error={fieldErrors.conditionExperience}
            onToggle={(itemId) =>
              toggleExperienceItem("conditionExperience", itemId)
            }
            onValueChange={(itemId, skillLevel) =>
              updateExperience(
                "conditionExperience",
                itemId,
                skillLevel as ExperienceSkillLevel,
              )
            }
          />
        </FormSection>

        <InfoCallout className="mt-5">
          Condition experience helps families understand where you feel most
          confident and where extra support may be needed.
        </InfoCallout>

        <FormSection
          title="Equipment experience"
          className="mt-10 border-t border-gray-100 pt-10"
        >
          <ExperienceSelectionField
            label="Equipment"
            items={options.equipmentExperienceItems}
            values={values.equipmentExperience}
            selectOptions={options.skillLevels}
            error={fieldErrors.equipmentExperience}
            onToggle={(itemId) =>
              toggleExperienceItem("equipmentExperience", itemId)
            }
            onValueChange={(itemId, skillLevel) =>
              updateExperience(
                "equipmentExperience",
                itemId,
                skillLevel as ExperienceSkillLevel,
              )
            }
          />
        </FormSection>

        <InfoCallout className="mt-5">
          Equipment experience helps families match with caregivers who are
          comfortable using the tools involved in daily care.
        </InfoCallout>
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
