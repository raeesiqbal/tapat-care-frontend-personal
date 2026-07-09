"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { DollarSign, SquarePen } from "lucide-react";
import {
  InfoCallout,
  notifyFormErrors,
  ReviewSection,
  SelectChip,
  SelectChipGroup,
  TextField as Field,
} from "@tapat-care/ui-primitives";
import {
  formatSkillsAvailabilityBio,
  formatSkillsAvailabilityHourlyRate,
  formatSkillsAvailabilityList,
  formatSkillsAvailabilityYearsExperience,
  groupSkillsAvailabilityServicesByCategory,
  hasFieldErrors,
  mergeSkillsAvailabilityFieldErrors,
  skillsAvailabilityFormInfoCallout,
  skillsAvailabilityOptions,
  validateSkillsAvailabilityForm,
  type SkillsAvailabilityFieldErrors,
  type SkillsAvailabilityFormField,
  type SkillsAvailabilityServiceOption,
  type SkillsAvailabilityValues,
} from "@tapat-care/api-contracts";

import {
  updateDashboardServicesSettings,
  type DashboardServicesSettingsActionState,
} from "@/features/settings/services/actions";
import {
  getDashboardServicesSections,
  getEditableDashboardServicesFields,
  getSubmittableDashboardServicesFields,
  isDashboardServicesFieldEditable,
} from "@/features/settings/services/field-policy";

type ServicesSettingsFormProps = {
  initialValues: SkillsAvailabilityValues;
  serviceOptions: SkillsAvailabilityServiceOption[];
  canEdit: boolean;
};

const initialActionState: DashboardServicesSettingsActionState = {
  status: "idle",
  message: "",
};

function buildFormData(
  values: SkillsAvailabilityValues,
  fields: ReadonlyArray<SkillsAvailabilityFormField>,
) {
  const formData = new FormData();

  if (fields.includes("services")) {
    values.services.forEach((id) => formData.append("services", String(id)));
  }

  if (fields.includes("hourlyRate")) {
    formData.append("hourlyRate", values.hourlyRate);
  }

  if (fields.includes("yearsExperience")) {
    formData.append("yearsExperience", values.yearsExperience);
  }

  if (fields.includes("availability")) {
    values.availability.forEach((item) =>
      formData.append("availability", item),
    );
  }

  if (fields.includes("bio")) {
    formData.append("bio", values.bio);
  }

  return formData;
}

function GroupedServicesSummary({
  serviceIds,
  serviceOptions,
}: {
  serviceIds: number[];
  serviceOptions: SkillsAvailabilityServiceOption[];
}) {
  if (serviceIds.length === 0) {
    return "-";
  }

  if (serviceOptions.length === 0) {
    return serviceIds.join(", ");
  }

  const selectedServiceIds = new Set(serviceIds);
  const matchedServiceIds = new Set<number>();
  const selectedGroups = groupSkillsAvailabilityServicesByCategory(
    serviceOptions,
  )
    .map((group) => ({
      ...group,
      services: group.services.filter((service) => {
        const isSelected = selectedServiceIds.has(service.id);

        if (isSelected) {
          matchedServiceIds.add(service.id);
        }

        return isSelected;
      }),
    }))
    .filter((group) => group.services.length > 0);
  const unmatchedServiceIds = serviceIds.filter(
    (serviceId) => !matchedServiceIds.has(serviceId),
  );

  if (selectedGroups.length === 0 && unmatchedServiceIds.length === 0) {
    return "-";
  }

  return (
    <div className="space-y-3">
      {selectedGroups.map((group) => (
        <div key={group.category}>
          <p className="text-sm font-semibold text-gray-700">
            {group.category}
          </p>
          <p className="mt-1 text-[15px] leading-6 text-gray-950">
            {group.services.map((service) => service.name).join(", ")}
          </p>
        </div>
      ))}
      {unmatchedServiceIds.length > 0 ? (
        <div>
          <p className="text-sm font-semibold text-gray-700">
            Other services
          </p>
          <p className="mt-1 text-[15px] leading-6 text-gray-950">
            {unmatchedServiceIds.join(", ")}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ServicesSettingsReadOnly({
  canEdit,
  onEdit,
  values,
  serviceOptions,
}: {
  canEdit: boolean;
  onEdit: () => void;
  values: SkillsAvailabilityValues;
  serviceOptions: SkillsAvailabilityServiceOption[];
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
      title="Services and availability"
      action={editAction}
      rows={[
        {
          label: "Services",
          value: (
            <GroupedServicesSummary
              serviceIds={values.services}
              serviceOptions={serviceOptions}
            />
          ),
        },
        {
          label: "Hourly rate",
          value: formatSkillsAvailabilityHourlyRate(values.hourlyRate),
        },
        {
          label: "Years of experience",
          value: formatSkillsAvailabilityYearsExperience(
            values.yearsExperience,
          ),
        },
        {
          label: "Availability",
          value: formatSkillsAvailabilityList(values.availability),
        },
        {
          label: "Bio",
          value: formatSkillsAvailabilityBio(values.bio),
        },
      ]}
    />
  );
}

export function ServicesSettingsForm({
  initialValues,
  serviceOptions,
  canEdit,
}: ServicesSettingsFormProps) {
  const sections = getDashboardServicesSections();
  const editableFields = getEditableDashboardServicesFields(sections);
  const submitFields = getSubmittableDashboardServicesFields(sections);
  const copy = skillsAvailabilityFormInfoCallout;
  const [state, formAction, isPending] = useActionState(
    updateDashboardServicesSettings,
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
  const [clientErrors, setClientErrors] =
    useState<SkillsAvailabilityFieldErrors>({});

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
  const fieldErrors = mergeSkillsAvailabilityFieldErrors(
    serverErrors,
    clientErrors,
  );
  const serviceGroups =
    groupSkillsAvailabilityServicesByCategory(serviceOptions);

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

  function isEditableField(field: SkillsAvailabilityFormField) {
    return (
      editableFields.includes(field) &&
      isDashboardServicesFieldEditable(sections, field)
    );
  }

  function clearFieldError(field: SkillsAvailabilityFormField) {
    setClientErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function toggleService(serviceId: number) {
    if (!isEditableField("services")) {
      return;
    }

    setValues((currentValues) => ({
      ...currentValues,
      services: currentValues.services.includes(serviceId)
        ? currentValues.services.filter((id) => id !== serviceId)
        : [...currentValues.services, serviceId],
    }));
    clearFieldError("services");
  }

  function handleHourlyRateChange(value: string) {
    if (!isEditableField("hourlyRate")) {
      return;
    }

    setValues((currentValues) => ({
      ...currentValues,
      hourlyRate: value,
    }));
    clearFieldError("hourlyRate");
  }

  function handleYearsExperienceChange(value: string) {
    if (!isEditableField("yearsExperience")) {
      return;
    }

    setValues((currentValues) => ({
      ...currentValues,
      yearsExperience: value,
    }));
    clearFieldError("yearsExperience");
  }

  function toggleAvailability(item: string) {
    if (!isEditableField("availability")) {
      return;
    }

    setValues((currentValues) => ({
      ...currentValues,
      availability: currentValues.availability.includes(item)
        ? currentValues.availability.filter((value) => value !== item)
        : [...currentValues.availability, item],
    }));
    clearFieldError("availability");
  }

  function handleBioChange(value: string) {
    if (!isEditableField("bio")) {
      return;
    }

    setValues((currentValues) => ({
      ...currentValues,
      bio: value,
    }));
    clearFieldError("bio");
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateSkillsAvailabilityForm(
      values,
      submitFields,
    );
    setClientErrors(validationErrors);

    if (hasFieldErrors(validationErrors)) {
      notifyFormErrors();
      return;
    }

    startTransition(() => {
      formAction(buildFormData(values, submitFields));
    });
  }

  if (!isEditing) {
    return (
      <ServicesSettingsReadOnly
        canEdit={canEdit}
        onEdit={handleEdit}
        values={persistedValues}
        serviceOptions={serviceOptions}
      />
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="w-full rounded-[20px] border border-gray-100 bg-white p-6 shadow-card sm:p-8 lg:p-10">
        <section>
          <div className="max-w-[680px]">
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
                      const active = values.services.includes(service.id);

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
          {serviceOptions.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">
              Services are unavailable right now.
            </p>
          ) : null}
        </section>
        <InfoCallout className="mt-4">{copy.servicesCalloutText}</InfoCallout>
        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div>
            <Field
              label="Hourly rate"
              name="hourlyRate"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="25.00"
              value={values.hourlyRate}
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
              value={values.yearsExperience}
              error={fieldErrors.yearsExperience}
              onChange={(event) =>
                handleYearsExperienceChange(event.target.value)
              }
            />
            <InfoCallout className="mt-4">
              {copy.yearsExperienceCalloutText}
            </InfoCallout>
          </div>
        </section>

        <section className="mt-10 border-t border-gray-100 pt-10">
          <div className="max-w-[680px]">
            <h2 className="text-[18px] font-semibold text-gray-950">
              Availability
            </h2>
          </div>
          <SelectChipGroup error={fieldErrors.availability}>
            {skillsAvailabilityOptions.map((item) => {
              const active = values.availability.includes(item);

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
        </section>
        <InfoCallout className="mt-4">
          {copy.availabilityCalloutText}
        </InfoCallout>

        <section className="mt-10 border-t border-gray-100 pt-10">
          <div className="max-w-[680px]">
            <h2 className="text-[18px] font-semibold text-gray-950">
              A short intro clients will see
            </h2>
            <textarea
              value={values.bio}
              onChange={(event) => handleBioChange(event.target.value)}
              maxLength={400}
              rows={5}
              className="mt-4 w-full rounded-xl border border-gray-200 p-4 text-sm outline-none focus:border-primary"
              placeholder="Write a short intro..."
            />
            {fieldErrors.bio ? (
              <p className="mt-2 text-sm text-red-600">{fieldErrors.bio}</p>
            ) : null}
            <div className="mt-2 text-right text-xs text-gray-500">
              {values.bio.length} / 400 characters
            </div>
          </div>
        </section>
        <InfoCallout className="mt-4">{copy.bioCalloutText}</InfoCallout>

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
