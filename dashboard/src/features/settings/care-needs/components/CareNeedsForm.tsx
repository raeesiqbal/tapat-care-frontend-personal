"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { toast } from "react-toastify";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import {
  ExperienceSelectionField,
  FormSection,
  InfoCallout,
  notifyFormErrors,
  RadioGroup,
  ReviewSection,
  SelectField as Select,
  TextField as Field,
} from "@tapat-care/ui-primitives";
import {
  careNeedsFormInfoCallout,
  careNeedsBooleanOptions,
  type CareNeedsEquipmentValues,
  type CareNeedsEquipmentOption,
  type CareNeedsSkillLevelOption,
  type CareNeedsChoiceOption,
  type ExperienceSkillLevel,
  hasFieldErrors,
  mergeCareNeedsFieldErrors,
  normalizeCareNeedsFormValues,
  validateCareNeedsForm,
  type CareNeedsBooleanValue,
  type CareNeedsConditionOption,
  type CareNeedsConditionStage,
  type CareNeedsConditionValues,
  type CareNeedsFamilyContactValues,
  type CareNeedsField,
  type CareNeedsFieldErrors,
  type CareNeedsFormValues,
  type CareNeedsOptions,
} from "@tapat-care/api-contracts";

import {
  updateDashboardCareNeedsSettings,
  type DashboardCareNeedsActionState,
} from "@/features/settings/care-needs/actions";

type CareNeedsSettingsFormProps = {
  initialValues: CareNeedsFormValues;
  options: CareNeedsOptions;
  canEdit: boolean;
};

const initialActionState: DashboardCareNeedsActionState = {
  status: "idle",
  message: "",
};

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

function formatDisplayValue(value: string | undefined) {
  return value?.trim() || "Not provided";
}

function formatBoolean(value: CareNeedsBooleanValue) {
  if (value === "true") {
    return "Yes";
  }

  if (value === "false") {
    return "No";
  }

  return "Not provided";
}

function getOptionLabel(
  options: readonly CareNeedsChoiceOption[],
  value: string,
  fallback = "Not provided",
) {
  return options.find((option) => option.value === value)?.label ?? fallback;
}

function conditionLabel(
  conditionId: number,
  conditionOptions: CareNeedsConditionOption[],
) {
  return (
    conditionOptions.find((condition) => condition.id === conditionId)?.name ??
    `Condition ${conditionId}`
  );
}

function formatEquipmentList(
  values: CareNeedsEquipmentValues[],
  equipmentOptions: CareNeedsEquipmentOption[],
  skillLevelOptions: CareNeedsSkillLevelOption[],
  emptyLabel = "Not provided",
) {
  if (values.length === 0) {
    return emptyLabel;
  }

  return values
    .map(
      (value) =>
        `${equipmentOptions.find((option) => option.id === value.equipment_id)?.name ?? String(value.equipment_id)}: ${
          skillLevelOptions.find((option) => option.value === value.skill_level)
            ?.label ?? value.skill_level
        }`,
    )
    .join(", ");
}

function formatContacts(contacts: CareNeedsFamilyContactValues[]) {
  const filledContacts = contacts.filter((contact) =>
    [contact.name, contact.phone, contact.email, contact.relationship].some(
      (value) => value.trim(),
    ),
  );

  if (filledContacts.length === 0) {
    return "Not provided";
  }

  return (
    <div className="space-y-4">
      {filledContacts.map((contact, index) => (
        <div key={contact.id ?? index} className="space-y-1">
          <p className="font-semibold text-gray-950">
            {formatDisplayValue(contact.name)}
            {contact.contact_priority ? (
              <span className="ml-2 text-sm font-medium text-gray-500">
                {contact.contact_priority === "primary"
                  ? "Primary"
                  : "Secondary"}
              </span>
            ) : null}
          </p>
          <p className="text-sm text-gray-600">
            {formatDisplayValue(contact.relationship)}
          </p>
          <p className="text-sm text-gray-600">
            {formatDisplayValue(contact.phone)}
          </p>
          <p className="text-sm text-gray-600">
            {formatDisplayValue(contact.email)}
          </p>
        </div>
      ))}
    </div>
  );
}

function formatConditions(
  conditions: CareNeedsConditionValues[],
  conditionOptions: CareNeedsConditionOption[],
  conditionStageOptions: CareNeedsChoiceOption[],
) {
  if (conditions.length === 0) {
    return "None selected";
  }

  return (
    <ul className="space-y-2">
      {conditions.map((condition) => (
        <li key={condition.condition_id}>
          <span className="font-medium">
            {conditionLabel(condition.condition_id, conditionOptions)}
          </span>
          <span className="text-gray-500">
            {" - "}
            {getOptionLabel(conditionStageOptions, condition.condition_stage)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CareNeedsSettingsReadOnly({
  canEdit,
  onEdit,
  values,
  options,
}: {
  canEdit: boolean;
  onEdit: () => void;
  values: CareNeedsFormValues;
  options: CareNeedsOptions;
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
      title="Care needs"
      action={editAction}
      rows={[
        {
          label: "Family contacts",
          value: formatContacts(values.family_contacts),
        },
        {
          label: "Lives alone",
          value: formatBoolean(values.lives_alone),
        },
        {
          label: "Mobility",
          value: getOptionLabel(options.mobility, values.mobility),
        },
        {
          label: "Can stand",
          value: getOptionLabel(options.standingAbility, values.can_stand),
        },
        {
          label: "Lifting required",
          value: formatBoolean(values.lifting_required),
        },
        {
          label: "Lifting level",
          value:
            values.lifting_required === "true"
              ? formatDisplayValue(values.lifting_level)
              : "Not needed",
        },
        {
          label: "Continence",
          value: getOptionLabel(options.continence, values.continence),
        },
        {
          label: "Medical equipment",
          value: formatEquipmentList(
            values.medical_equipment,
            options.equipment,
            options.skillLevels,
          ),
        },
        {
          label: "Conditions",
          value: formatConditions(
            values.conditions,
            options.conditions,
            options.conditionStages,
          ),
        },
        {
          label: "Medication reminders",
          value: formatBoolean(values.medication_reminder_needed),
        },
        {
          label: "Preferred caregiver gender",
          value: getOptionLabel(
            options.preferredCaregiverGender,
            values.preferred_caregiver_gender,
          ),
        },
        {
          label: "Driver needed",
          value: formatBoolean(values.driver_needed),
        },
        {
          label: "Transportation mode",
          value:
            values.driver_needed === "true"
              ? getOptionLabel(
                  options.transportationModes,
                  values.transportation_mode,
                )
              : "Not needed",
        },
        {
          label: "Pets at home",
          value: formatBoolean(values.pets_at_home),
        },
      ]}
    />
  );
}

export function CareNeedsSettingsForm({
  initialValues,
  options,
  canEdit,
}: CareNeedsSettingsFormProps) {
  const copy = careNeedsFormInfoCallout;
  const [state, formAction, isPending] = useActionState(
    updateDashboardCareNeedsSettings,
    initialActionState,
  );
  const lastToastSubmissionIdRef = useRef<number | undefined>(undefined);
  const persistedValues = normalizeCareNeedsFormValues(
    state.status === "success" && state.values ? state.values : initialValues,
    options,
  );
  const [values, setValues] = useState(() =>
    normalizeCareNeedsFormValues(initialValues, options),
  );
  const [isEditingRequested, setIsEditingRequested] = useState(false);
  const [editStartSubmissionId, setEditStartSubmissionId] = useState<
    number | undefined
  >(undefined);
  const [clientErrors, setClientErrors] = useState<CareNeedsFieldErrors>({});

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
  const fieldErrors = mergeCareNeedsFieldErrors(serverErrors, clientErrors);

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

  function clearErrors(fields: CareNeedsField[]) {
    setClientErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      fields.forEach((field) => {
        delete nextErrors[field];
      });
      return nextErrors;
    });
  }

  function updateValues(
    updater: (currentValues: CareNeedsFormValues) => CareNeedsFormValues,
    clearedFields: CareNeedsField[] = [],
  ) {
    setValues((currentValues) =>
      normalizeCareNeedsFormValues(updater(currentValues), options),
    );

    if (clearedFields.length > 0) {
      clearErrors(clearedFields);
    }
  }

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

  function handleEdit() {
    setValues(persistedValues);
    setClientErrors({});
    setEditStartSubmissionId(state.submissionId);
    setIsEditingRequested(true);
  }

  function handleCancel() {
    setValues(persistedValues);
    setClientErrors({});
    setIsEditingRequested(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedValues = normalizeCareNeedsFormValues(values, options);
    const nextErrors = validateCareNeedsForm(normalizedValues, options);
    setValues(normalizedValues);
    setClientErrors(nextErrors);

    if (hasFieldErrors(nextErrors)) {
      notifyFormErrors();
      return;
    }

    startTransition(() => {
      formAction(buildFormData(normalizedValues));
    });
  }

  if (!isEditing) {
    return (
      <CareNeedsSettingsReadOnly
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
                    options={options.contactPriorities}
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
              label="Can stand"
              name="can_stand"
              required
              value={values.can_stand}
              error={fieldErrors.can_stand}
              placeholder="Select standing ability"
              options={options.standingAbility}
              onChange={(event) =>
                updateField(
                  "can_stand",
                  event.target.value as CareNeedsFormValues["can_stand"],
                )
              }
            />
            <Select
              label="Mobility"
              name="mobility"
              required
              value={values.mobility}
              error={fieldErrors.mobility}
              placeholder="Select mobility"
              options={options.mobility}
              onChange={(event) =>
                updateField(
                  "mobility",
                  event.target.value as CareNeedsFormValues["mobility"],
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
              options={options.continence}
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
            items={options.equipment}
            values={values.medical_equipment as Array<
              Record<string, string | number | undefined>
            >}
            selectOptions={options.skillLevels}
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
              items={options.conditions}
              values={values.conditions as Array<
                Record<string, string | number | undefined>
              >}
              selectOptions={options.conditionStages}
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
              options={options.preferredCaregiverGender}
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
                options={options.transportationModes}
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
