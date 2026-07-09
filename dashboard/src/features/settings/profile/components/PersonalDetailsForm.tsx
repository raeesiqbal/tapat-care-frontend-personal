"use client";

import {
  type ReactNode,
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import {
  Check,
  ChevronDown,
  Languages,
  MapPin,
  SquarePen,
  X,
} from "lucide-react";
import {
  InfoCallout,
  notifyFormErrors,
  SelectField as Select,
  TextField as Field,
} from "@tapat-care/ui-primitives";
import {
  initialPersonalDetailsFormValues,
  formatPersonalDetailsBirthDate,
  formatPersonalDetailsDisplayValue,
  formatPersonalDetailsLanguages,
  getPersonalDetailsLanguageLabel,
  getPersonalDetailsLanguageOptions,
  hasFieldErrors,
  mergePersonalDetailsFieldErrors,
  personalDetailsEthnicityOptions,
  personalDetailsFieldLabels,
  personalDetailsFormInfoCallout,
  personalDetailsGenderIdentityOptions,
  personalDetailsLanguagesFromValue,
  personalDetailsLanguagesToValue,
  personalDetailsPronounOptions,
  PERSONAL_DETAILS_ZIP_LOOKUP_ERROR_MESSAGE,
  validatePersonalDetailsField,
  validatePersonalDetailsForm,
  type FieldErrors,
  type PersonalDetailsFlowId,
  type PersonalDetailsFormField,
  type PersonalDetailsFormValues,
  type PersonalDetailsLanguageOption,
} from "@tapat-care/api-contracts";

import {
  updateDashboardPersonalDetails,
  type DashboardPersonalDetailsActionState,
} from "@/features/settings/profile/actions";
import {
  getDashboardPersonalDetailsSections,
  getEditablePersonalDetailsFields,
  getSubmittablePersonalDetailsFields,
  getVisiblePersonalDetailsFields,
  isPersonalDetailsFieldEditable,
} from "@/features/settings/profile/field-policy";
import { lookupZipDetails } from "@/features/settings/profile/zip-details";

type PersonalDetailsFormProps = {
  flowId: PersonalDetailsFlowId;
  initialValues: PersonalDetailsFormValues;
  canEdit: boolean;
};

type ZipLookupState = {
  zip: string;
  location?: string;
  message?: string;
  status: "idle" | "valid" | "invalid";
};

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

const initialActionState: DashboardPersonalDetailsActionState = {
  status: "idle",
  message: "",
};
const languageOptions: PersonalDetailsLanguageOption[] =
  getPersonalDetailsLanguageOptions();

function buildFormData(
  values: PersonalDetailsFormValues,
  fields: ReadonlyArray<PersonalDetailsFormField>,
) {
  const formData = new FormData();

  fields.forEach((field) => {
    formData.append(field, values[field]);
  });

  return formData;
}

function FormSection({
  title,
  description,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <section className={className}>
      <div className="max-w-[680px]">
        <h2 className="text-[18px] font-semibold text-gray-950">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function formatReadOnlyValue(
  field: PersonalDetailsFormField,
  values: PersonalDetailsFormValues,
) {
  if (field === "birthDate") {
    return formatPersonalDetailsBirthDate(values.birthDate);
  }

  if (field === "languages") {
    return formatPersonalDetailsLanguages(values.languages);
  }

  return formatPersonalDetailsDisplayValue(values[field]);
}

function PersonalDetailsReadOnly({
  canEdit,
  onEdit,
  values,
  visibleFields,
}: {
  canEdit: boolean;
  onEdit: () => void;
  values: PersonalDetailsFormValues;
  visibleFields: PersonalDetailsFormField[];
}) {
  return (
    <section className="rounded-[20px] border border-gray-100 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 sm:px-8">
        <h2 className="text-[18px] font-semibold text-gray-950">
          Personal details
        </h2>
        {canEdit ? (
          <button
            type="button"
            className="inline-flex items-center rounded-[8px] border border-gray-200 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-primary/5"
            onClick={onEdit}
          >
            <SquarePen className="mr-2 h-4 w-4" />
            Edit
          </button>
        ) : null}
      </div>
      <div className="px-6 sm:px-8">
        {visibleFields.map((field) => (
          <div
            key={field}
            className="grid gap-2 border-b border-gray-100 py-5 sm:grid-cols-[220px_1fr] sm:gap-6"
          >
            <p className="text-[15px] font-semibold text-gray-700">
              {personalDetailsFieldLabels[field]}
            </p>
            <p className="text-[16px] text-gray-950">
              {formatReadOnlyValue(field, values)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PersonalDetailsForm({
  flowId,
  initialValues,
  canEdit,
}: PersonalDetailsFormProps) {
  const sections = useMemo(
    () => getDashboardPersonalDetailsSections(flowId),
    [flowId],
  );
  const visibleFields = useMemo(
    () => getVisiblePersonalDetailsFields(sections),
    [sections],
  );
  const editableFields = useMemo(
    () => getEditablePersonalDetailsFields(sections),
    [sections],
  );
  const submitFields = useMemo(
    () => getSubmittablePersonalDetailsFields(sections),
    [sections],
  );
  const [state, formAction, isPending] = useActionState(
    updateDashboardPersonalDetails,
    initialActionState,
  );
  const lastToastSubmissionIdRef = useRef<number | undefined>(undefined);
  const persistedValues =
    state.status === "success" && state.values ? state.values : initialValues;
  const [values, setValues] = useState(initialValues);
  const [isEditingRequested, setIsEditingRequested] = useState(false);
  const [editStartSubmissionId, setEditStartSubmissionId] = useState<
    number | undefined
  >(undefined);
  const [zipLookup, setZipLookup] = useState<ZipLookupState>({
    zip: "",
    status: "idle",
  });
  const [isZipLookupPending, setIsZipLookupPending] = useState(false);
  const [clientErrors, setClientErrors] = useState<
    FieldErrors<PersonalDetailsFormField>
  >({});
  const [isLanguagesDropdownOpen, setIsLanguagesDropdownOpen] = useState(false);
  const [languagesQuery, setLanguagesQuery] = useState("");
  const languagesFieldRef = useRef<HTMLDivElement>(null);

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
  const isZipSubmittable = submitFields.includes("zip");
  const normalizedZip = values.zip.trim();
  const asyncZipError =
    isZipSubmittable &&
    zipLookup.zip === normalizedZip &&
    zipLookup.status === "invalid"
      ? zipLookup.message
      : undefined;
  const zipStatusText =
    isZipSubmittable &&
    zipLookup.zip === normalizedZip &&
    zipLookup.status === "valid"
      ? zipLookup.location
      : undefined;
  const serverErrors =
    isEditing && state.status === "error" && hasSubmittedInEditSession
      ? state.fieldErrors
      : undefined;
  const fieldErrors = mergePersonalDetailsFieldErrors(
    serverErrors,
    clientErrors,
    asyncZipError ? { zip: asyncZipError } : undefined,
  );
  const selectedGenderIdentityDescription =
    personalDetailsGenderIdentityOptions.find(
      (option) => option.value === values.genderIdentity,
    )?.description;
  const selectedLanguages = personalDetailsLanguagesFromValue(values.languages);
  const filteredLanguageOptions = languageOptions.filter((option) =>
    option.searchText.includes(languagesQuery.trim().toLowerCase()),
  );
  const isProviderFlow = flowId === "provider";
  const copy = personalDetailsFormInfoCallout[flowId];

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

  useEffect(() => {
    if (!isEditing || !isZipSubmittable) {
      return;
    }

    const zip = normalizedZip;

    if (!zip) {
      return;
    }

    if (
      validatePersonalDetailsField(
        "zip",
        {
          ...initialPersonalDetailsFormValues,
          zip,
        },
        flowId,
      )
    ) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsZipLookupPending(true);

      const result = await lookupZipDetails(zip, controller.signal);

      if (controller.signal.aborted) {
        setIsZipLookupPending(false);
        return;
      }

      setZipLookup({
        zip,
        location: result.location,
        message: result.message,
        status: result.valid ? "valid" : "invalid",
      });
      setIsZipLookupPending(false);
    }, 500);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
      setIsZipLookupPending(false);
    };
  }, [flowId, isEditing, isZipSubmittable, normalizedZip]);

  function isEditableField(field: PersonalDetailsFormField) {
    return (
      editableFields.includes(field) &&
      isPersonalDetailsFieldEditable(sections, field)
    );
  }

  function handleFieldChange(field: PersonalDetailsFormField, value: string) {
    if (!isEditableField(field)) {
      return;
    }

    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    setClientErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });

    if (field === "zip") {
      setZipLookup({
        zip: "",
        status: "idle",
      });
      setIsZipLookupPending(false);
    }
  }

  function handleFieldBlur(field: PersonalDetailsFormField) {
    if (!submitFields.includes(field)) {
      return;
    }

    const error = validatePersonalDetailsField(
      field,
      values,
      flowId,
      submitFields,
    );
    setClientErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };

      if (error) {
        nextErrors[field] = error;
      } else {
        delete nextErrors[field];
      }

      return nextErrors;
    });
  }

  useEffect(() => {
    if (!isLanguagesDropdownOpen) {
      return;
    }

    function handleOutsideClick(event: MouseEvent) {
      if (
        languagesFieldRef.current &&
        !languagesFieldRef.current.contains(event.target as Node)
      ) {
        setIsLanguagesDropdownOpen(false);
        handleFieldBlur("languages");
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLanguagesDropdownOpen(false);
        handleFieldBlur("languages");
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  });

  function toggleLanguage(code: string) {
    const nextLanguages = selectedLanguages.includes(code)
      ? selectedLanguages.filter((selectedCode) => selectedCode !== code)
      : [...selectedLanguages, code];

    handleFieldChange(
      "languages",
      personalDetailsLanguagesToValue(nextLanguages),
    );
  }

  function resetZipLookup() {
    setZipLookup({
      zip: "",
      status: "idle",
    });
    setIsZipLookupPending(false);
  }

  function handleEdit() {
    setValues(persistedValues);
    setClientErrors({});
    resetZipLookup();
    setLanguagesQuery("");
    setIsLanguagesDropdownOpen(false);
    setEditStartSubmissionId(state.submissionId);
    setIsEditingRequested(true);
  }

  function handleCancel() {
    setValues(persistedValues);
    setClientErrors({});
    resetZipLookup();
    setLanguagesQuery("");
    setIsLanguagesDropdownOpen(false);
    setIsEditingRequested(false);
  }

  async function validateZipForSubmit(
    nextErrors: FieldErrors<PersonalDetailsFormField>,
  ) {
    if (!isZipSubmittable || nextErrors.zip) {
      return nextErrors;
    }

    const zip = normalizedZip;

    setIsZipLookupPending(true);
    const result = await lookupZipDetails(zip);

    setZipLookup({
      zip,
      location: result.location,
      message: result.message,
      status: result.valid ? "valid" : "invalid",
    });
    setIsZipLookupPending(false);

    if (result.valid) {
      return nextErrors;
    }

    return {
      ...nextErrors,
      zip: result.message ?? PERSONAL_DETAILS_ZIP_LOOKUP_ERROR_MESSAGE,
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = mergePersonalDetailsFieldErrors(
      validatePersonalDetailsForm(values, flowId, submitFields),
      asyncZipError ? { zip: asyncZipError } : undefined,
    );

    if (hasFieldErrors(validationErrors)) {
      setClientErrors(validationErrors);
      notifyFormErrors();
      return;
    }

    const nextErrors = await validateZipForSubmit(validationErrors);
    setClientErrors(nextErrors);

    if (hasFieldErrors(nextErrors)) {
      notifyFormErrors();
      return;
    }

    startTransition(() => {
      formAction(buildFormData(values, submitFields));
    });
  }

  if (!isEditing) {
    return (
      <PersonalDetailsReadOnly
        canEdit={canEdit}
        onEdit={handleEdit}
        values={persistedValues}
        visibleFields={visibleFields}
      />
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="w-full rounded-[20px] border border-gray-100 bg-white p-6 shadow-card sm:p-8 lg:p-10">
        <FormSection
          title={sections[0].title}
          description={sections[0].description}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <Field
              label="Full name"
              name="fullName"
              autoComplete="given-name"
              required
              value={values.fullName}
              error={fieldErrors.fullName}
              placeholder="Naomi"
              helperText={
                isProviderFlow
                  ? "This is the name families will see on your profile."
                  : "This is the name shown on your account."
              }
              onBlur={() => handleFieldBlur("fullName")}
              onChange={(event) =>
                handleFieldChange("fullName", event.target.value)
              }
            />
            <Select
              label="Pronouns"
              name="pronouns"
              autoComplete="gender"
              required
              value={values.pronouns}
              error={fieldErrors.pronouns}
              placeholder="Select pronouns"
              helperText="Used for respectful communication."
              options={personalDetailsPronounOptions}
              onBlur={() => handleFieldBlur("pronouns")}
              onChange={(event) =>
                handleFieldChange("pronouns", event.target.value)
              }
            />
            <Field
              label="Date of birth"
              name="birthDate"
              type="date"
              required
              readOnly
              helperText="Locked after onboarding."
              autoComplete="bday"
              value={values.birthDate}
            />
          </div>
          <InfoCallout className="mt-5">{copy.profileCallout}</InfoCallout>
        </FormSection>

        <FormSection
          title={sections[1].title}
          description={sections[1].description}
          className="mt-10 border-t border-gray-100 pt-10"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <Select
              label="Gender identity"
              name="genderIdentity"
              autoComplete="gender"
              required
              value={values.genderIdentity}
              error={fieldErrors.genderIdentity}
              placeholder="Select identity"
              helperText={selectedGenderIdentityDescription}
              options={personalDetailsGenderIdentityOptions}
              onBlur={() => handleFieldBlur("genderIdentity")}
              onChange={(event) =>
                handleFieldChange("genderIdentity", event.target.value)
              }
            />
            <Select
              label="Race or ethnicity"
              name="ethnicity"
              value={values.ethnicity}
              error={fieldErrors.ethnicity}
              placeholder="Select race or ethnicity"
              helperText="Optional. You can choose Prefer not to say."
              options={personalDetailsEthnicityOptions}
              onBlur={() => handleFieldBlur("ethnicity")}
              onChange={(event) =>
                handleFieldChange("ethnicity", event.target.value)
              }
            />
            {visibleFields.includes("languages") ? (
              <div className="lg:col-span-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-heading text-gray-900">
                    {copy.languagesLabel}
                    <span className="ml-1 text-red-500">*</span>
                  </span>
                  <div ref={languagesFieldRef} className="relative">
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between rounded-[8px] border bg-white px-3 py-4 text-left text-[16px] text-gray-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-violet-100 md:py-2.5 ${
                        fieldErrors.languages
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      aria-expanded={isLanguagesDropdownOpen}
                      aria-haspopup="listbox"
                      onClick={() =>
                        setIsLanguagesDropdownOpen(
                          (currentValue) => !currentValue,
                        )
                      }
                    >
                      <span
                        className={
                          selectedLanguages.length > 0
                            ? "text-gray-900"
                            : "text-gray-400"
                        }
                      >
                        {selectedLanguages.length > 0
                          ? `${selectedLanguages.length} language${
                              selectedLanguages.length === 1 ? "" : "s"
                            } selected`
                          : "Select languages"}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-500 transition ${
                          isLanguagesDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isLanguagesDropdownOpen ? (
                      <div className="absolute z-20 mt-2 w-full rounded-[12px] border border-gray-200 bg-white shadow-card">
                        <div className="border-b border-gray-100 p-3">
                          <input
                            value={languagesQuery}
                            onChange={(event) =>
                              setLanguagesQuery(event.target.value)
                            }
                            placeholder="Search languages"
                            className="w-full rounded-[8px] border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-violet-100"
                          />
                        </div>
                        <div
                          role="listbox"
                          aria-multiselectable="true"
                          className="max-h-64 overflow-y-auto p-2"
                        >
                          {filteredLanguageOptions.length > 0 ? (
                            filteredLanguageOptions.map((option) => {
                              const active = selectedLanguages.includes(
                                option.code,
                              );

                              return (
                                <button
                                  key={option.code}
                                  type="button"
                                  className={`flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left text-sm transition ${
                                    active
                                      ? "bg-primary/10 text-primary"
                                      : "text-gray-700 hover:bg-gray-50"
                                  }`}
                                  onClick={() => toggleLanguage(option.code)}
                                >
                                  <span className="pr-4">
                                    <span className="block font-medium">
                                      {option.label}
                                    </span>
                                    {option.nativeLabel &&
                                    option.nativeLabel !== option.label ? (
                                      <span className="block text-xs text-gray-500">
                                        {option.nativeLabel}
                                      </span>
                                    ) : null}
                                  </span>
                                  {active ? (
                                    <Check className="h-4 w-4" />
                                  ) : null}
                                </button>
                              );
                            })
                          ) : (
                            <p className="px-3 py-2 text-sm text-gray-500">
                              No languages found.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {selectedLanguages.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedLanguages.map((code) => (
                        <button
                          key={code}
                          type="button"
                          className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary"
                          onClick={() => toggleLanguage(code)}
                        >
                          <span>{getPersonalDetailsLanguageLabel(code)}</span>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {fieldErrors.languages ? (
                    <p className="mt-2 text-sm text-red-600">
                      {fieldErrors.languages}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">
                      {copy.languagesHelperText}
                    </p>
                  )}
                </label>
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <InfoCallout>
              <span className="font-semibold">Why we ask:</span>{" "}
              {copy.languagesReasonText}
            </InfoCallout>
            <InfoCallout icon={<Languages className="h-4 w-4" />}>
              {copy.languagesPreferenceText}
            </InfoCallout>
          </div>
        </FormSection>

        <FormSection
          title={sections[2].title}
          description={sections[2].description}
          className="mt-10 border-t border-gray-100 pt-10"
        >
          <div className="grid gap-6">
            <Field
              label="Street address"
              name="line1"
              required
              autoComplete="address-line1"
              placeholder="e.g. 123 Main St, Apt 4B"
              value={values.line1}
              error={fieldErrors.line1}
              onBlur={() => handleFieldBlur("line1")}
              onChange={(event) =>
                handleFieldChange("line1", event.target.value)
              }
            />
            <Field
              label="Apartment, suite, unit"
              name="line2"
              autoComplete="address-line2"
              placeholder="e.g. Apt 4B, Suite 210, Unit 3"
              value={values.line2}
              error={fieldErrors.line2}
              onBlur={() => handleFieldBlur("line2")}
              onChange={(event) =>
                handleFieldChange("line2", event.target.value)
              }
            />
            <Field
              label="ZIP code"
              name="zip"
              required
              autoComplete="postal-code"
              placeholder="e.g. 60007"
              value={values.zip}
              error={fieldErrors.zip}
              statusText={zipStatusText}
              onBlur={() => handleFieldBlur("zip")}
              onChange={(event) => handleFieldChange("zip", event.target.value)}
            />
          </div>
          <InfoCallout icon={<MapPin className="h-4 w-4" />} className="mt-5">
            {copy.zipCalloutText}
          </InfoCallout>
        </FormSection>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-[8px] border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleCancel}
            disabled={isPending || isZipLookupPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-[8px] bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || isZipLookupPending}
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
