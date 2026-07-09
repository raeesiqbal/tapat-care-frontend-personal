import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import { DashboardPlaceholderPage } from "@/features/dashboard/components/dashboard-placeholder-page";
import { getDashboardSession } from "@/features/dashboard/server";

export default async function ApplicationsPage() {
  const { user } = await getDashboardSession("/dashboard/applications");

  return (
    <DashboardFrame user={user}>
      <DashboardPlaceholderPage
        user={user}
        title="Applications"
        description="Applications will be wired to backend records in the functional pass. This route now shares the same authenticated dashboard shell and account type decision."
      />
    </DashboardFrame>
  );
}
