import type {
  OnboardingFlowDefinition,
  OnboardingFlowId,
  OnboardingStepId,
} from "./types";

export const providerOnboardingFlow = {
  id: "provider",
  label: "Caregiver onboarding",
  basePath: "/onboarding/provider",
  steps: [
    {
      id: "account",
      label: "Account",
      eyebrow: "CAREGIVER APPLICATION",
      title: "Create your account",
      description:
        "Set up the account we will use for application updates and secure profile access.",
      figmaNodeId: "237:994",
    },
    {
      id: "verification",
      label: "Verification",
      eyebrow: "PHONE VERIFICATION",
      title: "Verify your phone",
      description:
        "Confirm the number clients and Tapat Care can use for important application updates.",
      figmaNodeId: "237:995",
    },
    {
      id: "personal-details",
      label: "Personal details",
      eyebrow: "ABOUT YOU",
      title: "Tell us about yourself",
      description: "",
      figmaNodeId: "237:996",
    },
    {
      id: "skills-availability",
      label: "Skills",
      eyebrow: "SERVICES AND AVAILABILITY",
      title: "Choose services you offer",
      description:
        "Select your care services, hourly rate, experience, availability, and client-facing intro.",
      figmaNodeId: "237:997",
    },
    {
      id: "qualifications-experience",
      label: "Qualifications",
      eyebrow: "QUALIFICATIONS AND EXPERIENCE",
      title: "Share your qualifications and care experience",
      description:
        "Tell us about your certifications, transportation comfort, home environment preferences, and condition or equipment experience.",
      figmaNodeId: "237:997",
    },
    {
      id: "review",
      label: "Review",
      eyebrow: "REVIEW YOUR DETAILS",
      title: "Review your application details",
      description:
        "Check your personal details and services before continuing to the screening payment step.",
      figmaNodeId: "237:997",
    },
    {
      id: "screening-payment",
      label: "Screening",
      eyebrow: "SAFETY SCREENING",
      title: "Authorize your safety screening",
      description:
        "Securely authorize your background screening fee. You will not be charged until you complete the screening application with our verified partner.",
      figmaNodeId: "237:998",
    },
    {
      id: "submitted",
      label: "Submitted",
      eyebrow: "APPLICATION SUBMITTED",
      title: "Your application is in review",
      description:
        "Track review progress and complete optional profile improvements.",
      figmaNodeId: "237:999",
    },
  ],
} satisfies OnboardingFlowDefinition;

export const careseekerOnboardingFlow = {
  id: "careseeker",
  label: "Careseeker onboarding",
  basePath: "/onboarding/careseeker",
  steps: [
    {
      id: "account",
      label: "Account",
      eyebrow: "CARESEEKER SIGNUP",
      title: "Create your account",
      description:
        "Set up the account you will use to manage care requests and communicate with Tapat Care.",
    },
    {
      id: "verification",
      label: "Verification",
      eyebrow: "PHONE VERIFICATION",
      title: "Verify your phone",
      description:
        "Confirm the number Tapat Care can use for care request updates and account security.",
    },
    {
      id: "personal-details",
      label: "Personal details",
      eyebrow: "ABOUT YOU",
      title: "Tell us about yourself",
      description: "",
    },
    {
      id: "care-needs",
      label: "Care needs",
      eyebrow: "CARE NEEDS",
      title: "Tell us about the care you need",
      description:
        "Share contact, mobility, medical, preference, transportation, and pet details so we can match care safely.",
    },
    {
      id: "submitted",
      label: "Submitted",
      eyebrow: "ACCOUNT READY",
      title: "Your account is ready",
      description:
        "You can now explore caregiver profiles and find caregivers who match your needs.",
    },
  ],
} satisfies OnboardingFlowDefinition;

export const onboardingFlows = {
  provider: providerOnboardingFlow,
  careseeker: careseekerOnboardingFlow,
} satisfies Record<OnboardingFlowId, OnboardingFlowDefinition>;

export function getOnboardingFlow(flowId: string) {
  return onboardingFlows[flowId as OnboardingFlowId] ?? null;
}

export function getOnboardingStep(
  flow: OnboardingFlowDefinition,
  stepId: string,
) {
  return flow.steps.find((step) => step.id === stepId) ?? null;
}

export function getStepIndex(
  flow: OnboardingFlowDefinition,
  stepId: OnboardingStepId,
) {
  return flow.steps.findIndex((step) => step.id === stepId);
}

export function getStepPath(
  flow: OnboardingFlowDefinition,
  stepId: OnboardingStepId,
) {
  return `${flow.basePath}/${stepId}`;
}

export function getAdjacentStepPaths(
  flow: OnboardingFlowDefinition,
  stepId: OnboardingStepId,
) {
  const index = getStepIndex(flow, stepId);
  const previous =
    index > 0 ? getStepPath(flow, flow.steps[index - 1].id) : null;
  const next =
    index >= 0 && index < flow.steps.length - 1
      ? getStepPath(flow, flow.steps[index + 1].id)
      : null;

  return { previous, next };
}
