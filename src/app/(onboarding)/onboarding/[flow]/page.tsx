import { notFound, redirect } from "next/navigation";
import { getOnboardingFlow, getStepPath } from "@/features/onboarding/registry";
import { getAccessRedirectPath, resolveOnboardingAccess } from "@/lib/onboarding-access";

type OnboardingFlowPageProps = {
  params: Promise<{
    flow: string;
  }>;
};

export default async function OnboardingFlowPage({
  params,
}: OnboardingFlowPageProps) {
  const { flow: flowId } = await params;
  const flow = getOnboardingFlow(flowId);

  if (!flow) {
    notFound();
  }

  const firstStepPath = getStepPath(flow, flow.steps[0].id);
  const access = await resolveOnboardingAccess();
  const redirectPath = getAccessRedirectPath(access);

  if (access.state === "logged_out") {
    redirect(firstStepPath);
  }

  redirect(redirectPath || firstStepPath);
}
