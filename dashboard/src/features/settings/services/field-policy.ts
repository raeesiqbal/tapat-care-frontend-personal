import type { SkillsAvailabilityFormField } from "@tapat-care/api-contracts";

export type DashboardServicesFieldPolicy = {
  field: SkillsAvailabilityFormField;
  visible: boolean;
  editable: boolean;
  submit: boolean;
};

export type DashboardServicesSectionPolicy = {
  id: "services";
  title: string;
  description?: string;
  fields: DashboardServicesFieldPolicy[];
};

function editableField(
  field: SkillsAvailabilityFormField,
): DashboardServicesFieldPolicy {
  return {
    field,
    visible: true,
    editable: true,
    submit: true,
  };
}

export function getDashboardServicesSections(): DashboardServicesSectionPolicy[] {
  return [
    {
      id: "services",
      title: "Services and availability",
      description:
        "Keep your client-facing services, hourly rate, experience, availability, and intro current.",
      fields: [
        editableField("services"),
        editableField("hourlyRate"),
        editableField("yearsExperience"),
        editableField("availability"),
        editableField("bio"),
      ],
    },
  ];
}

export function flattenDashboardServicesPolicies(
  sections: DashboardServicesSectionPolicy[],
) {
  return sections.flatMap((section) => section.fields);
}

export function getVisibleDashboardServicesFields(
  sections: DashboardServicesSectionPolicy[],
) {
  return flattenDashboardServicesPolicies(sections)
    .filter((policy) => policy.visible)
    .map((policy) => policy.field);
}

export function getEditableDashboardServicesFields(
  sections: DashboardServicesSectionPolicy[],
) {
  return flattenDashboardServicesPolicies(sections)
    .filter((policy) => policy.visible && policy.editable)
    .map((policy) => policy.field);
}

export function getSubmittableDashboardServicesFields(
  sections: DashboardServicesSectionPolicy[],
) {
  return flattenDashboardServicesPolicies(sections)
    .filter((policy) => policy.visible && policy.submit)
    .map((policy) => policy.field);
}

export function isDashboardServicesFieldEditable(
  sections: DashboardServicesSectionPolicy[],
  field: SkillsAvailabilityFormField,
) {
  return flattenDashboardServicesPolicies(sections).some(
    (policy) => policy.field === field && policy.visible && policy.editable,
  );
}
