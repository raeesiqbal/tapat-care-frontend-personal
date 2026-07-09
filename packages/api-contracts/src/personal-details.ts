import ISO6391 from "iso-639-1";

import {
  type FieldErrors,
  type FormValidationConfig,
  validateField,
  validateForm,
} from "./form-validation";

export type PersonalDetailsFlowId = "provider" | "careseeker";

export const PERSONAL_DETAILS_FIELD_IDS = [
  "fullName",
  "pronouns",
  "birthDate",
  "genderIdentity",
  "ethnicity",
  "languages",
  "line1",
  "line2",
  "zip",
] as const;

export type PersonalDetailsFormField =
  (typeof PERSONAL_DETAILS_FIELD_IDS)[number];

export type PersonalDetailsFormValues = Record<
  PersonalDetailsFormField,
  string
>;

export type PersonalDetailsFieldOption = {
  label: string;
  value: string;
  description?: string;
};

export type PersonalDetailsLanguageOption = {
  code: string;
  label: string;
  nativeLabel: string;
  searchText: string;
};

export type personalDetailsFormInfoCallout = {
  profileCallout: string;
  languagesLabel: string;
  languagesHelperText: string;
  languagesReasonText: string;
  languagesPreferenceText: string;
  zipCalloutText: string;
};

export type PersonalDetailsUpdatePayload = {
  profile?: {
    fullName?: string;
    pronouns?: string;
    date_of_birth?: string;
    gender_identity?: string;
    ethnicity?: string;
    languages?: string[];
  };
  address?: {
    line_1?: string;
    line_2?: string;
    zip?: string;
  };
};

export type PersonalDetailsZipDetailsPayload = {
  data?: {
    zip?: string;
    city?: string;
    state?: string;
    location?: string;
  };
  message?: string;
};

export type PersonalDetailsZipLookupResult = {
  valid: boolean;
  zip?: string;
  city?: string;
  state?: string;
  location?: string;
  message?: string;
};

export const PERSONAL_DETAILS_ZIP_LOOKUP_ERROR_MESSAGE =
  "We could not verify this ZIP code.";

export const initialPersonalDetailsFormValues: PersonalDetailsFormValues = {
  fullName: "",
  pronouns: "",
  birthDate: "",
  genderIdentity: "",
  ethnicity: "",
  languages: "",
  line1: "",
  line2: "",
  zip: "",
};

export const personalDetailsFieldLabels: Record<
  PersonalDetailsFormField,
  string
> = {
  fullName: "Full name",
  pronouns: "Pronouns",
  birthDate: "Date of birth",
  genderIdentity: "Gender identity",
  ethnicity: "Race or ethnicity",
  languages: "Languages",
  line1: "Home address",
  line2: "Apartment, suite, unit",
  zip: "ZIP",
};

export const personalDetailsFormInfoCallout: Record<
  PersonalDetailsFlowId,
  personalDetailsFormInfoCallout
> = {
  provider: {
    profileCallout:
      "These details help us verify your application and present your profile clearly.",
    languagesLabel: "Languages you speak fluently",
    languagesHelperText:
      "Search and select every language you can use comfortably with clients and families.",
    languagesReasonText:
      "this helps families and coordinators make respectful matches.",
    languagesPreferenceText:
      "Clear language preferences help us pair you with families who need comfortable communication.",
    zipCalloutText:
      "ZIP confirms your service area; your full address stays private.",
  },
  careseeker: {
    profileCallout:
      "These details help us understand your care needs and match you with the right caregiver.",
    languagesLabel: "Preferred languages",
    languagesHelperText:
      "Search and select every language you and your family prefer for care communication.",
    languagesReasonText:
      "This helps us match you with caregivers who can communicate comfortably with you and your family.",
    languagesPreferenceText:
      "Your language preferences help us find caregivers who can provide clear, respectful communication.",
    zipCalloutText:
      "ZIP helps us match you with nearby caregivers; your full address stays private.",
  },
};

export const personalDetailsPronounOptions: PersonalDetailsFieldOption[] = [
  { label: "She / Her", value: "she/her" },
  { label: "He / Him", value: "he/him" },
  { label: "They / Them", value: "they/them" },
];

export const personalDetailsGenderIdentityOptions: PersonalDetailsFieldOption[] =
  [
    { label: "Female", value: "female" },
    { label: "Male", value: "male" },
    { label: "Transgender Female", value: "transgender-female" },
    { label: "Transgender Male", value: "transgender-male" },
    {
      label: "Genderqueer",
      value: "genderqueer",
      description: "Neither exclusively male or female",
    },
    {
      label: "Additional gender category or other",
      value: "additional-gender-category-or-other",
    },
    {
      label: "Prefer not to say",
      value: "prefer-not-to-say",
      description:
        "That's absolutely fine too! You can always update this later in your profile settings.",
    },
  ];

export const personalDetailsEthnicityOptions: PersonalDetailsFieldOption[] = [
  { label: "Hispanic or Latino", value: "hispanic-or-latino" },
  { label: "White", value: "white" },
  { label: "Black or African American", value: "black-or-african-american" },
  { label: "Asian", value: "asian" },
  {
    label: "Native Hawaiian or other Pacific Islander",
    value: "native-hawaiian-or-other-pacific-islander",
  },
  {
    label: "American Indian or Alaska Native",
    value: "american-indian-or-alaska-native",
  },
  {
    label: "Two or More Ethnicities",
    value: "two-or-more-ethnicities",
  },
  { label: "Prefer not to say", value: "prefer-not-to-say" },
];

const zipPattern = /^\d{5}(?:-\d{4})?$/;

export const personalDetailsValidationConfig: FormValidationConfig<PersonalDetailsFormValues> =
  {
    fullName: {
      label: personalDetailsFieldLabels.fullName,
      required: true,
    },
    pronouns: {
      label: personalDetailsFieldLabels.pronouns,
      required: true,
    },
    birthDate: {
      label: personalDetailsFieldLabels.birthDate,
      required: true,
    },
    genderIdentity: {
      label: personalDetailsFieldLabels.genderIdentity,
      required: true,
    },
    ethnicity: {
      label: personalDetailsFieldLabels.ethnicity,
      required: false,
    },
    languages: {
      label: personalDetailsFieldLabels.languages,
      required: false,
    },
    line1: {
      label: personalDetailsFieldLabels.line1,
      required: true,
    },
    line2: {
      label: personalDetailsFieldLabels.line2,
      required: false,
    },
    zip: {
      label: personalDetailsFieldLabels.zip,
      required: true,
      validators: [
        (value) =>
          zipPattern.test(value.trim()) ? null : "Enter a valid US ZIP code.",
      ],
    },
  };

const languageOptions: PersonalDetailsLanguageOption[] = ISO6391.getAllCodes()
  .map((code) => {
    const label = ISO6391.getName(code).trim();
    const nativeLabel = ISO6391.getNativeName(code).trim();

    return {
      code,
      label,
      nativeLabel,
      searchText: `${label} ${nativeLabel} ${code}`.trim().toLowerCase(),
    };
  })
  .filter((option) => option.label)
  .sort((left, right) => left.label.localeCompare(right.label));

const languageLabelsByCode = new Map(
  languageOptions.map((option) => [option.code, option.label]),
);

export function normalizePersonalDetailsZipLookupResponse(
  payload: PersonalDetailsZipDetailsPayload | null,
  ok: boolean,
): PersonalDetailsZipLookupResult {
  if (!ok || !payload) {
    return {
      valid: false,
      message: payload?.message || PERSONAL_DETAILS_ZIP_LOOKUP_ERROR_MESSAGE,
    };
  }

  return {
    valid: true,
    zip: payload.data?.zip,
    city: payload.data?.city,
    state: payload.data?.state,
    location: payload.data?.location || payload.message,
    message: payload.message,
  };
}

export function getPersonalDetailsLanguageOptions() {
  return languageOptions;
}

export function getPersonalDetailsLanguageLabel(code: string) {
  return languageLabelsByCode.get(code) ?? code;
}

export function personalDetailsLanguagesFromValue(value?: string): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return normalizePersonalDetailsLanguages(parsed);
  } catch {
    return [];
  }
}

export function personalDetailsLanguagesToValue(values: string[]): string {
  return JSON.stringify(normalizePersonalDetailsLanguages(values));
}

export function formatPersonalDetailsLanguages(value: string) {
  const languages = personalDetailsLanguagesFromValue(value);

  if (languages.length === 0) {
    return "-";
  }

  return languages.map(getPersonalDetailsLanguageLabel).join(", ");
}

export function formatPersonalDetailsDisplayValue(value: string) {
  const trimmed = value.trim();
  return trimmed || "-";
}

export function formatPersonalDetailsBirthDate(value: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function normalizePersonalDetailsLanguages(values: unknown[]) {
  return values.reduce<string[]>((result, item) => {
    const normalized = String(item ?? "").trim();

    if (normalized && !result.includes(normalized)) {
      result.push(normalized);
    }

    return result;
  }, []);
}

function validateLanguagesValue(
  values: PersonalDetailsFormValues,
  flowId: PersonalDetailsFlowId,
  fields?: ReadonlyArray<PersonalDetailsFormField>,
) {
  if (flowId !== "provider" && flowId !== "careseeker") {
    return undefined;
  }

  if (fields && !fields.includes("languages")) {
    return undefined;
  }

  return personalDetailsLanguagesFromValue(values.languages).length > 0
    ? undefined
    : "Languages is required.";
}

export function validatePersonalDetailsField(
  field: PersonalDetailsFormField,
  values: PersonalDetailsFormValues,
  flowId: PersonalDetailsFlowId = "careseeker",
  fields?: ReadonlyArray<PersonalDetailsFormField>,
) {
  if (fields && !fields.includes(field)) {
    return undefined;
  }

  if (field === "languages") {
    return validateLanguagesValue(values, flowId, fields);
  }

  return validateField(field, values, personalDetailsValidationConfig);
}

export function validatePersonalDetailsForm(
  values: PersonalDetailsFormValues,
  flowId: PersonalDetailsFlowId = "careseeker",
  fields?: ReadonlyArray<PersonalDetailsFormField>,
) {
  const errors = validateForm(values, personalDetailsValidationConfig, fields);
  const languagesError = validateLanguagesValue(values, flowId, fields);

  if (languagesError) {
    errors.languages = languagesError;
  } else {
    delete errors.languages;
  }

  return errors;
}

export function personalDetailsValuesFromState(
  values?: Record<string, string>,
): PersonalDetailsFormValues {
  return {
    fullName: values?.fullName ?? "",
    pronouns: values?.pronouns ?? "",
    birthDate: values?.birthDate ?? "",
    genderIdentity: values?.genderIdentity ?? "",
    ethnicity: values?.ethnicity ?? "",
    languages: values?.languages ?? "",
    line1: values?.line1 ?? "",
    line2: values?.line2 ?? "",
    zip: values?.zip ?? "",
  };
}

export function personalDetailsValuesFromFormData(
  formData: FormData,
): PersonalDetailsFormValues {
  return {
    fullName: String(formData.get("fullName") || "").trim(),
    pronouns: String(formData.get("pronouns") || "").trim(),
    birthDate: String(formData.get("birthDate") || "").trim(),
    genderIdentity: String(formData.get("genderIdentity") || "").trim(),
    ethnicity: String(formData.get("ethnicity") || "").trim(),
    languages: String(formData.get("languages") || "").trim(),
    line1: String(formData.get("line1") || "").trim(),
    line2: String(formData.get("line2") || "").trim(),
    zip: String(formData.get("zip") || "").trim(),
  };
}

export function mergePersonalDetailsFieldErrors(
  ...fieldErrors: Array<FieldErrors<PersonalDetailsFormField> | undefined>
): FieldErrors<PersonalDetailsFormField> {
  return fieldErrors.reduce<FieldErrors<PersonalDetailsFormField>>(
    (result, errors) => ({ ...result, ...(errors ?? {}) }),
    {},
  );
}

export function buildPersonalDetailsUpdatePayload(
  values: PersonalDetailsFormValues,
  flowId: PersonalDetailsFlowId,
  fields: ReadonlyArray<PersonalDetailsFormField> = PERSONAL_DETAILS_FIELD_IDS,
): PersonalDetailsUpdatePayload {
  const fieldSet = new Set<PersonalDetailsFormField>(fields);
  const profile: NonNullable<PersonalDetailsUpdatePayload["profile"]> = {};
  const address: NonNullable<PersonalDetailsUpdatePayload["address"]> = {};

  if (fieldSet.has("fullName")) {
    profile.fullName = values.fullName;
  }

  if (fieldSet.has("pronouns")) {
    profile.pronouns = values.pronouns;
  }

  if (fieldSet.has("birthDate")) {
    profile.date_of_birth = values.birthDate;
  }

  if (fieldSet.has("genderIdentity")) {
    profile.gender_identity = values.genderIdentity;
  }

  if (fieldSet.has("ethnicity")) {
    profile.ethnicity = values.ethnicity;
  }

  if (
    (flowId === "provider" || flowId === "careseeker") &&
    fieldSet.has("languages")
  ) {
    profile.languages = personalDetailsLanguagesFromValue(values.languages);
  }

  if (fieldSet.has("line1")) {
    address.line_1 = values.line1;
  }

  if (fieldSet.has("line2")) {
    address.line_2 = values.line2;
  }

  if (fieldSet.has("zip")) {
    address.zip = values.zip;
  }

  return {
    ...(Object.keys(profile).length > 0 ? { profile } : {}),
    ...(Object.keys(address).length > 0 ? { address } : {}),
  };
}
