import type { FieldErrors } from "./form-validation";
import type { ExperienceSkillLevel } from "./qualifications-experience";

export const CARE_NEEDS_STEP_ID = "care-needs" as const;

export const careNeedsBooleanOptions = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
] as const;

export type CareNeedsBooleanValue = "" | "true" | "false";
export type CareNeedsContactPriority = string;
export type CareNeedsMobility = string;
export type CareNeedsStandingAbility = string;
export type CareNeedsContinence = string;
export type CareNeedsConditionStage = string;
export type CareNeedsPreferredCaregiverGender = string;
export type CareNeedsTransportationMode = string;

export type CareNeedsField =
  | "family_contacts"
  | "lives_alone"
  | "mobility"
  | "can_stand"
  | "lifting_required"
  | "lifting_level"
  | "continence"
  | "medical_equipment"
  | "conditions"
  | "medication_reminder_needed"
  | "preferred_caregiver_gender"
  | "driver_needed"
  | "transportation_mode"
  | "pets_at_home"
  | `family_contacts.${number}.name`
  | `family_contacts.${number}.phone`
  | `family_contacts.${number}.email`
  | `family_contacts.${number}.relationship`
  | `family_contacts.${number}.contact_priority`
  | `medical_equipment.${number}.skill_level`
  | `conditions.${number}.condition_stage`;

export type CareNeedsFieldErrors = FieldErrors<CareNeedsField>;

export type CareNeedsFamilyContactValues = {
  id?: number;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  contact_priority: CareNeedsContactPriority | "";
};

export type CareNeedsConditionValues = {
  id?: number;
  condition_id: number;
  condition_stage: CareNeedsConditionStage | "";
};

export type CareNeedsEquipmentValues = {
  id?: number;
  equipment_id: number;
  skill_level: ExperienceSkillLevel | "";
};

export type CareNeedsFormValues = {
  family_contacts: CareNeedsFamilyContactValues[];
  lives_alone: CareNeedsBooleanValue;
  mobility: CareNeedsMobility | "";
  can_stand: CareNeedsStandingAbility | "";
  lifting_required: CareNeedsBooleanValue;
  lifting_level: string;
  continence: CareNeedsContinence | "";
  medical_equipment: CareNeedsEquipmentValues[];
  conditions: CareNeedsConditionValues[];
  medication_reminder_needed: CareNeedsBooleanValue;
  preferred_caregiver_gender: CareNeedsPreferredCaregiverGender | "";
  driver_needed: CareNeedsBooleanValue;
  transportation_mode: CareNeedsTransportationMode | "";
  pets_at_home: CareNeedsBooleanValue;
};

export type CareNeedsConditionOption = {
  id: number;
  name: string;
  slug?: string;
};

export type CareNeedsEquipmentOption = {
  id: number;
  name: string;
  slug?: string;
};

export type CareNeedsChoiceOption<TValue extends string = string> = {
  value: TValue;
  label: string;
};

export type CareNeedsSkillLevelOption = {
  value: ExperienceSkillLevel;
  label: string;
};

export type CareNeedsBackendOptions = {
  mobility?: Array<{ value: string; label: string }>;
  standing_ability?: Array<{ value: string; label: string }>;
  continence?: Array<{ value: string; label: string }>;
  condition_stages?: Array<{ value: string; label: string }>;
  preferred_caregiver_gender?: Array<{ value: string; label: string }>;
  transportation_modes?: Array<{ value: string; label: string }>;
  contact_priorities?: Array<{ value: string; label: string }>;
  conditions?: CareNeedsConditionOption[];
  equipment?: CareNeedsEquipmentOption[];
  skill_levels?: Array<{ value: string; label: string }>;
};

export type CareNeedsOptions = {
  mobility: CareNeedsChoiceOption<CareNeedsMobility>[];
  standingAbility: CareNeedsChoiceOption<CareNeedsStandingAbility>[];
  continence: CareNeedsChoiceOption<CareNeedsContinence>[];
  conditionStages: CareNeedsChoiceOption<CareNeedsConditionStage>[];
  preferredCaregiverGender: CareNeedsChoiceOption<CareNeedsPreferredCaregiverGender>[];
  transportationModes: CareNeedsChoiceOption<CareNeedsTransportationMode>[];
  contactPriorities: CareNeedsChoiceOption<CareNeedsContactPriority>[];
  conditions: CareNeedsConditionOption[];
  equipment: CareNeedsEquipmentOption[];
  skillLevels: CareNeedsSkillLevelOption[];
};

export type CareNeedsFormInfoCallout = {
  familyContactsCalloutText: string;
  livingSituationCalloutText: string;
  liftingContinenceCalloutText: string;
  medicalEquipmentConditionsCalloutText: string;
  medicationPreferencesCalloutText: string;
  transportationPetsCalloutText: string;
};

export type CareNeedsBackendFamilyContact = {
  id?: number;
  name?: string;
  phone?: string;
  email?: string;
  relationship?: string;
  contact_priority?: string;
};

export type CareNeedsBackendCondition = {
  id?: number;
  condition_id?: number;
  condition_name?: string;
  condition_slug?: string;
  condition_stage?: string;
};

export type CareNeedsBackendEquipment = {
  id?: number;
  equipment_id?: number;
  equipment_name?: string;
  equipment_slug?: string;
  skill_level?: string;
};

export type CareNeedsBackendCareFields = {
  lives_alone?: boolean | null;
  mobility?: string | null;
  can_stand?: string | null;
  lifting_required?: boolean | null;
  lifting_level?: string | null;
  continence?: string | null;
  medication_reminder_needed?: boolean | null;
  preferred_caregiver_gender?: string | null;
  driver_needed?: boolean | null;
  transportation_mode?: string | null;
  pets_at_home?: boolean | null;
};

export type CareNeedsBackendData = {
  family_contacts?: CareNeedsBackendFamilyContact[];
  care_needs?: CareNeedsBackendCareFields;
  conditions?: CareNeedsBackendCondition[];
  equipment?: CareNeedsBackendEquipment[];
  options?: CareNeedsBackendOptions;
  condition_options?: CareNeedsConditionOption[];
  equipment_options?: CareNeedsEquipmentOption[];
  skill_levels?: Array<{ value: string; label: string }>;
};

export type CareNeedsUpdatePayload = {
  family_contacts: Array<{
    id?: number;
    name: string;
    phone: string;
    email: string;
    relationship: string;
    contact_priority: CareNeedsContactPriority;
  }>;
  care_needs: {
    lives_alone: boolean;
    mobility: CareNeedsMobility;
    can_stand: CareNeedsStandingAbility;
    lifting_required: boolean;
    lifting_level: string | null;
    continence: CareNeedsContinence;
    medication_reminder_needed: boolean;
    preferred_caregiver_gender: CareNeedsPreferredCaregiverGender;
    driver_needed: boolean;
    transportation_mode: CareNeedsTransportationMode | null;
    pets_at_home: boolean;
  };
  equipment: Array<{
    id?: number;
    equipment_id: number;
    skill_level: ExperienceSkillLevel;
  }>;
  conditions: Array<{
    id?: number;
    condition_id: number;
    condition_stage: CareNeedsConditionStage;
  }>;
};

type CareNeedsFormInput = Partial<{
  [K in keyof CareNeedsFormValues]: unknown;
}>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emptyCareNeedsFamilyContact: CareNeedsFamilyContactValues = {
  name: "",
  phone: "",
  email: "",
  relationship: "",
  contact_priority: "",
};

export const initialCareNeedsFormValues: CareNeedsFormValues = {
  family_contacts: [{ ...emptyCareNeedsFamilyContact }],
  lives_alone: "",
  mobility: "",
  can_stand: "",
  lifting_required: "",
  lifting_level: "",
  continence: "",
  medical_equipment: [],
  conditions: [],
  medication_reminder_needed: "",
  preferred_caregiver_gender: "",
  driver_needed: "",
  transportation_mode: "",
  pets_at_home: "",
};

export const careNeedsFormInfoCallout: CareNeedsFormInfoCallout = {
  familyContactsCalloutText:
    "Family contacts help us know who to reach if care plans change, scheduling issues come up, or we need support coordinating care.",
  livingSituationCalloutText:
    "Living situation, mobility, and standing ability help us match caregivers who can safely support movement and day-to-day routines at home.",
  liftingContinenceCalloutText:
    "Lifting and continence details help us understand the level of physical assistance a caregiver may need to provide during each visit.",
  medicalEquipmentConditionsCalloutText:
    "Medical equipment and condition details help us plan for the right caregiving experience, preparation, and comfort support.",
  medicationPreferencesCalloutText:
    "Medication reminders and caregiver preferences help us match care that feels consistent, respectful, and easier to follow.",
  transportationPetsCalloutText:
    "Transportation and pet details help caregivers prepare for driving needs, errands, and the home environment before visits begin.",
};

function parseStoredArray<T>(value: string | undefined): T[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function optionalNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isSafeInteger(numberValue) && numberValue > 0
    ? numberValue
    : undefined;
}

function normalizeBooleanValue(value: unknown): CareNeedsBooleanValue {
  if (value === true || value === "true") {
    return "true";
  }

  if (value === false || value === "false") {
    return "false";
  }

  return "";
}

function booleanFromValue(value: CareNeedsBooleanValue) {
  return value === "true";
}

function normalizeOption(value: unknown) {
  return String(value ?? "").trim();
}

function optionValues(
  options: readonly CareNeedsChoiceOption[] | undefined,
) {
  return new Set((options ?? []).map((option) => option.value));
}

function normalizeOptionFromBackend<TValue extends string>(
  value: unknown,
  options: readonly CareNeedsChoiceOption<TValue>[] | undefined,
  enforceBackendOptions: boolean,
): TValue | "" {
  const normalized = normalizeOption(value) as TValue;
  if (!normalized) {
    return "";
  }

  if (!enforceBackendOptions) {
    return normalized;
  }

  return optionValues(options).has(normalized) ? normalized : "";
}

function normalizeFamilyContacts(
  contacts: unknown,
  options?: CareNeedsOptions,
): CareNeedsFamilyContactValues[] {
  const enforceOptions = Boolean(options);
  const input = Array.isArray(contacts) ? contacts : [];
  const normalized = input.map((contact) => {
    const record =
      contact && typeof contact === "object"
        ? (contact as Record<string, unknown>)
        : {};
    const id = optionalNumber(record.id);

    return {
      ...(id ? { id } : {}),
      name: String(record.name ?? "").trim(),
      phone: String(record.phone ?? "").trim(),
      email: String(record.email ?? "").trim(),
      relationship: String(record.relationship ?? "").trim(),
      contact_priority: normalizeOptionFromBackend(
        record.contact_priority,
        options?.contactPriorities,
        enforceOptions,
      ),
    };
  });

  return normalized.length > 0 ? normalized : [{ ...emptyCareNeedsFamilyContact }];
}

function normalizeMedicalEquipment(
  values: unknown,
  options?: CareNeedsOptions,
): CareNeedsEquipmentValues[] {
  if (!Array.isArray(values)) {
    return [];
  }

  const enforceOptions = Boolean(options);
  const equipmentIds = new Set((options?.equipment ?? []).map((item) => item.id));

  return values.reduce<CareNeedsEquipmentValues[]>((result, item) => {
    const record =
      item && typeof item === "object"
        ? (item as Record<string, unknown>)
        : {};
    const equipmentId =
      optionalNumber(record.equipment_id) ??
      optionalNumber(record.id) ??
      (typeof item === "number" ? optionalNumber(item) : undefined);

    if (
      !equipmentId ||
      (enforceOptions && !equipmentIds.has(equipmentId)) ||
      result.some((equipment) => equipment.equipment_id === equipmentId)
    ) {
      return result;
    }

    const id = optionalNumber(record.id);
    const skillLevel = String(record.skill_level ?? "").trim();

    return [
      ...result,
      {
        ...(id ? { id } : {}),
        equipment_id: equipmentId,
        skill_level: normalizeOptionFromBackend(
          skillLevel,
          options?.skillLevels,
          enforceOptions,
        ),
      },
    ];
  }, []);
}

function normalizeConditions(
  conditions: unknown,
  options?: CareNeedsOptions,
): CareNeedsConditionValues[] {
  if (!Array.isArray(conditions)) {
    return [];
  }

  const enforceOptions = Boolean(options);
  const conditionIds = new Set((options?.conditions ?? []).map((item) => item.id));
  const seen = new Set<number>();

  return conditions.reduce<CareNeedsConditionValues[]>((result, condition) => {
    const record =
      condition && typeof condition === "object"
        ? (condition as Record<string, unknown>)
        : {};
    const conditionId = optionalNumber(record.condition_id);

    if (
      !conditionId ||
      (enforceOptions && !conditionIds.has(conditionId)) ||
      seen.has(conditionId)
    ) {
      return result;
    }

    seen.add(conditionId);
    const id = optionalNumber(record.id);

    return [
      ...result,
      {
        ...(id ? { id } : {}),
        condition_id: conditionId,
        condition_stage: normalizeOptionFromBackend(
          record.condition_stage,
          options?.conditionStages,
          enforceOptions,
        ),
      },
    ];
  }, []);
}

export function normalizeCareNeedsFormValues(
  values: CareNeedsFormInput | undefined,
  options?: CareNeedsOptions,
): CareNeedsFormValues {
  const enforceOptions = Boolean(options);

  return {
    family_contacts: normalizeFamilyContacts(values?.family_contacts, options),
    lives_alone: normalizeBooleanValue(values?.lives_alone),
    mobility: normalizeOptionFromBackend(
      values?.mobility,
      options?.mobility,
      enforceOptions,
    ),
    can_stand: normalizeOptionFromBackend(
      values?.can_stand,
      options?.standingAbility,
      enforceOptions,
    ),
    lifting_required: normalizeBooleanValue(values?.lifting_required),
    lifting_level:
      normalizeBooleanValue(values?.lifting_required) === "true"
        ? String(values?.lifting_level ?? "").trim()
        : "",
    continence: normalizeOptionFromBackend(
      values?.continence,
      options?.continence,
      enforceOptions,
    ),
    medical_equipment: normalizeMedicalEquipment(
      values?.medical_equipment,
      options,
    ),
    conditions: normalizeConditions(values?.conditions, options),
    medication_reminder_needed: normalizeBooleanValue(
      values?.medication_reminder_needed,
    ),
    preferred_caregiver_gender: normalizeOptionFromBackend(
      values?.preferred_caregiver_gender,
      options?.preferredCaregiverGender,
      enforceOptions,
    ),
    driver_needed: normalizeBooleanValue(values?.driver_needed),
    transportation_mode:
      normalizeBooleanValue(values?.driver_needed) === "true"
        ? normalizeOptionFromBackend(
            values?.transportation_mode,
            options?.transportationModes,
            enforceOptions,
          )
        : "",
    pets_at_home: normalizeBooleanValue(values?.pets_at_home),
  };
}

export function careNeedsValuesFromApi(
  data?: CareNeedsBackendData | null,
): CareNeedsFormValues {
  const careFields = data?.care_needs ?? {};
  const options = getCareNeedsOptions(data);

  return normalizeCareNeedsFormValues({
    family_contacts: data?.family_contacts ?? [],
    lives_alone: normalizeBooleanValue(careFields.lives_alone),
    mobility: careFields.mobility ?? "",
    can_stand: careFields.can_stand ?? "",
    lifting_required: normalizeBooleanValue(careFields.lifting_required),
    lifting_level: careFields.lifting_level ?? "",
    continence: careFields.continence ?? "",
    medical_equipment: data?.equipment ?? [],
    conditions: data?.conditions ?? [],
    medication_reminder_needed: normalizeBooleanValue(
      careFields.medication_reminder_needed,
    ),
    preferred_caregiver_gender: careFields.preferred_caregiver_gender ?? "",
    driver_needed: normalizeBooleanValue(careFields.driver_needed),
    transportation_mode: careFields.transportation_mode ?? "",
    pets_at_home: normalizeBooleanValue(careFields.pets_at_home),
  }, options);
}

export function careNeedsValuesFromState(
  values?: Record<string, string>,
  options?: CareNeedsOptions,
): CareNeedsFormValues {
  return normalizeCareNeedsFormValues({
    family_contacts: parseStoredArray(values?.familyContacts),
    lives_alone: values?.livesAlone,
    mobility: values?.mobility,
    can_stand: values?.canStand,
    lifting_required: values?.liftingRequired,
    lifting_level: values?.liftingLevel,
    continence: values?.continence,
    medical_equipment: parseStoredArray(values?.medicalEquipment),
    conditions: parseStoredArray(values?.conditions),
    medication_reminder_needed: values?.medicationReminderNeeded,
    preferred_caregiver_gender: values?.preferredCaregiverGender,
    driver_needed: values?.driverNeeded,
    transportation_mode: values?.transportationMode,
    pets_at_home: values?.petsAtHome,
  }, options);
}

export function careNeedsValuesToState(
  values: CareNeedsFormValues,
  options?: CareNeedsOptions,
): Record<string, string> {
  const normalized = normalizeCareNeedsFormValues(values, options);

  return {
    familyContacts: JSON.stringify(normalized.family_contacts),
    livesAlone: normalized.lives_alone,
    mobility: normalized.mobility,
    canStand: normalized.can_stand,
    liftingRequired: normalized.lifting_required,
    liftingLevel: normalized.lifting_level,
    continence: normalized.continence,
    medicalEquipment: JSON.stringify(normalized.medical_equipment),
    conditions: JSON.stringify(normalized.conditions),
    medicationReminderNeeded: normalized.medication_reminder_needed,
    preferredCaregiverGender: normalized.preferred_caregiver_gender,
    driverNeeded: normalized.driver_needed,
    transportationMode: normalized.transportation_mode,
    petsAtHome: normalized.pets_at_home,
  };
}

export function careNeedsValuesFromFormData(
  formData: FormData,
  options?: CareNeedsOptions,
): CareNeedsFormValues {
  const rawValues = String(formData.get("values") || "");

  try {
    const parsed = JSON.parse(rawValues) as Partial<CareNeedsFormValues>;
    return normalizeCareNeedsFormValues(parsed, options);
  } catch {
    return initialCareNeedsFormValues;
  }
}

function normalizeChoiceOptions<TValue extends string>(
  options: Array<{ value: string; label: string }> | undefined,
): CareNeedsChoiceOption<TValue>[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.reduce<CareNeedsChoiceOption<TValue>[]>((result, option) => {
    const value = String(option?.value ?? "").trim() as TValue;
    const label = String(option?.label ?? "").trim();

    if (
      !value ||
      !label ||
      result.some((item) => item.value === value)
    ) {
      return result;
    }

    return [...result, { value, label }];
  }, []);
}

export function getCareNeedsConditionOptions(
  options?: CareNeedsConditionOption[],
) {
  return options && options.length > 0 ? options : [];
}

export function getCareNeedsEquipmentOptions(
  options?: CareNeedsEquipmentOption[],
) {
  return options && options.length > 0 ? options : [];
}

export function getCareNeedsSkillLevelOptions(
  options?: Array<{ value: string; label: string }>,
): CareNeedsSkillLevelOption[] {
  return normalizeChoiceOptions(options);
}

export function getCareNeedsOptions(
  data?: CareNeedsBackendData | null,
): CareNeedsOptions {
  const options = data?.options ?? {};

  return {
    mobility: normalizeChoiceOptions(options.mobility),
    standingAbility: normalizeChoiceOptions(options.standing_ability),
    continence: normalizeChoiceOptions(options.continence),
    conditionStages: normalizeChoiceOptions(options.condition_stages),
    preferredCaregiverGender: normalizeChoiceOptions(
      options.preferred_caregiver_gender,
    ),
    transportationModes: normalizeChoiceOptions(options.transportation_modes),
    contactPriorities: normalizeChoiceOptions(options.contact_priorities),
    conditions: getCareNeedsConditionOptions(
      options.conditions ?? data?.condition_options,
    ),
    equipment: getCareNeedsEquipmentOptions(
      options.equipment ?? data?.equipment_options,
    ),
    skillLevels: getCareNeedsSkillLevelOptions(
      options.skill_levels ?? data?.skill_levels,
    ),
  };
}

export function hasMeaningfulCareNeedsValues(values: CareNeedsFormValues) {
  const normalized = normalizeCareNeedsFormValues(values);
  const hasContactValues = normalized.family_contacts.some((contact) =>
    [contact.name, contact.phone, contact.email, contact.relationship].some(
      (value) => value.trim(),
    ),
  );

  return (
    hasContactValues ||
    Boolean(normalized.lives_alone) ||
    Boolean(normalized.mobility) ||
    Boolean(normalized.can_stand) ||
    Boolean(normalized.lifting_required) ||
    Boolean(normalized.lifting_level) ||
    Boolean(normalized.continence) ||
    normalized.medical_equipment.length > 0 ||
    normalized.conditions.length > 0 ||
    Boolean(normalized.medication_reminder_needed) ||
    Boolean(normalized.preferred_caregiver_gender) ||
    Boolean(normalized.driver_needed) ||
    Boolean(normalized.transportation_mode) ||
    Boolean(normalized.pets_at_home)
  );
}

export function validateCareNeedsForm(
  values: CareNeedsFormValues,
  options?: CareNeedsOptions,
): CareNeedsFieldErrors {
  const normalized = normalizeCareNeedsFormValues(values, options);
  const errors: CareNeedsFieldErrors = {};

  if (normalized.family_contacts.length === 0) {
    errors.family_contacts = "Add at least one family contact.";
  }

  normalized.family_contacts.forEach((contact, index) => {
    if (!contact.name) {
      errors[`family_contacts.${index}.name`] = "Name is required.";
    }

    if (!contact.phone) {
      errors[`family_contacts.${index}.phone`] = "Phone is required.";
    }

    if (!contact.email) {
      errors[`family_contacts.${index}.email`] = "Email is required.";
    } else if (!emailPattern.test(contact.email)) {
      errors[`family_contacts.${index}.email`] = "Enter a valid email address.";
    }

    if (!contact.relationship) {
      errors[`family_contacts.${index}.relationship`] =
        "Relationship is required.";
    }

    if (!contact.contact_priority) {
      errors[`family_contacts.${index}.contact_priority`] =
        "Priority is required.";
    }
  });

  const primaryCount = normalized.family_contacts.filter(
    (contact) => contact.contact_priority === "primary",
  ).length;

  if (primaryCount === 0) {
    errors.family_contacts = "Choose one primary family contact.";
  } else if (primaryCount > 1) {
    errors.family_contacts = "Only one contact can be primary.";
  }

  if (!normalized.lives_alone) {
    errors.lives_alone = "Lives alone is required.";
  }

  if (!normalized.mobility) {
    errors.mobility = "Mobility is required.";
  }

  if (!normalized.can_stand) {
    errors.can_stand = "Standing ability is required.";
  }

  if (!normalized.lifting_required) {
    errors.lifting_required = "Lifting required is required.";
  }

  if (!normalized.continence) {
    errors.continence = "Continence is required.";
  }

  if (normalized.medical_equipment.length === 0) {
    errors.medical_equipment = "Select medical equipment.";
  }

  normalized.medical_equipment.forEach((equipment, index) => {
    if (!equipment.skill_level) {
      errors[`medical_equipment.${index}.skill_level`] =
        "Experience level is required.";
    }
  });

  normalized.conditions.forEach((condition, index) => {
    if (!condition.condition_stage) {
      errors[`conditions.${index}.condition_stage`] =
        "Condition stage is required.";
    }
  });

  const conditionIds = normalized.conditions.map(
    (condition) => condition.condition_id,
  );
  if (new Set(conditionIds).size !== conditionIds.length) {
    errors.conditions = "Duplicate conditions are not allowed.";
  }

  if (!normalized.medication_reminder_needed) {
    errors.medication_reminder_needed =
      "Medication reminder preference is required.";
  }

  if (!normalized.preferred_caregiver_gender) {
    errors.preferred_caregiver_gender =
      "Preferred caregiver gender is required.";
  }

  if (!normalized.driver_needed) {
    errors.driver_needed = "Driver needed is required.";
  }

  if (
    normalized.driver_needed === "true" &&
    !normalized.transportation_mode
  ) {
    errors.transportation_mode =
      "Transportation mode is required when a driver is needed.";
  }

  if (!normalized.pets_at_home) {
    errors.pets_at_home = "Pets at home is required.";
  }

  return errors;
}

export function mergeCareNeedsFieldErrors(
  ...fieldErrors: Array<CareNeedsFieldErrors | undefined>
): CareNeedsFieldErrors {
  return fieldErrors.reduce<CareNeedsFieldErrors>(
    (result, errors) => ({ ...result, ...(errors ?? {}) }),
    {},
  );
}

export function buildCareNeedsUpdatePayload(
  values: CareNeedsFormValues,
  options?: CareNeedsOptions,
): CareNeedsUpdatePayload {
  const normalized = normalizeCareNeedsFormValues(values, options);
  const liftingRequired = booleanFromValue(normalized.lifting_required);
  const driverNeeded = booleanFromValue(normalized.driver_needed);

  return {
    family_contacts: normalized.family_contacts.map((contact) => ({
      ...(contact.id ? { id: contact.id } : {}),
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      relationship: contact.relationship,
      contact_priority: contact.contact_priority as CareNeedsContactPriority,
    })),
    care_needs: {
      lives_alone: booleanFromValue(normalized.lives_alone),
      mobility: normalized.mobility as CareNeedsMobility,
      can_stand: normalized.can_stand as CareNeedsStandingAbility,
      lifting_required: liftingRequired,
      lifting_level: liftingRequired ? normalized.lifting_level || null : null,
      continence: normalized.continence as CareNeedsContinence,
      medication_reminder_needed: booleanFromValue(
        normalized.medication_reminder_needed,
      ),
      preferred_caregiver_gender:
        normalized.preferred_caregiver_gender as CareNeedsPreferredCaregiverGender,
      driver_needed: driverNeeded,
      transportation_mode: driverNeeded
        ? (normalized.transportation_mode as CareNeedsTransportationMode)
        : null,
      pets_at_home: booleanFromValue(normalized.pets_at_home),
    },
    equipment: normalized.medical_equipment.map((equipment) => ({
      ...(equipment.id ? { id: equipment.id } : {}),
      equipment_id: equipment.equipment_id,
      skill_level: equipment.skill_level as ExperienceSkillLevel,
    })),
    conditions: normalized.conditions.map((condition) => ({
      ...(condition.id ? { id: condition.id } : {}),
      condition_id: condition.condition_id,
      condition_stage: condition.condition_stage as CareNeedsConditionStage,
    })),
  };
}
