import { OnboardingDraftProvider } from "@/features/onboarding/draft/OnboardingDraftProvider";

type OnboardingFlowLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    flow: string;
  }>;
};

export default async function OnboardingFlowLayout({
  children,
  params,
}: OnboardingFlowLayoutProps) {
  const { flow } = await params;

  return <OnboardingDraftProvider flowId={flow}>{children}</OnboardingDraftProvider>;
}
