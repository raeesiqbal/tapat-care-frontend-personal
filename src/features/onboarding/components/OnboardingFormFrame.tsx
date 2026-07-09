import type { ReactNode } from "react";

type OnboardingFormFrameProps = {
  children: ReactNode;
  withCard?: boolean;
};

export function OnboardingFormFrame({
  children,
  withCard = true,
}: OnboardingFormFrameProps) {
  if (!withCard) {
    return <>{children}</>;
  }

  return (
    <div className="w-full p-0 sm:rounded-[24px] sm:border sm:border-gray-100 sm:bg-white sm:p-8 sm:shadow-card lg:p-10">
      {children}
    </div>
  );
}
