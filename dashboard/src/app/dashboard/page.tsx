import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import { DashboardHome } from "@/features/dashboard/components/dashboard-home";
import {
  getCaregiverListingPage,
  getDashboardSession,
} from "@/features/dashboard/server";

export default async function DashboardPage() {
  const { token, user } = await getDashboardSession("/dashboard");
  const initialCaregiverPage =
    user.accountType === "caregiver"
      ? null
      : await getCaregiverListingPage(token);

  return (
    <DashboardFrame user={user}>
      <DashboardHome
        initialCaregiverPage={initialCaregiverPage}
        user={user}
      />
    </DashboardFrame>
  );
}
