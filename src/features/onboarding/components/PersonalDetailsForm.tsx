"use client";

import {
  type ReactNode,
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Check, ChevronDown, Languages, MapPin, X } from "lucide-react";
import {
  InfoCallout,
  notifyFormErrors,
  SelectField as Select,
  TextField as Field,
} from "@tapat-care/ui-primitives";
import {
  getPersonalDetailsLanguageLabel,
  getPersonalDetailsLanguageOptions,
  initialPersonalDetailsFormValues,
  mergePersonalDetailsFieldErrors,
  personalDetailsEthnicityOptions,
  personalDetailsFormInfoCallout,
  personalDetailsGenderIdentityOptions,
  personalDetailsLanguagesFromValue,
  personalDetailsLanguagesToValue,
  personalDetailsPronounOptions,
  personalDetailsValuesFromState,
  validatePersonalDetailsField,
  validatePersonalDetailsForm,
  hasFieldErrors,
  type FieldErrors,
  type PersonalDetailsFormField,
  type PersonalDetailsFormValues,
} from "@tapat-care/api-contracts";
import { useOnboardingDraft } from "../draft/OnboardingDraftProvider";
import {
  saveCareseekerPersonalDetails,
  saveProviderPersonalDetails,
} from "../actions";
import { useValidatedForm } from "../hooks/useValidatedForm";
import { lookupZipDetails } from "../services/zip-details";
import {
  getCrossZoneNavigationHref,
  isCrossZonePath,
} from "@/lib/cross-zone-navigation";
import type { OnboardingActionState, OnboardingFlowId } from "../types";
import { OnboardingFooter } from "./OnboardingFooter";
import { OnboardingFormFrame } from "./OnboardingFormFrame";

const initialState: OnboardingActionState = {
  status: "idle",
  message: "",
};

type ZipLookupState = {
  zip: string;
  location?: string;
  message?: string;
  status: "idle" | "valid" | "invalid";
};

type LanguageOption = {
  code: string;
  label: string;
  nativeLabel: string;
  searchText: string;
};

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

const emptyStepValues: Record<string, string> = {};
const languageOptions: LanguageOption[] = getPersonalDetailsLanguageOptions();

function buildFormData(values: PersonalDetailsFormValues) {
  const formData = new FormData();

  Object.entries(values).forEach(([field, value]) => {
    formData.append(field, value);
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

export function PersonalDetailsForm({
  flowId,
  previousPath,
  nextPath,
}: {
  flowId: OnboardingFlowId;
  previousPath?: string | null;
  nextPath: string;
}) {
  const router = useRouter();
  const {
    hydrated,
    valuesByStep,
    setStepFieldValue,
    markStepSaved,
    hasSavedSnapshot,
    isStepDirty,
    clearStep,
  } = useOnboardingDraft();
  const draftValues = valuesByStep["personal-details"] ?? emptyStepValues;
  const personalDetailsAction =
    flowId === "careseeker"
      ? saveCareseekerPersonalDetails
      : saveProviderPersonalDetails;
  const [state, formAction, isPending] = useActionState(
    personalDetailsAction,
    initialState,
  );
  const {
    values,
    clientErrors,
    setClientErrors,
    setHasSubmitted,
    setValues,
    handleFieldBlur,
    handleFieldChange: handleValidatedFieldChange,
  } = useValidatedForm<PersonalDetailsFormValues, PersonalDetailsFormField>({
    initialValues: {
      ...initialPersonalDetailsFormValues,
      ...draftValues,
      ...personalDetailsValuesFromState(state.values),
    },
    validateField: (field, nextValues) =>
      validatePersonalDetailsField(field, nextValues, flowId),
  });
  const [zipLookup, setZipLookup] = useState<ZipLookupState>({
    zip: "",
    status: "idle",
  });
  const [isZipLookupPending, setIsZipLookupPending] = useState(false);
  const [isLanguagesDropdownOpen, setIsLanguagesDropdownOpen] = useState(false);
  const [languagesQuery, setLanguagesQuery] = useState("");
  const hasHandledSuccessRef = useRef(false);
  const lastServerErrorMessageRef = useRef("");
  const languagesFieldRef = useRef<HTMLDivElement>(null);

  const normalizedZip = values.zip.trim();
  const asyncZipError =
    zipLookup.zip === normalizedZip && zipLookup.status === "invalid"
      ? zipLookup.message
      : undefined;
  const zipStatusText =
    zipLookup.zip === normalizedZip && zipLookup.status === "valid"
      ? zipLookup.location
      : undefined;
  const fieldErrors = mergePersonalDetailsFieldErrors(
    state.fieldErrors as FieldErrors<PersonalDetailsFormField> | undefined,
    clientErrors,
    asyncZipError ? { zip: asyncZipError } : undefined,
  );
  const submitLabel =
    hasSavedSnapshot("personal-details") &&
    !isStepDirty("personal-details", values)
      ? "Continue"
      : "Save details";
  const selectedGenderIdentityDescription =
    personalDetailsGenderIdentityOptions.find(
      (option) => option.value === values.genderIdentity,
    )?.description;
  const selectedLanguages = personalDetailsLanguagesFromValue(values.languages);
  const filteredLanguageOptions = languageOptions.filter((option) =>
    option.searchText.includes(languagesQuery.trim().toLowerCase()),
  );
  const navigateToNextPath = useCallback(
    (path: string) => {
      if (isCrossZonePath(path)) {
        window.location.assign(getCrossZoneNavigationHref(path));
        return;
      }

      router.push(path);
    },
    [router],
  );
  const isProviderFlow = flowId === "provider";
  const profileDescription = isProviderFlow
    ? "Start with the basics we use for your caregiver profile."
    : undefined;
  const identityDescription = isProviderFlow
    ? undefined
    : undefined;
  const addressDescription = isProviderFlow
    ? undefined
    : undefined;
  const copy = personalDetailsFormInfoCallout[flowId];

  useEffect(() => {
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
  }, [flowId, normalizedZip]);

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
  }, [handleFieldBlur, isLanguagesDropdownOpen]);

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

    const wasAlreadySaved = hasSavedSnapshot("personal-details");
    const hasStepChanged = isStepDirty("personal-details", values);

    markStepSaved("personal-details", values);

    if (wasAlreadySaved && hasStepChanged) {
      clearStep("screening-payment");
      clearStep("submitted");
    }

    navigateToNextPath(state.nextPath || nextPath);
  }, [
    clearStep,
    hasSavedSnapshot,
    isStepDirty,
    markStepSaved,
    navigateToNextPath,
    nextPath,
    state.nextPath,
    state.status,
    state.message,
    values,
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

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    setValues((currentValues) => {
      const mergedValues = {
        ...currentValues,
        ...draftValues,
      };
      const hasChanges = (
        Object.keys(mergedValues) as Array<keyof PersonalDetailsFormValues>
      ).some((field) => mergedValues[field] !== currentValues[field]);

      return hasChanges ? mergedValues : currentValues;
    });
  }, [draftValues, hydrated, setValues]);

  function handleFieldChange(field: PersonalDetailsFormField, value: string) {
    handleValidatedFieldChange(field, value);
    setStepFieldValue("personal-details", field, value);

    if (field === "zip") {
      setZipLookup({
        zip: "",
        status: "idle",
      });
      setIsZipLookupPending(false);
    }
  }

  function toggleLanguage(code: string) {
    const nextLanguages = selectedLanguages.includes(code)
      ? selectedLanguages.filter((selectedCode) => selectedCode !== code)
      : [...selectedLanguages, code];

    handleFieldChange(
      "languages",
      personalDetailsLanguagesToValue(nextLanguages),
    );
  }

  async function validateZipForSubmit(
    nextErrors: FieldErrors<PersonalDetailsFormField>,
  ) {
    if (nextErrors.zip) {
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
      zip: result.message ?? "We could not verify this ZIP code.",
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    const validationErrors = mergePersonalDetailsFieldErrors(
      validatePersonalDetailsForm(values, flowId),
      asyncZipError ? { zip: asyncZipError } : undefined,
    );

    if (hasFieldErrors(validationErrors)) {
      setClientErrors(validationErrors);
      notifyFormErrors();
      return;
    }

    if (
      hasSavedSnapshot("personal-details") &&
      !isStepDirty("personal-details", values)
    ) {
      markStepSaved("personal-details", values);
      navigateToNextPath(nextPath);
      return;
    }

    const nextErrors = await validateZipForSubmit(validationErrors);
    setClientErrors(nextErrors);

    if (hasFieldErrors(nextErrors)) {
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
        <FormSection title="Your profile" description={profileDescription}>
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
              helperText="Format: MM / DD / YYYY"
              autoComplete="bday"
              value={values.birthDate}
              error={fieldErrors.birthDate}
              onBlur={() => handleFieldBlur("birthDate")}
              onChange={(event) =>
                handleFieldChange("birthDate", event.target.value)
              }
            />
          </div>
          <InfoCallout className="mt-5">{copy.profileCallout}</InfoCallout>
        </FormSection>

        <FormSection
          title="Identity and communication"
          description={identityDescription}
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
                                {active ? <Check className="h-4 w-4" /> : null}
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
          title="Home address"
          description={addressDescription}
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
      </OnboardingFormFrame>
      <OnboardingFooter
        previousPath={previousPath}
        submitLabel={submitLabel}
        isPending={isPending}
        submitDisabled={isZipLookupPending}
      />
    </form>
  );
}
