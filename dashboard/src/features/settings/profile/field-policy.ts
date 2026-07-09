import type {
  PersonalDetailsFlowId,
  PersonalDetailsFormField,
} from "@tapat-care/api-contracts";

export type DashboardPersonalDetailsFieldPolicy = {
  field: PersonalDetailsFormField;
  visible: boolean;
  editable: boolean;
  submit: boolean;
};

export type DashboardPersonalDetailsSectionPolicy = {
  id: "profile" | "identity" | "address";
  title: string;
  description?: string;
  fields: DashboardPersonalDetailsFieldPolicy[];
};

function editableField(
  field: PersonalDetailsFormField,
): DashboardPersonalDetailsFieldPolicy {
  return {
    field,
    visible: true,
    editable: true,
    submit: true,
  };
}

function readOnlyField(
  field: PersonalDetailsFormField,
): DashboardPersonalDetailsFieldPolicy {
  return {
    field,
    visible: true,
    editable: false,
    submit: false,
  };
}

export function getDashboardPersonalDetailsSections(
  flowId: PersonalDetailsFlowId,
): DashboardPersonalDetailsSectionPolicy[] {
  const isProvider = flowId === "provider";

  return [
    {
      id: "profile",
      title: "Your profile",
      description: isProvider
        ? "Start with the basics we use for your caregiver profile."
        : undefined,
      fields: [
        editableField("fullName"),
        editableField("pronouns"),
        readOnlyField("birthDate"),
      ],
    },
    {
      id: "identity",
      title: "Identity and communication",
      description: isProvider
        ? undefined
        : undefined,
      fields: [
        editableField("genderIdentity"),
        editableField("ethnicity"),
        editableField("languages"),
      ],
    },
    {
      id: "address",
      title: "Home address",
      description: isProvider
        ? undefined
        : undefined,
      fields: [
        editableField("line1"),
        editableField("line2"),
        editableField("zip"),
      ],
    },
  ];
}

export function flattenDashboardPersonalDetailsPolicies(
  sections: DashboardPersonalDetailsSectionPolicy[],
) {
  return sections.flatMap((section) => section.fields);
}

export function getVisiblePersonalDetailsFields(
  sections: DashboardPersonalDetailsSectionPolicy[],
) {
  return flattenDashboardPersonalDetailsPolicies(sections)
    .filter((policy) => policy.visible)
    .map((policy) => policy.field);
}

export function getEditablePersonalDetailsFields(
  sections: DashboardPersonalDetailsSectionPolicy[],
) {
  return flattenDashboardPersonalDetailsPolicies(sections)
    .filter((policy) => policy.visible && policy.editable)
    .map((policy) => policy.field);
}

export function getSubmittablePersonalDetailsFields(
  sections: DashboardPersonalDetailsSectionPolicy[],
) {
  return flattenDashboardPersonalDetailsPolicies(sections)
    .filter((policy) => policy.visible && policy.submit)
    .map((policy) => policy.field);
}

export function isPersonalDetailsFieldEditable(
  sections: DashboardPersonalDetailsSectionPolicy[],
  field: PersonalDetailsFormField,
) {
  return flattenDashboardPersonalDetailsPolicies(sections).some(
    (policy) => policy.field === field && policy.visible && policy.editable,
  );
}
