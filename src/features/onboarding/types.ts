export type OnboardingFlowId = "provider" | "careseeker";

export type ProviderOnboardingStepId =
  | "account"
  | "verification"
  | "personal-details"
  | "skills-availability"
  | "qualifications-experience"
  | "review"
  | "screening-payment"
  | "submitted";

export type CareseekerOnboardingStepId =
  | "account"
  | "verification"
  | "personal-details"
  | "care-needs"
  | "submitted";

export type OnboardingStepId = ProviderOnboardingStepId | CareseekerOnboardingStepId;

export const PROVIDER_ONBOARDING_STEP_IDS = [
  "account",
  "verification",
  "personal-details",
  "skills-availability",
  "qualifications-experience",
  "review",
  "screening-payment",
  "submitted",
] as const satisfies ReadonlyArray<ProviderOnboardingStepId>;

export const CARESEEKER_ONBOARDING_STEP_IDS = [
  "account",
  "verification",
  "personal-details",
  "care-needs",
  "submitted",
] as const satisfies ReadonlyArray<CareseekerOnboardingStepId>;

export const ONBOARDING_STEP_IDS = [
  ...PROVIDER_ONBOARDING_STEP_IDS,
  "care-needs",
] as const satisfies ReadonlyArray<OnboardingStepId>;

export function isOnboardingStepId(value: string): value is OnboardingStepId {
  return (ONBOARDING_STEP_IDS as readonly string[]).includes(value);
}

export type OnboardingStepDefinition = {
  id: OnboardingStepId;
  label: string;
  title: string;
  eyebrow: string;
  description: string;
  figmaNodeId?: string;
};

export type OnboardingFlowDefinition = {
  id: OnboardingFlowId;
  label: string;
  basePath: string;
  steps: OnboardingStepDefinition[];
};

export type OnboardingActionState = {
  status: "idle" | "error" | "success";
  message: string;
  submissionId?: number;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
  nextPath?: string;
  requiresEmailVerification?: boolean;
  existingAccount?: {
    email: string;
    isVerified: boolean;
    canResumeOnboarding: boolean;
  };
};
