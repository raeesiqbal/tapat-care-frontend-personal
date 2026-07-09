"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { SquarePen } from "lucide-react";
import {
  CheckboxCard,
  CheckboxGrid,
  ExperienceSelectionField,
  FormSection,
  InfoCallout,
  notifyFormErrors,
  RadioGroup,
  ReviewSection,
  SelectChip,
  SelectChipGroup,
  SelectField as Select,
} from "@tapat-care/ui-primitives";
import {
  formatQualificationsCertifications,
  formatQualificationsExperienceSummary,
  formatQualificationsPreferences,
  formatQualificationsTransportation,
  hasFieldErrors,
  mergeQualificationsExperienceFieldErrors,
  qualificationsExperienceValuesWithOptions,
  qualificationsBooleanOptions,
  validateQualificationsExperienceForm,
  type ExperienceSkillLevel,
  type QualificationsExperienceField,
  type QualificationsExperienceFieldErrors,
  type QualificationsExperienceOptions,
  type QualificationsExperienceValues,
} from "@tapat-care/api-contracts";

import {
  updateDashboardQualificationsExperienceSettings,
  type DashboardQualificationsExperienceSettingsActionState,
} from "@/features/settings/qualifications-experience/actions";

type QualificationsExperienceSettingsFormProps = {
  initialValues: QualificationsExperienceValues;
  options: QualificationsExperienceOptions;
  canEdit: boolean;
};

const initialActionState: DashboardQualificationsExperienceSettingsActionState =
  {
    status: "idle",
    message: "",
  };

function buildFormData(values: QualificationsExperienceValues) {
  const formData = new FormData();
  formData.append("values", JSON.stringify(values));
  return formData;
}

function QualificationsExperienceReadOnly({
  canEdit,
  onEdit,
  values,
  options,
}: {
  canEdit: boolean;
  onEdit: () => void;
  values: QualificationsExperienceValues;
  options: QualificationsExperienceOptions;
}) {
  const editAction = canEdit ? (
    <button
      type="button"
      className="inline-flex items-center rounded-[8px] border border-gray-200 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-primary/5"
      onClick={onEdit}
    >
      <SquarePen className="mr-2 h-4 w-4" />
      Edit
    </button>
  ) : null;

  return (
    <ReviewSection
      title="Qualifications and experience"
      action={editAction}
      rows={[
        {
          label: "Certifications",
          value: formatQualificationsCertifications(
            values.certifications,
            options.certifications,
          ),
        },
        {
          label: "Transportation",
          value: formatQualificationsTransportation(values, options),
        },
        {
          label: "Pets and smokers",
          value: formatQualificationsPreferences(values, options),
        },
        {
          label: "Condition experience",
          value: formatQualificationsExperienceSummary(
            values.conditionExperience,
            options.conditionExperienceItems,
            options.skillLevels,
          ),
        },
        {
          label: "Equipment experience",
          value: formatQualificationsExperienceSummary(
            values.equipmentExperience,
            options.equipmentExperienceItems,
            options.skillLevels,
          ),
        },
      ]}
    />
  );
}

export function QualificationsExperienceSettingsForm({
  initialValues,
  options,
  canEdit,
}: QualificationsExperienceSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateDashboardQualificationsExperienceSettings,
    initialActionState,
  );
  const lastToastSubmissionIdRef = useRef<number | undefined>(undefined);
  const persistedValues = qualificationsExperienceValuesWithOptions(
    state.status === "success" && state.values ? state.values : initialValues,
    options,
  );
  const [values, setValues] = useState(() =>
    qualificationsExperienceValuesWithOptions(initialValues, options),
  );
  const [isEditingRequested, setIsEditingRequested] = useState(false);
  const [editStartSubmissionId, setEditStartSubmissionId] = useState<
    number | undefined
  >(undefined);
  const [clientErrors, setClientErrors] =
    useState<QualificationsExperienceFieldErrors>({});

  const isEditing =
    isEditingRequested &&
    !(
      state.status === "success" &&
      state.submissionId !== undefined &&
      state.submissionId !== editStartSubmissionId
    );
  const hasSubmittedInEditSession =
    state.submissionId !== undefined &&
    state.submissionId !== editStartSubmissionId;
  const serverErrors =
    isEditing && state.status === "error" && hasSubmittedInEditSession
      ? state.fieldErrors
      : undefined;
  const fieldErrors = mergeQualificationsExperienceFieldErrors(
    serverErrors,
    clientErrors,
  );

  useEffect(() => {
    if (
      state.status === "idle" ||
      !state.message ||
      state.submissionId === undefined ||
      lastToastSubmissionIdRef.current === state.submissionId
    ) {
      return;
    }

    lastToastSubmissionIdRef.current = state.submissionId;

    if (state.status === "success") {
      toast.success(state.message);
      return;
    }

    toast.error(state.message);
  }, [state.message, state.status, state.submissionId]);

  function clearFieldError(field: QualificationsExperienceField) {
    setClientErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function updateField<TField extends keyof QualificationsExperienceValues>(
    field: TField,
    value: QualificationsExperienceValues[TField],
    errorField: QualificationsExperienceField,
  ) {
    setValues((currentValues) =>
      qualificationsExperienceValuesWithOptions(
        {
          ...currentValues,
          [field]: value,
          ...(field === "willingWithPets" && value === "false"
            ? { petTypesComfortable: [] }
            : {}),
        },
        options,
      ),
    );
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

  function handleEdit() {
    setValues(qualificationsExperienceValuesWithOptions(persistedValues, options));
    setClientErrors({});
    setEditStartSubmissionId(state.submissionId);
    setIsEditingRequested(true);
  }

  function handleCancel() {
    setValues(persistedValues);
    setClientErrors({});
    setIsEditingRequested(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateQualificationsExperienceForm(
      values,
      options,
    );
    setClientErrors(validationErrors);

    if (hasFieldErrors(validationErrors)) {
      notifyFormErrors();
      return;
    }

    startTransition(() => {
      formAction(buildFormData(values));
    });
  }

  if (!isEditing) {
    return (
      <QualificationsExperienceReadOnly
        canEdit={canEdit}
        onEdit={handleEdit}
        values={persistedValues}
        options={options}
      />
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="w-full rounded-[20px] border border-gray-100 bg-white p-6 shadow-card sm:p-8 lg:p-10">
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
        </FormSection>
        <InfoCallout className="mt-4">
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

        <InfoCallout className="mt-4">
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
          <div className="grid gap-6 mt-6 lg:grid-cols-2">
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

        <InfoCallout className="mt-4">
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

        <InfoCallout className="mt-4">
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

        <InfoCallout className="mt-4">
          Equipment experience helps families match with caregivers who are
          comfortable using the tools involved in daily care.
        </InfoCallout>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-[8px] border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-[8px] bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Update"}
          </button>
        </div>

        {state.message && hasSubmittedInEditSession ? (
          <p
            className={`mt-4 text-sm ${
              state.status === "success" ? "text-green-700" : "text-red-600"
            }`}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
