"use client";

import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Plus, Trash2 } from "lucide-react";
import {
  ExperienceSelectionField,
  FormSection,
  InfoCallout,
  notifyFormErrors,
  RadioGroup,
  SelectField as Select,
  TextField as Field,
} from "@tapat-care/ui-primitives";
import {
  careNeedsFormInfoCallout,
  careNeedsBooleanOptions,
  careNeedsValuesFromApi,
  careNeedsValuesFromState,
  careNeedsValuesToState,
  getCareNeedsOptions,
  hasFieldErrors,
  hasMeaningfulCareNeedsValues,
  initialCareNeedsFormValues,
  mergeCareNeedsFieldErrors,
  normalizeCareNeedsFormValues,
  validateCareNeedsForm,
  type ApiEnvelope,
  type CareNeedsBackendData,
  type CareNeedsConditionStage,
  type CareNeedsConditionValues,
  type CareNeedsEquipmentValues,
  type CareNeedsFamilyContactValues,
  type CareNeedsField,
  type CareNeedsFieldErrors,
  type CareNeedsFormValues,
  type CareNeedsOptions,
  type ExperienceSkillLevel,
} from "@tapat-care/api-contracts";
import { saveCareseekerCareNeeds } from "../actions";
import { useOnboardingDraft } from "../draft/OnboardingDraftProvider";
import type { OnboardingActionState } from "../types";
import { OnboardingFooter } from "./OnboardingFooter";
import { OnboardingFormFrame } from "./OnboardingFormFrame";

type CareNeedsFormProps = {
  previousPath: string;
  nextPath: string;
};

const initialState: OnboardingActionState = {
  status: "idle",
  message: "",
};

const defaultCareNeedsFormValues: CareNeedsFormValues =
  normalizeCareNeedsFormValues(initialCareNeedsFormValues);

function buildFormData(values: CareNeedsFormValues) {
  const formData = new FormData();
  formData.append("values", JSON.stringify(values));
  return formData;
}

function createBlankContact(
  priority: CareNeedsFamilyContactValues["contact_priority"] = "",
): CareNeedsFamilyContactValues {
  return {
    name: "",
    phone: "",
    email: "",
    relationship: "",
    contact_priority: priority,
  };
}

export function CareNeedsForm({ previousPath, nextPath }: CareNeedsFormProps) {
  const copy = careNeedsFormInfoCallout;
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    saveCareseekerCareNeeds,
    initialState,
  );
  const {
    hydrated,
    valuesByStep,
    setStepValues,
    markStepSaved,
    hasSavedSnapshot,
    isStepDirty,
  } = useOnboardingDraft();
  const [values, setValues] = useState<CareNeedsFormValues>(
    defaultCareNeedsFormValues,
  );
  const [optionData, setOptionData] = useState<CareNeedsOptions>(() =>
    getCareNeedsOptions(),
  );
  const [clientErrors, setClientErrors] = useState<CareNeedsFieldErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const valuesByStepRef = useRef(valuesByStep);
  const hasLoadedCareNeedsRef = useRef(false);
  const hasHandledSuccessRef = useRef(false);
  const lastServerErrorMessageRef = useRef("");
  const stepValues = useMemo(
    () => careNeedsValuesToState(values, optionData),
    [optionData, values],
  );
  const fieldErrors = mergeCareNeedsFieldErrors(
    state.fieldErrors as CareNeedsFieldErrors | undefined,
    clientErrors,
  );
  const submitLabel =
    hasSavedSnapshot("care-needs") && !isStepDirty("care-needs", stepValues)
      ? "Continue"
      : "Save care needs";

  const clearErrors = useCallback((fields: CareNeedsField[]) => {
    setClientErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      fields.forEach((field) => {
        delete nextErrors[field];
      });
      return nextErrors;
    });
  }, []);

  const updateValues = useCallback(
    (
      updater: (currentValues: CareNeedsFormValues) => CareNeedsFormValues,
      clearedFields: CareNeedsField[] = [],
    ) => {
      setValues((currentValues) => {
        const nextValues = normalizeCareNeedsFormValues(
          updater(currentValues),
          optionData,
        );
        setStepValues(
          "care-needs",
          careNeedsValuesToState(nextValues, optionData),
        );
        return nextValues;
      });

      if (clearedFields.length > 0) {
        clearErrors(clearedFields);
      }
    },
    [clearErrors, optionData, setStepValues],
  );

  useEffect(() => {
    valuesByStepRef.current = valuesByStep;
  }, [valuesByStep]);

  const loadCareNeeds = useCallback(
    async (force = false) => {
      if (!hydrated || (hasLoadedCareNeedsRef.current && !force)) {
        return;
      }

      hasLoadedCareNeedsRef.current = true;
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetch("/api/onboarding/careseeker/care-needs", {
          method: "GET",
          cache: "no-store",
        });
        const payload =
          (await response.json()) as ApiEnvelope<CareNeedsBackendData>;

        if (!response.ok) {
          throw new Error(payload.message || "Unable to load care needs.");
        }

        const nextOptions = getCareNeedsOptions(payload.data);
        const backendValues = careNeedsValuesFromApi(payload.data);
        const draftValues = careNeedsValuesFromState(
          valuesByStepRef.current["care-needs"],
          nextOptions,
        );
        const nextValues = normalizeCareNeedsFormValues(
          hasMeaningfulCareNeedsValues(backendValues)
            ? backendValues
            : hasMeaningfulCareNeedsValues(draftValues)
              ? draftValues
              : defaultCareNeedsFormValues,
          nextOptions,
        );
        setOptionData(nextOptions);
        setValues(nextValues);
        setStepValues(
          "care-needs",
          careNeedsValuesToState(nextValues, nextOptions),
        );

        if (hasMeaningfulCareNeedsValues(backendValues)) {
          markStepSaved(
            "care-needs",
            careNeedsValuesToState(backendValues, nextOptions),
          );
        }
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Unable to load care needs.",
        );
        setOptionData(getCareNeedsOptions());
      } finally {
        setIsLoading(false);
      }
    },
    [hydrated, markStepSaved, setStepValues],
  );

  useEffect(() => {
    void loadCareNeeds();
  }, [loadCareNeeds]);

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

    const canonicalValues = normalizeCareNeedsFormValues(
      careNeedsValuesFromState(state.values, optionData),
      optionData,
    );
    setValues(canonicalValues);
    markStepSaved(
      "care-needs",
      careNeedsValuesToState(canonicalValues, optionData),
    );
    router.push(state.nextPath || nextPath);
  }, [
    markStepSaved,
    nextPath,
    optionData,
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

  function updateContact(
    index: number,
    field: keyof CareNeedsFamilyContactValues,
    value: string,
  ) {
    updateValues(
      (currentValues) => {
        const contacts = currentValues.family_contacts.map(
          (contact, itemIndex) => {
            if (itemIndex !== index) {
              return field === "contact_priority" && value === "primary"
                ? { ...contact, contact_priority: "secondary" as const }
                : contact;
            }

            return {
              ...contact,
              [field]: value,
            };
          },
        );

        return {
          ...currentValues,
          family_contacts: contacts,
        };
      },
      [
        `family_contacts.${index}.${field}` as CareNeedsField,
        "family_contacts",
      ],
    );
  }

  function addContact() {
    updateValues(
      (currentValues) => ({
        ...currentValues,
        family_contacts: [
          ...currentValues.family_contacts,
          createBlankContact(
            currentValues.family_contacts.some(
              (contact) => contact.contact_priority === "primary",
            )
              ? "secondary"
              : "primary",
          ),
        ],
      }),
      ["family_contacts"],
    );
  }

  function deleteContact(index: number) {
    updateValues(
      (currentValues) => {
        if (currentValues.family_contacts.length <= 1) {
          return {
            ...currentValues,
            family_contacts: [createBlankContact("primary")],
          };
        }

        const contacts = currentValues.family_contacts.filter(
          (_contact, itemIndex) => itemIndex !== index,
        );

        if (
          !contacts.some((contact) => contact.contact_priority === "primary")
        ) {
          contacts[0] = {
            ...contacts[0],
            contact_priority: "primary",
          };
        }

        return {
          ...currentValues,
          family_contacts: contacts,
        };
      },
      ["family_contacts"],
    );
  }

  function updateField<TField extends keyof CareNeedsFormValues>(
    field: TField,
    value: CareNeedsFormValues[TField],
  ) {
    updateValues(
      (currentValues) => {
        const nextValues = {
          ...currentValues,
          [field]: value,
        };

        if (field === "lifting_required" && value === "false") {
          nextValues.lifting_level = "";
        }

        if (field === "driver_needed" && value === "false") {
          nextValues.transportation_mode = "";
        }

        return nextValues;
      },
      [
        field as CareNeedsField,
        ...(field === "lifting_required"
          ? (["lifting_level"] as CareNeedsField[])
          : []),
        ...(field === "driver_needed"
          ? (["transportation_mode"] as CareNeedsField[])
          : []),
      ],
    );
  }

  function toggleMedicalEquipment(value: number) {
    updateValues(
      (currentValues) => {
        const selected = currentValues.medical_equipment.some(
          (item) => item.equipment_id === value,
        );
        const nextEquipment = selected
          ? currentValues.medical_equipment.filter(
              (item) => item.equipment_id !== value,
            )
          : [
              ...currentValues.medical_equipment,
              {
                equipment_id: value,
                skill_level: "" as CareNeedsEquipmentValues["skill_level"],
              },
            ];

        return {
          ...currentValues,
          medical_equipment: nextEquipment,
        };
      },
      ["medical_equipment"],
    );
  }

  function updateMedicalEquipmentSkill(
    equipmentId: number,
    skillLevel: ExperienceSkillLevel,
  ) {
    updateValues(
      (currentValues) => ({
        ...currentValues,
        medical_equipment: currentValues.medical_equipment.map((item) =>
          item.equipment_id === equipmentId
            ? { ...item, skill_level: skillLevel }
            : item,
        ),
      }),
      ["medical_equipment"],
    );
  }

  function toggleCondition(conditionId: number) {
    updateValues(
      (currentValues) => {
        const selected = currentValues.conditions.some(
          (condition) => condition.condition_id === conditionId,
        );
        const conditions = selected
          ? currentValues.conditions.filter(
              (condition) => condition.condition_id !== conditionId,
            )
          : [
              ...currentValues.conditions,
              {
                condition_id: conditionId,
                condition_stage: "" as const,
              },
            ];

        return {
          ...currentValues,
          conditions,
        };
      },
      ["conditions"],
    );
  }

  function updateConditionStage(
    conditionId: number,
    conditionStage: CareNeedsConditionStage,
  ) {
    updateValues(
      (currentValues) => ({
        ...currentValues,
        conditions: currentValues.conditions.map((condition) =>
          condition.condition_id === conditionId
            ? { ...condition, condition_stage: conditionStage }
            : condition,
        ),
      }),
      ["conditions"],
    );
  }

  function getConditionError(condition: CareNeedsConditionValues) {
    const index = values.conditions.findIndex(
      (item) => item.condition_id === condition.condition_id,
    );
    return fieldErrors[`conditions.${index}.condition_stage`];
  }

  function getMedicalEquipmentError(equipment: CareNeedsEquipmentValues) {
    const index = values.medical_equipment.findIndex(
      (item) => item.equipment_id === equipment.equipment_id,
    );
    return fieldErrors[`medical_equipment.${index}.skill_level`];
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedValues = normalizeCareNeedsFormValues(values, optionData);
    const nextErrors = validateCareNeedsForm(normalizedValues, optionData);
    setValues(normalizedValues);
    setClientErrors(nextErrors);

    if (hasFieldErrors(nextErrors)) {
      notifyFormErrors();
      return;
    }

    const normalizedStepValues = careNeedsValuesToState(
      normalizedValues,
      optionData,
    );
    if (
      hasSavedSnapshot("care-needs") &&
      !isStepDirty("care-needs", normalizedStepValues)
    ) {
      markStepSaved("care-needs", normalizedStepValues);
      router.push(nextPath);
      return;
    }

    startTransition(() => {
      formAction(buildFormData(normalizedValues));
    });
  }

  if (isLoading) {
    return (
      <OnboardingFormFrame>
        <div className="space-y-4">
          <div className="h-6 w-48 rounded-[8px] bg-gray-100" />
          <div className="h-12 rounded-[8px] bg-gray-100" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-24 rounded-[8px] bg-gray-100" />
            <div className="h-24 rounded-[8px] bg-gray-100" />
          </div>
        </div>
      </OnboardingFormFrame>
    );
  }

  if (loadError) {
    return (
      <OnboardingFormFrame>
        <InfoCallout>{loadError}</InfoCallout>
        <button
          type="button"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-[8px] bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          onClick={() => void loadCareNeeds(true)}
        >
          Try again
        </button>
      </OnboardingFormFrame>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <OnboardingFormFrame>
        <FormSection
          title="Family contacts"
        >
          <div className="space-y-5">
            {values.family_contacts.map((contact, index) => (
              <div
                key={contact.id ?? index}
                className="rounded-[8px] border border-gray-100 bg-gray-50/50 p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-[15px] font-semibold text-gray-950">
                    Contact {index + 1}
                  </h3>
                  {values.family_contacts.length > 1 ? (
                    <button
                      type="button"
                      className="inline-flex items-center rounded-[8px] border border-red-100 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      onClick={() => deleteContact(index)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  <Field
                    label="Name"
                    name={`family_contacts.${index}.name`}
                    required
                    value={contact.name}
                    error={fieldErrors[`family_contacts.${index}.name`]}
                    onChange={(event) =>
                      updateContact(index, "name", event.target.value)
                    }
                  />
                  <Field
                    label="Phone"
                    name={`family_contacts.${index}.phone`}
                    required
                    value={contact.phone}
                    error={fieldErrors[`family_contacts.${index}.phone`]}
                    placeholder="+1 555 123 4567"
                    onChange={(event) =>
                      updateContact(index, "phone", event.target.value)
                    }
                  />
                  <Field
                    label="Email"
                    name={`family_contacts.${index}.email`}
                    type="email"
                    required
                    value={contact.email}
                    error={fieldErrors[`family_contacts.${index}.email`]}
                    onChange={(event) =>
                      updateContact(index, "email", event.target.value)
                    }
                  />
                  <Field
                    label="Relationship"
                    name={`family_contacts.${index}.relationship`}
                    required
                    value={contact.relationship}
                    error={fieldErrors[`family_contacts.${index}.relationship`]}
                    placeholder="Daughter, spouse, neighbor"
                    onChange={(event) =>
                      updateContact(index, "relationship", event.target.value)
                    }
                  />
                  <Select
                    label="Priority"
                    name={`family_contacts.${index}.contact_priority`}
                    required
                    value={contact.contact_priority}
                    error={
                      fieldErrors[`family_contacts.${index}.contact_priority`]
                    }
                    placeholder="Select priority"
                    options={optionData.contactPriorities}
                    onChange={(event) =>
                      updateContact(
                        index,
                        "contact_priority",
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          {fieldErrors.family_contacts ? (
            <p className="mt-3 text-sm text-red-600">
              {fieldErrors.family_contacts}
            </p>
          ) : null}
          <button
            type="button"
            className="mt-5 inline-flex items-center rounded-[8px] border border-primary/30 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
            onClick={addContact}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add contact
          </button>
        </FormSection>

        <InfoCallout className="mt-5">
          {copy.familyContactsCalloutText}
        </InfoCallout>

        <FormSection
          title="Living situation and mobility"
          className="mt-10 border-t border-gray-100 pt-10"
        >
          <div className="mb-6">
            <RadioGroup
              label="Lives alone"
              name="lives_alone"
              required
              value={values.lives_alone}
              error={fieldErrors.lives_alone}
              options={careNeedsBooleanOptions}
              onChange={(value) =>
                updateField(
                  "lives_alone",
                  value as CareNeedsFormValues["lives_alone"],
                )
              }
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Select
              label="Mobility"
              name="mobility"
              required
              value={values.mobility}
              error={fieldErrors.mobility}
              placeholder="Select mobility"
              options={optionData.mobility}
              onChange={(event) =>
                updateField(
                  "mobility",
                  event.target.value as CareNeedsFormValues["mobility"],
                )
              }
            />
            <Select
              label="Can stand"
              name="can_stand"
              required
              value={values.can_stand}
              error={fieldErrors.can_stand}
              placeholder="Select standing ability"
              options={optionData.standingAbility}
              onChange={(event) =>
                updateField(
                  "can_stand",
                  event.target.value as CareNeedsFormValues["can_stand"],
                )
              }
            />
          </div>
        </FormSection>

        <InfoCallout className="mt-5">
          {copy.livingSituationCalloutText}
        </InfoCallout>

        <FormSection
          title="Lifting and continence"
          className="mt-10 border-t border-gray-100 pt-10"
        >
          <div className="grid gap-6 lg:grid-cols-1">
            <RadioGroup
              label="Lifting required"
              name="lifting_required"
              required
              value={values.lifting_required}
              error={fieldErrors.lifting_required}
              options={careNeedsBooleanOptions}
              onChange={(value) =>
                updateField(
                  "lifting_required",
                  value as CareNeedsFormValues["lifting_required"],
                )
              }
            />
            {values.lifting_required === "true" ? (
              <label className="block lg:col-span-2">
                <span className="mb-2 block text-sm font-medium text-heading text-gray-900">
                  Lifting level
                </span>
                <textarea
                  value={values.lifting_level}
                  rows={4}
                  className="w-full rounded-[8px] border border-gray-200 bg-white px-3 py-3 text-[16px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-violet-100"
                  placeholder="Light assistance only"
                  onChange={(event) =>
                    updateField("lifting_level", event.target.value)
                  }
                />
              </label>
            ) : null}
          </div>
          <div className="grid mt-6 lg:grid-cols-2">
            <Select
              label="Continence"
              name="continence"
              required
              value={values.continence}
              error={fieldErrors.continence}
              placeholder="Select continence"
              options={optionData.continence}
              onChange={(event) =>
                updateField(
                  "continence",
                  event.target.value as CareNeedsFormValues["continence"],
                )
              }
            />
          </div>
        </FormSection>

        <InfoCallout className="mt-5">
          {copy.liftingContinenceCalloutText}
        </InfoCallout>

        <FormSection
          title="Medical equipment and conditions"
          className="mt-10 border-t border-gray-100 pt-10"
        >
          <ExperienceSelectionField
            label="Medical equipment"
            items={optionData.equipment}
            values={values.medical_equipment as Array<
              Record<string, string | number | undefined>
            >}
            selectOptions={optionData.skillLevels}
            error={fieldErrors.medical_equipment}
            selectedIdKey="equipment_id"
            selectedValueKey="skill_level"
            getSelectError={(value) =>
              getMedicalEquipmentError(value as CareNeedsEquipmentValues)
            }
            onToggle={(equipmentId) => toggleMedicalEquipment(equipmentId)}
            onValueChange={(equipmentId, skillLevel) =>
              updateMedicalEquipmentSkill(
                equipmentId,
                skillLevel as ExperienceSkillLevel,
              )
            }
          />

          <div className="mt-8">
            <ExperienceSelectionField
              label="Conditions"
              items={optionData.conditions}
              values={values.conditions as Array<
                Record<string, string | number | undefined>
              >}
              selectOptions={optionData.conditionStages}
              error={fieldErrors.conditions}
              selectedIdKey="condition_id"
              selectedValueKey="condition_stage"
              selectLabelSuffix="stage"
              selectPlaceholder="Select stage"
              getSelectError={(value) =>
                getConditionError(value as CareNeedsConditionValues)
              }
              onToggle={(conditionId) => toggleCondition(conditionId)}
              onValueChange={(conditionId, conditionStage) =>
                updateConditionStage(
                  conditionId,
                  conditionStage as CareNeedsConditionStage,
                )
              }
            />
          </div>
        </FormSection>

        <InfoCallout className="mt-5">
          {copy.medicalEquipmentConditionsCalloutText}
        </InfoCallout>

        <FormSection
          title="Medication and caregiver preferences"
          className="mt-10 border-t border-gray-100 pt-10"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <RadioGroup
              label="Medication reminder needed"
              name="medication_reminder_needed"
              required
              value={values.medication_reminder_needed}
              error={fieldErrors.medication_reminder_needed}
              options={careNeedsBooleanOptions}
              onChange={(value) =>
                updateField(
                  "medication_reminder_needed",
                  value as CareNeedsFormValues["medication_reminder_needed"],
                )
              }
            />
            <Select
              label="Preferred caregiver gender"
              name="preferred_caregiver_gender"
              required
              value={values.preferred_caregiver_gender}
              error={fieldErrors.preferred_caregiver_gender}
              placeholder="Select preference"
              options={optionData.preferredCaregiverGender}
              onChange={(event) =>
                updateField(
                  "preferred_caregiver_gender",
                  event.target
                    .value as CareNeedsFormValues["preferred_caregiver_gender"],
                )
              }
            />
          </div>
        </FormSection>

        <InfoCallout className="mt-5">
          {copy.medicationPreferencesCalloutText}
        </InfoCallout>

        <FormSection
          title="Transportation and pets"
          className="mt-10 border-t border-gray-100 pt-10"
        >
          <div className="grid gap-6 lg:grid-cols-1">
            <RadioGroup
              label="Driver needed"
              name="driver_needed"
              required
              value={values.driver_needed}
              error={fieldErrors.driver_needed}
              options={careNeedsBooleanOptions}
              onChange={(value) =>
                updateField(
                  "driver_needed",
                  value as CareNeedsFormValues["driver_needed"],
                )
              }
            />
            {values.driver_needed === "true" ? (
              <Select
                label="Transportation mode"
                name="transportation_mode"
                required
                value={values.transportation_mode}
                error={fieldErrors.transportation_mode}
                placeholder="Select transportation mode"
                options={optionData.transportationModes}
                onChange={(event) =>
                  updateField(
                    "transportation_mode",
                    event.target
                      .value as CareNeedsFormValues["transportation_mode"],
                  )
                }
              />
            ) : null}
          </div>
          <div className="grid mt-6 lg:grid-cols-2">
            <RadioGroup
              label="Pets at home"
              name="pets_at_home"
              required
              value={values.pets_at_home}
              error={fieldErrors.pets_at_home}
              options={careNeedsBooleanOptions}
              onChange={(value) =>
                updateField(
                  "pets_at_home",
                  value as CareNeedsFormValues["pets_at_home"],
                )
              }
            />
          </div>
        </FormSection>

        <InfoCallout className="mt-5">
          {copy.transportationPetsCalloutText}
        </InfoCallout>
      </OnboardingFormFrame>
      <OnboardingFooter
        previousPath={previousPath}
        submitLabel={submitLabel}
        isPending={isPending}
      />
    </form>
  );
}
