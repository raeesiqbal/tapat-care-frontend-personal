import type { FieldErrors } from "./form-validation";

export const QUALIFICATIONS_EXPERIENCE_STEP_ID =
  "qualifications-experience" as const;

export const qualificationsBooleanOptions = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
] as const;

export type QualificationsBooleanValue = "" | "true" | "false";
export type TransportationComfort = string;
export type PetType = string;
export type ExperienceSkillLevel = string;

export type QualificationsExperienceField =
  | "certifications"
  | "hasDriversLicense"
  | "hasCar"
  | "hasAutoInsuranceRegistration"
  | "transportationComfort"
  | "willingWithPets"
  | "petTypesComfortable"
  | "willingWithSmokers"
  | "conditionExperience"
  | "equipmentExperience";

export type QualificationsExperienceFieldErrors =
  FieldErrors<QualificationsExperienceField>;

export type QualificationsChoiceOption<TValue extends string = string> = {
  label: string;
  value: TValue;
};

export type CertificationOption = {
  id: number;
  name: string;
  slug?: string;
};

export type ExperienceItemOption = {
  id: number;
  name: string;
  slug?: string;
  item_type?: "condition" | "equipment" | string;
};

export type QualificationsExperienceOptions = {
  certifications: CertificationOption[];
  conditionExperienceItems: ExperienceItemOption[];
  equipmentExperienceItems: ExperienceItemOption[];
  transportationComfort: QualificationsChoiceOption<TransportationComfort>[];
  petTypes: QualificationsChoiceOption<PetType>[];
  skillLevels: QualificationsChoiceOption<ExperienceSkillLevel>[];
};

export type QualificationsExperienceItemValue = {
  item_id: number;
  skill_level: ExperienceSkillLevel;
};

export type QualificationsExperienceValues = {
  certifications: number[];
  hasDriversLicense: QualificationsBooleanValue;
  hasCar: QualificationsBooleanValue;
  hasAutoInsuranceRegistration: QualificationsBooleanValue;
  transportationComfort: TransportationComfort | "";
  willingWithPets: QualificationsBooleanValue;
  petTypesComfortable: PetType[];
  willingWithSmokers: QualificationsBooleanValue;
  conditionExperience: QualificationsExperienceItemValue[];
  equipmentExperience: QualificationsExperienceItemValue[];
};

export type QualificationsExperienceBackendCertification = {
  id?: number;
  name?: string;
  slug?: string;
  verification_status?: string;
  expiration_date?: string | null;
};

export type QualificationsExperienceBackendItem = {
  item_id?: number;
  id?: number;
  name?: string;
  slug?: string;
  item_type?: string;
  skill_level?: string;
};

export type QualificationsExperienceBackendData = {
  certifications?: Array<QualificationsExperienceBackendCertification | number>;
  transportation?: {
    has_drivers_license?: boolean | null;
    has_car?: boolean | null;
    has_auto_insurance_registration?: boolean | null;
    transportation_comfort?: string | null;
  };
  preferences?: {
    willing_with_pets?: boolean | null;
    pet_types_comfortable?: string[] | null;
    willing_with_smokers?: boolean | null;
  };
  condition_experience?: QualificationsExperienceBackendItem[];
  equipment_experience?: QualificationsExperienceBackendItem[];
  options?: {
    certifications?: CertificationOption[];
    condition_experience_items?: ExperienceItemOption[];
    equipment_experience_items?: ExperienceItemOption[];
    transportation_comfort?: QualificationsChoiceOption[];
    pet_types?: QualificationsChoiceOption[];
    skill_levels?: QualificationsChoiceOption[];
  };
};

export type QualificationsExperienceUpdatePayload = {
  certifications: number[];
  transportation: {
    has_drivers_license: boolean;
    has_car: boolean;
    has_auto_insurance_registration: boolean;
    transportation_comfort: TransportationComfort;
  };
  preferences: {
    willing_with_pets: boolean;
    pet_types_comfortable: PetType[];
    willing_with_smokers: boolean;
  };
  condition_experience: QualificationsExperienceItemValue[];
  equipment_experience: QualificationsExperienceItemValue[];
};

export const initialQualificationsExperienceOptions: QualificationsExperienceOptions =
  {
    certifications: [],
    conditionExperienceItems: [],
    equipmentExperienceItems: [],
    transportationComfort: [],
    petTypes: [],
    skillLevels: [],
  };

export const initialQualificationsExperienceValues: QualificationsExperienceValues =
  {
    certifications: [],
    hasDriversLicense: "",
    hasCar: "",
    hasAutoInsuranceRegistration: "",
    transportationComfort: "",
    willingWithPets: "",
    petTypesComfortable: [],
    willingWithSmokers: "",
    conditionExperience: [],
    equipmentExperience: [],
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

function parseStoredObject<T extends Record<string, unknown>>(
  value: string | undefined,
): T | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as T)
      : null;
  } catch {
    return null;
  }
}

function optionalNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isSafeInteger(numberValue) && numberValue > 0
    ? numberValue
    : undefined;
}

function normalizeBooleanValue(value: unknown): QualificationsBooleanValue {
  if (value === true || value === "true") {
    return "true";
  }

  if (value === false || value === "false") {
    return "false";
  }

  return "";
}

function booleanFromValue(value: QualificationsBooleanValue) {
  return value === "true";
}

function normalizeOption(value: unknown) {
  return String(value ?? "").trim();
}

function optionValues(
  options: readonly QualificationsChoiceOption[] | undefined,
) {
  return new Set((options ?? []).map((option) => option.value));
}

function normalizeOptionFromBackend<TValue extends string>(
  value: unknown,
  options: readonly QualificationsChoiceOption<TValue>[] | undefined,
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

function normalizeChoiceOptions<TValue extends string>(
  values: unknown,
): QualificationsChoiceOption<TValue>[] {
  if (!Array.isArray(values)) {
    return [];
  }

  const options = values.reduce<QualificationsChoiceOption<TValue>[]>(
    (result, item) => {
      if (!item || typeof item !== "object") {
        return result;
      }

      const record = item as Record<string, unknown>;
      const value = String(record.value ?? "").trim() as TValue;
      const label = String(record.label ?? "").trim();

      if (!value || !label || result.some((option) => option.value === value)) {
        return result;
      }

      return [...result, { value, label }];
    },
    [],
  );

  return options;
}

function normalizeCertifications(values: unknown): number[] {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set<number>();

  return values.reduce<number[]>((result, item) => {
    const id =
      typeof item === "number"
        ? optionalNumber(item)
        : optionalNumber((item as Record<string, unknown> | undefined)?.id);

    if (!id || seen.has(id)) {
      return result;
    }

    seen.add(id);
    return [...result, id];
  }, []);
}

function normalizeExperienceItems(
  values: unknown,
  options?: QualificationsExperienceOptions,
): QualificationsExperienceItemValue[] {
  if (!Array.isArray(values)) {
    return [];
  }

  const enforceOptions = Boolean(options);
  const seen = new Set<number>();

  return values.reduce<QualificationsExperienceItemValue[]>((result, item) => {
    const record =
      item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const itemId =
      optionalNumber(record.item_id) ?? optionalNumber(record.id);
    const skillLevel = normalizeOptionFromBackend(
      record.skill_level,
      options?.skillLevels,
      enforceOptions,
    );

    if (!itemId || !skillLevel || seen.has(itemId)) {
      return result;
    }

    seen.add(itemId);
    return [...result, { item_id: itemId, skill_level: skillLevel }];
  }, []);
}

function itemValuesWithOptions(
  values: QualificationsExperienceItemValue[],
  options: ExperienceItemOption[],
) {
  const allowedIds = new Set(options.map((option) => option.id));
  const orderById = new Map(options.map((option, index) => [option.id, index]));

  return values
    .filter((item) => allowedIds.has(item.item_id))
    .sort(
      (left, right) =>
        (orderById.get(left.item_id) ?? Number.MAX_SAFE_INTEGER) -
        (orderById.get(right.item_id) ?? Number.MAX_SAFE_INTEGER),
    );
}

export function normalizeQualificationsExperienceOptions(
  data?: QualificationsExperienceBackendData | null,
): QualificationsExperienceOptions {
  return {
    certifications: Array.isArray(data?.options?.certifications)
      ? data.options.certifications
      : [],
    conditionExperienceItems: Array.isArray(
      data?.options?.condition_experience_items,
    )
      ? data.options.condition_experience_items
      : [],
    equipmentExperienceItems: Array.isArray(
      data?.options?.equipment_experience_items,
    )
      ? data.options.equipment_experience_items
      : [],
    transportationComfort: normalizeChoiceOptions(
      data?.options?.transportation_comfort,
    ),
    petTypes: normalizeChoiceOptions(data?.options?.pet_types),
    skillLevels: normalizeChoiceOptions(data?.options?.skill_levels),
  };
}

export function qualificationsExperienceValuesWithOptions(
  values: QualificationsExperienceValues,
  options: QualificationsExperienceOptions,
): QualificationsExperienceValues {
  const certificationIds = new Set(
    options.certifications.map((option) => option.id),
  );
  const petTypeValues = optionValues(options.petTypes);
  const transportationComfort = normalizeOptionFromBackend(
    values.transportationComfort,
    options.transportationComfort,
    true,
  );

  return {
    ...values,
    certifications: values.certifications.filter((id) =>
      certificationIds.has(id),
    ),
    transportationComfort,
    petTypesComfortable: values.petTypesComfortable.filter((petType) =>
      petTypeValues.has(petType),
    ),
    conditionExperience: itemValuesWithOptions(
      normalizeExperienceItems(values.conditionExperience, options),
      options.conditionExperienceItems,
    ),
    equipmentExperience: itemValuesWithOptions(
      normalizeExperienceItems(values.equipmentExperience, options),
      options.equipmentExperienceItems,
    ),
  };
}

export function qualificationsExperienceValuesFromApi(
  data?: QualificationsExperienceBackendData | null,
): QualificationsExperienceValues {
  const options = normalizeQualificationsExperienceOptions(data);
  const hasBackendOptions = Boolean(data?.options);
  const transportation = data?.transportation ?? {};
  const preferences = data?.preferences ?? {};
  const values: QualificationsExperienceValues = {
    certifications: normalizeCertifications(data?.certifications),
    hasDriversLicense: normalizeBooleanValue(
      transportation.has_drivers_license,
    ),
    hasCar: normalizeBooleanValue(transportation.has_car),
    hasAutoInsuranceRegistration: normalizeBooleanValue(
      transportation.has_auto_insurance_registration,
    ),
    transportationComfort: normalizeOptionFromBackend(
      transportation.transportation_comfort,
      options.transportationComfort,
      hasBackendOptions,
    ),
    willingWithPets: normalizeBooleanValue(preferences.willing_with_pets),
    petTypesComfortable: Array.isArray(preferences.pet_types_comfortable)
      ? preferences.pet_types_comfortable.reduce<PetType[]>((result, item) => {
          const normalized = normalizeOptionFromBackend(
            item,
            options.petTypes,
            hasBackendOptions,
          );
          return normalized && !result.includes(normalized)
            ? [...result, normalized]
            : result;
        }, [])
      : [],
    willingWithSmokers: normalizeBooleanValue(preferences.willing_with_smokers),
    conditionExperience: normalizeExperienceItems(
      data?.condition_experience,
      hasBackendOptions ? options : undefined,
    ),
    equipmentExperience: normalizeExperienceItems(
      data?.equipment_experience,
      hasBackendOptions ? options : undefined,
    ),
  };

  return hasBackendOptions
    ? qualificationsExperienceValuesWithOptions(values, options)
    : values;
}

export function qualificationsExperienceValuesFromState(
  values?: Record<string, string>,
  options?: QualificationsExperienceOptions,
): QualificationsExperienceValues {
  if (values?.transportation || values?.preferences) {
    const transportation = parseStoredObject(values.transportation) ?? {};
    const preferences = parseStoredObject(values.preferences) ?? {};

    const parsedValues = qualificationsExperienceValuesFromApi({
      certifications: parseStoredArray(values.certifications),
      transportation: {
        has_drivers_license: transportation.has_drivers_license as boolean,
        has_car: transportation.has_car as boolean,
        has_auto_insurance_registration:
          transportation.has_auto_insurance_registration as boolean,
        transportation_comfort:
          transportation.transportation_comfort as string,
      },
      preferences: {
        willing_with_pets: preferences.willing_with_pets as boolean,
        pet_types_comfortable: preferences.pet_types_comfortable as string[],
        willing_with_smokers: preferences.willing_with_smokers as boolean,
      },
      condition_experience: parseStoredArray(values.condition_experience),
      equipment_experience: parseStoredArray(values.equipment_experience),
    });

    return options
      ? qualificationsExperienceValuesWithOptions(parsedValues, options)
      : parsedValues;
  }

  const parsedValues = {
    certifications: normalizeCertifications(
      parseStoredArray(values?.certifications),
    ),
    hasDriversLicense: normalizeBooleanValue(values?.hasDriversLicense),
    hasCar: normalizeBooleanValue(values?.hasCar),
    hasAutoInsuranceRegistration: normalizeBooleanValue(
      values?.hasAutoInsuranceRegistration,
    ),
    transportationComfort: normalizeOptionFromBackend(
      values?.transportationComfort,
      options?.transportationComfort,
      Boolean(options),
    ),
    willingWithPets: normalizeBooleanValue(values?.willingWithPets),
    petTypesComfortable: parseStoredArray(values?.petTypesComfortable).reduce<
      PetType[]
    >((result, item) => {
      const normalized = normalizeOptionFromBackend(
        item,
        options?.petTypes,
        Boolean(options),
      );
      return normalized && !result.includes(normalized)
        ? [...result, normalized]
        : result;
    }, []),
    willingWithSmokers: normalizeBooleanValue(values?.willingWithSmokers),
    conditionExperience: normalizeExperienceItems(
      parseStoredArray(values?.conditionExperience),
      options,
    ),
    equipmentExperience: normalizeExperienceItems(
      parseStoredArray(values?.equipmentExperience),
      options,
    ),
  };

  return options
    ? qualificationsExperienceValuesWithOptions(parsedValues, options)
    : parsedValues;
}

export function qualificationsExperienceValuesToState(
  values: QualificationsExperienceValues,
): Record<string, string> {
  const normalized = {
    ...initialQualificationsExperienceValues,
    ...values,
    petTypesComfortable:
      values.willingWithPets === "true" ? values.petTypesComfortable : [],
  };

  return {
    certifications: JSON.stringify(normalized.certifications),
    hasDriversLicense: normalized.hasDriversLicense,
    hasCar: normalized.hasCar,
    hasAutoInsuranceRegistration: normalized.hasAutoInsuranceRegistration,
    transportationComfort: normalized.transportationComfort,
    willingWithPets: normalized.willingWithPets,
    petTypesComfortable: JSON.stringify(normalized.petTypesComfortable),
    willingWithSmokers: normalized.willingWithSmokers,
    conditionExperience: JSON.stringify(normalized.conditionExperience),
    equipmentExperience: JSON.stringify(normalized.equipmentExperience),
  };
}

export function qualificationsExperienceValuesFromFormData(
  formData: FormData,
  options?: QualificationsExperienceOptions,
): QualificationsExperienceValues {
  const rawValues = String(formData.get("values") || "");

  try {
    const parsed = JSON.parse(rawValues) as Partial<QualificationsExperienceValues>;
    const parsedValues: QualificationsExperienceValues = {
      certifications: normalizeCertifications(parsed.certifications),
      hasDriversLicense: normalizeBooleanValue(parsed.hasDriversLicense),
      hasCar: normalizeBooleanValue(parsed.hasCar),
      hasAutoInsuranceRegistration: normalizeBooleanValue(
        parsed.hasAutoInsuranceRegistration,
      ),
      transportationComfort: normalizeOptionFromBackend(
        parsed.transportationComfort,
        options?.transportationComfort,
        Boolean(options),
      ),
      willingWithPets: normalizeBooleanValue(parsed.willingWithPets),
      petTypesComfortable: Array.isArray(parsed.petTypesComfortable)
        ? parsed.petTypesComfortable.reduce<PetType[]>((result, item) => {
            const normalized = normalizeOptionFromBackend(
              item,
              options?.petTypes,
              Boolean(options),
            );
            return normalized && !result.includes(normalized)
              ? [...result, normalized]
              : result;
          }, [])
        : [],
      willingWithSmokers: normalizeBooleanValue(parsed.willingWithSmokers),
      conditionExperience: normalizeExperienceItems(
        parsed.conditionExperience,
        options,
      ),
      equipmentExperience: normalizeExperienceItems(
        parsed.equipmentExperience,
        options,
      ),
    };

    return options
      ? qualificationsExperienceValuesWithOptions(parsedValues, options)
      : parsedValues;
  } catch {
    return initialQualificationsExperienceValues;
  }
}

export function hasMeaningfulQualificationsExperienceValues(
  values: QualificationsExperienceValues,
) {
  return (
    values.certifications.length > 0 ||
    Boolean(values.hasDriversLicense) ||
    Boolean(values.hasCar) ||
    Boolean(values.hasAutoInsuranceRegistration) ||
    Boolean(values.transportationComfort) ||
    Boolean(values.willingWithPets) ||
    values.petTypesComfortable.length > 0 ||
    Boolean(values.willingWithSmokers) ||
    values.conditionExperience.length > 0 ||
    values.equipmentExperience.length > 0
  );
}

export function validateQualificationsExperienceForm(
  values: QualificationsExperienceValues,
  options?: QualificationsExperienceOptions,
): QualificationsExperienceFieldErrors {
  const normalized = qualificationsExperienceValuesFromState(
    qualificationsExperienceValuesToState(values),
    options,
  );
  const errors: QualificationsExperienceFieldErrors = {};

  if (!normalized.hasDriversLicense) {
    errors.hasDriversLicense = "Driver's license is required.";
  }

  if (!normalized.hasCar) {
    errors.hasCar = "Car ownership is required.";
  }

  if (!normalized.hasAutoInsuranceRegistration) {
    errors.hasAutoInsuranceRegistration =
      "Auto insurance or registration is required.";
  }

  if (!normalized.transportationComfort) {
    errors.transportationComfort = "Transportation comfort is required.";
  }

  if (
    normalized.hasAutoInsuranceRegistration === "true" &&
    normalized.hasCar !== "true"
  ) {
    errors.hasCar =
      "Car ownership is required when auto insurance or registration is provided.";
  }

  if (!normalized.willingWithPets) {
    errors.willingWithPets = "Pet comfort is required.";
  }

  if (
    normalized.willingWithPets === "true" &&
    normalized.petTypesComfortable.length === 0
  ) {
    errors.petTypesComfortable =
      "Select at least one pet type when willing to work with pets.";
  }

  if (!normalized.willingWithSmokers) {
    errors.willingWithSmokers = "Smoker comfort is required.";
  }

  if (
    normalized.conditionExperience.some((item) => !item.skill_level) ||
    new Set(normalized.conditionExperience.map((item) => item.item_id)).size !==
      normalized.conditionExperience.length
  ) {
    errors.conditionExperience =
      "Choose one skill level for each condition experience item.";
  }

  if (
    normalized.equipmentExperience.some((item) => !item.skill_level) ||
    new Set(normalized.equipmentExperience.map((item) => item.item_id)).size !==
      normalized.equipmentExperience.length
  ) {
    errors.equipmentExperience =
      "Choose one skill level for each equipment experience item.";
  }

  return errors;
}

export function mergeQualificationsExperienceFieldErrors(
  ...fieldErrors: Array<QualificationsExperienceFieldErrors | undefined>
): QualificationsExperienceFieldErrors {
  return fieldErrors.reduce<QualificationsExperienceFieldErrors>(
    (result, errors) => ({ ...result, ...(errors ?? {}) }),
    {},
  );
}

export function buildQualificationsExperienceUpdatePayload(
  values: QualificationsExperienceValues,
  options?: QualificationsExperienceOptions,
): QualificationsExperienceUpdatePayload {
  const normalized = qualificationsExperienceValuesFromState(
    qualificationsExperienceValuesToState(values),
    options,
  );
  const willingWithPets = booleanFromValue(normalized.willingWithPets);

  return {
    certifications: normalized.certifications,
    transportation: {
      has_drivers_license: booleanFromValue(normalized.hasDriversLicense),
      has_car: booleanFromValue(normalized.hasCar),
      has_auto_insurance_registration: booleanFromValue(
        normalized.hasAutoInsuranceRegistration,
      ),
      transportation_comfort:
        normalized.transportationComfort as TransportationComfort,
    },
    preferences: {
      willing_with_pets: willingWithPets,
      pet_types_comfortable: willingWithPets
        ? normalized.petTypesComfortable
        : [],
      willing_with_smokers: booleanFromValue(normalized.willingWithSmokers),
    },
    condition_experience: normalized.conditionExperience,
    equipment_experience: normalized.equipmentExperience,
  };
}

function optionLabel<TValue extends string>(
  value: string,
  options: readonly QualificationsChoiceOption<TValue>[],
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function itemName(itemId: number, options: readonly ExperienceItemOption[]) {
  return options.find((item) => item.id === itemId)?.name ?? String(itemId);
}

export function formatQualificationsBoolean(value: QualificationsBooleanValue) {
  if (value === "true") {
    return "Yes";
  }

  if (value === "false") {
    return "No";
  }

  return "-";
}

export function formatQualificationsCertifications(
  certificationIds: number[],
  options: readonly CertificationOption[],
) {
  if (certificationIds.length === 0) {
    return "-";
  }

  return certificationIds
    .map(
      (certificationId) =>
        options.find((option) => option.id === certificationId)?.name ??
        String(certificationId),
    )
    .join(", ");
}

export function formatQualificationsTransportation(
  values: QualificationsExperienceValues,
  options: QualificationsExperienceOptions,
) {
  const comfort = values.transportationComfort
    ? optionLabel(values.transportationComfort, options.transportationComfort)
    : "-";

  return [
    `Driver's license: ${formatQualificationsBoolean(values.hasDriversLicense)}`,
    `Car: ${formatQualificationsBoolean(values.hasCar)}`,
    `Insurance/registration: ${formatQualificationsBoolean(
      values.hasAutoInsuranceRegistration,
    )}`,
    `Comfort: ${comfort}`,
  ].join("; ");
}

export function formatQualificationsPreferences(
  values: QualificationsExperienceValues,
  options: QualificationsExperienceOptions,
) {
  const pets =
    values.willingWithPets === "true"
      ? values.petTypesComfortable
          .map((petType) => optionLabel(petType, options.petTypes))
          .join(", ") || "-"
      : formatQualificationsBoolean(values.willingWithPets);

  return [
    `Pets: ${pets}`,
    `Smokers: ${formatQualificationsBoolean(values.willingWithSmokers)}`,
  ].join("; ");
}

export function formatQualificationsExperienceSummary(
  values: QualificationsExperienceItemValue[],
  itemOptions: readonly ExperienceItemOption[],
  skillLevelOptions: readonly QualificationsChoiceOption<ExperienceSkillLevel>[],
) {
  if (values.length === 0) {
    return "-";
  }

  return values
    .map(
      (item) =>
        `${itemName(item.item_id, itemOptions)}: ${optionLabel(
          item.skill_level,
          skillLevelOptions,
        )}`,
    )
    .join("; ");
}
