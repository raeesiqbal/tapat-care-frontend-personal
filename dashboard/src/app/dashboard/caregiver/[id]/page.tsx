import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SelectChip } from "@tapat-care/ui-primitives";

import { CaregiverListingCard } from "@/features/dashboard/components/caregiver-listing-card";
import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import {
  DashboardBackendError,
  getCaregiverDetail,
  getDashboardSession,
} from "@/features/dashboard/server";
import type {
  CaregiverDetail,
  CaregiverQualificationsDetail,
} from "@/features/dashboard/types";

type CaregiverDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type DetailCardProps = {
  title: string;
  children: ReactNode;
};

function DetailCard({ title, children }: DetailCardProps) {
  return (
    <section className="rounded-lg border border-[var(--tapat-color-gray-200)] bg-white p-5 shadow-card sm:p-6">
      <h2 className="text-xl font-semibold tracking-normal text-gray-950">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyText() {
  return <p className="text-sm text-gray-500">Not listed.</p>;
}

function ChipList({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <EmptyText />;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <SelectChip
          key={value}
          label={value}
          active
          className="pointer-events-none max-w-full cursor-default whitespace-normal break-words text-left"
        />
      ))}
    </div>
  );
}

function ServicesCard({
  caregiverName,
  serviceGroups,
}: {
  caregiverName: string;
  serviceGroups: CaregiverDetail["serviceGroups"];
}) {
  return (
    <DetailCard title={`Services ${caregiverName} provides`}>
      {serviceGroups.length === 0 ? (
        <EmptyText />
      ) : (
        <div className="grid gap-5">
          {serviceGroups.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold text-gray-800">
                {group.category}
              </h3>
              <div className="mt-3">
                <ChipList values={group.services} />
              </div>
            </div>
          ))}
        </div>
      )}
    </DetailCard>
  );
}

function QualificationsCard({
  qualifications,
}: {
  qualifications: CaregiverQualificationsDetail;
}) {
  const groups = [
    {
      title: "Certifications",
      values: qualifications.certifications,
    },
    {
      title: "Transportation",
      values: qualifications.transportation,
    },
    {
      title: "Home preferences",
      values: qualifications.preferences,
    },
    {
      title: "Condition experience",
      values: qualifications.conditionExperience,
    },
    {
      title: "Equipment experience",
      values: qualifications.equipmentExperience,
    },
  ];
  const visibleGroups = groups.filter((group) => group.values.length > 0);

  return (
    <DetailCard title="Qualifications and experience">
      {visibleGroups.length === 0 ? (
        <EmptyText />
      ) : (
        <div className="grid gap-5">
          {visibleGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-gray-700">
                {group.title}
              </h3>
              <div className="mt-2">
                <ChipList values={group.values} />
              </div>
            </div>
          ))}
        </div>
      )}
    </DetailCard>
  );
}

export default async function CaregiverDetailPage({
  params,
}: CaregiverDetailPageProps) {
  const { id } = await params;
  const { token, user } = await getDashboardSession(
    `/dashboard/caregiver/${id}`,
  );

  if (user.accountType !== "careseeker") {
    redirect("/dashboard");
  }

  let caregiver: CaregiverDetail;

  try {
    caregiver = await getCaregiverDetail(token, id);
  } catch (error) {
    if (error instanceof DashboardBackendError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  return (
    <DashboardFrame user={user}>
      <main className="bg-[var(--tapat-color-surface-page)]">
        <section className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--tapat-color-brand-purple-700)] transition hover:text-violet-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to caregivers
          </Link>

          <div className="mt-6">
            <CaregiverListingCard caregiver={caregiver.listing} />
          </div>

          <div className="mt-6 grid gap-5">
            <DetailCard title={`About ${caregiver.listing.name}`}>
              {caregiver.bio ? (
                <p className="text-sm leading-6 text-gray-600 sm:text-base">
                  {caregiver.bio}
                </p>
              ) : (
                <EmptyText />
              )}
            </DetailCard>

            <DetailCard title="Availability">
              <ChipList values={caregiver.availability} />
            </DetailCard>

            <ServicesCard
              caregiverName={caregiver.listing.name}
              serviceGroups={caregiver.serviceGroups}
            />

            <DetailCard title="Languages:">
              <ChipList values={caregiver.languages} />
            </DetailCard>

            <QualificationsCard qualifications={caregiver.qualifications} />
          </div>
        </section>
      </main>
    </DashboardFrame>
  );
}
