import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, HeartHandshake, UserRoundCheck } from "lucide-react";
import { getAccessRedirectPath, resolveOnboardingAccess } from "@/lib/onboarding-access";

export const metadata: Metadata = {
  title: "Get Started - Tapat Care",
  description: "Choose how you want to join Tapat Care.",
};

export default function GetStartedPage() {
  return <GetStartedPageContent />;
}

async function GetStartedPageContent() {
  const access = await resolveOnboardingAccess();
  const redirectPath = getAccessRedirectPath(access);

  if (redirectPath) {
    redirect(redirectPath);
  }

  return (
    <main className="text-gray-950">
      <section className="mx-auto flex w-full max-w-[900px] flex-col px-5 py-12 sm:px-8 lg:py-20">
        <p className="mb-3 text-[15px] font-semibold text-primary">
          Join Tapat
        </p>
        <h1 className="text-[40px] font-semibold leading-[1.1] tracking-normal text-gray-950 sm:text-[56px]">
          Choose how you want to get started
        </h1>
        <p className="mt-5 text-[18px] leading-8 text-gray-600">
          Select the path that fits you. We will guide you through account
          setup, verification, and profile details.
        </p>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Link
            href="/onboarding/provider/account"
            className="group rounded-[8px] border border-gray-100 bg-white p-7 shadow-card transition hover:-translate-y-1 hover:border-primary hover:shadow-panel"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-[8px] bg-violet-50 text-primary">
              <UserRoundCheck className="h-7 w-7" />
            </span>
            <h2 className="mt-6 text-[28px] font-semibold text-gray-950">
              Join as caregiver
            </h2>
            <p className="mt-3 text-[16px] leading-7 text-gray-600">
              Create your caregiver account, verify your phone, and complete the
              first personal details step.
            </p>
            <span className="mt-7 inline-flex items-center gap-2 text-[15px] font-semibold text-primary">
              Start caregiver onboarding
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/onboarding/careseeker/account"
            className="group rounded-[8px] border border-gray-100 bg-white p-7 shadow-card transition hover:-translate-y-1 hover:border-primary hover:shadow-panel"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-[8px] bg-violet-50 text-primary">
              <HeartHandshake className="h-7 w-7" />
            </span>
            <h2 className="mt-6 text-[28px] font-semibold text-gray-950">
              Join as careseeker
            </h2>
            <p className="mt-3 text-[16px] leading-7 text-gray-600">
              Create your careseeker account, verify your phone, and complete
              your basic profile.
            </p>
            <span className="mt-7 inline-flex items-center gap-2 text-[15px] font-semibold text-primary">
              Start careseeker onboarding
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
