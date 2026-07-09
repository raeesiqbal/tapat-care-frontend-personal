import type {
  CaregiverListingPage,
  DashboardUser,
} from "@/features/dashboard/types";
import { CaregiverDashboard } from "@/features/dashboard/components/caregiver-dashboard";
import { CareseekerDashboard } from "@/features/dashboard/components/careseeker-dashboard";

type DashboardHomeProps = {
  initialCaregiverPage: CaregiverListingPage | null;
  user: DashboardUser;
};

const emptyCaregiverPage: CaregiverListingPage = {
  caregivers: [],
  total: 0,
  nextOffset: null,
  hasMore: false,
};

export function DashboardHome({
  initialCaregiverPage,
  user,
}: DashboardHomeProps) {
  if (user.accountType === "caregiver") {
    return <CaregiverDashboard user={user} />;
  }

  return (
    <CareseekerDashboard
      initialCaregiverPage={initialCaregiverPage ?? emptyCaregiverPage}
      user={user}
    />
  );
}
