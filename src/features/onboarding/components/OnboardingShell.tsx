import type {
  OnboardingFlowDefinition,
  OnboardingStepDefinition,
} from "../types";
import { getStepIndex } from "../registry";

type OnboardingShellProps = {
  flow: OnboardingFlowDefinition;
  step: OnboardingStepDefinition;
  children: React.ReactNode;
  formMaxWidthClassName?: string;
};

function StepProgress({
  flow,
  step,
}: {
  flow: OnboardingFlowDefinition;
  step: OnboardingStepDefinition;
}) {
  const visibleSteps = flow.steps.filter((item) => item.id !== "submitted");
  const activeIndex = getStepIndex(flow, step.id);
  return (
    <div
      className="mx-auto grid w-full pb-4"
      style={{
        gridTemplateColumns: `repeat(${visibleSteps.length}, minmax(0, 1fr))`,
      }}
    >
      {visibleSteps.map((item, index) => {
        const isComplete = index < activeIndex;
        const isActive = index === activeIndex;
        const fill = isComplete || isActive ? 100 : 0;

        return (
          <div
            key={item.id}
            className="h-[6px] overflow-hidden  bg-gray-200"
            aria-label={`${item.label} progress`}
          >
            <div
              className={"h-full  bg-primary transition-all duration-300"}
              style={{ width: `${fill}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function OnboardingShell({
  flow,
  step,
  children,
  formMaxWidthClassName = "max-w-[900px]",
}: OnboardingShellProps) {
  return (
    <main className="text-gray-950">
      <StepProgress flow={flow} step={step} />
      <section
        className={`mx-auto flex w-full ${formMaxWidthClassName} flex-col px-5 py-6 sm:px-8`}
      >
        <div className="mb-9 max-w-[640px]">
          <p className="mb-3 text-[12px] font-semibold text-primary">
            {step.eyebrow}
          </p>
          <h1 className="text-[24px] font-semibold leading-[1.1] tracking-normal text-gray-950">
            {step.title}
          </h1>
          <p className="mt-4 max-w-[570px] text-[17px] leading-7 text-gray-600">
            {step.description}
          </p>
        </div>
        {children}
      </section>
    </main>
  );
}
