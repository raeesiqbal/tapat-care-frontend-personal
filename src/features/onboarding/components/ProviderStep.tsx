import { notFound } from "next/navigation";
import { AccountForm } from "./AccountForm";
import { CareNeedsForm } from "./CareNeedsForm";
import { VerificationForm } from "./VerificationForm";
import { PersonalDetailsForm } from "./PersonalDetailsForm";
import { SkillsAvailabilityForm } from "./SkillsAvailabilityForm";
import { QualificationsExperienceForm } from "./QualificationsExperienceForm";
import { ReviewForm } from "./ReviewForm";
import { ScreeningPaymentForm } from "./ScreeningPaymentForm";
import { ScreeningStatusPage } from "./ScreeningStatusPage";
import { CARESEEKER_SUBMITTED_COMPLETION_PATH } from "../resume-state";
import type {
  OnboardingFlowDefinition,
  OnboardingStepDefinition,
} from "../types";
import { getAdjacentStepPaths } from "../registry";

export function ProviderStep({
  flow,
  step,
  initialPhone,
  initialPhoneVerified,
}: {
  flow: OnboardingFlowDefinition;
  step: OnboardingStepDefinition;
  initialPhone?: string;
  initialPhoneVerified?: boolean;
}) {
  const { previous, next } = getAdjacentStepPaths(flow, step.id);

  if (step.id === "account") {
    return <AccountForm flowId={flow.id} nextPath={next || flow.basePath} />;
  }

  if (step.id === "verification") {
    return (
      <VerificationForm
        flowId={flow.id}
        nextPath={next || flow.basePath}
        initialPhone={initialPhone}
        initialPhoneVerified={initialPhoneVerified}
      />
    );
  }

  if (step.id === "personal-details") {
    return (
      <PersonalDetailsForm
        flowId={flow.id}
        previousPath={previous || null}
        nextPath={next || flow.basePath}
      />
    );
  }

  if (flow.id === "careseeker" && step.id === "care-needs") {
    return (
      <CareNeedsForm
        previousPath={previous || flow.basePath}
        nextPath={CARESEEKER_SUBMITTED_COMPLETION_PATH}
      />
    );
  }

  if (step.id === "submitted") {
    return <ScreeningStatusPage />;
  }

  if (flow.id === "careseeker") {
    notFound();
  }

  if (step.id === "skills-availability") {
    return (
      <SkillsAvailabilityForm
        previousPath={previous || flow.basePath}
        nextPath={next || flow.basePath}
      />
    );
  }

  if (step.id === "qualifications-experience") {
    return (
      <QualificationsExperienceForm
        previousPath={previous || flow.basePath}
        nextPath={next || flow.basePath}
      />
    );
  }

  if (step.id === "review") {
    return (
      <ReviewForm
        previousPath={previous || flow.basePath}
        nextPath={next || flow.basePath}
        personalDetailsPath={`${flow.basePath}/personal-details`}
        skillsAvailabilityPath={`${flow.basePath}/skills-availability`}
        qualificationsExperiencePath={`${flow.basePath}/qualifications-experience`}
      />
    );
  }

  if (step.id === "screening-payment") {
    return (
      <ScreeningPaymentForm
        previousPath={previous || flow.basePath}
      />
    );
  }

  notFound();
}
