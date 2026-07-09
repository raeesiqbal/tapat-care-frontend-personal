import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import { DashboardPlaceholderPage } from "@/features/dashboard/components/dashboard-placeholder-page";
import { getDashboardSession } from "@/features/dashboard/server";

export default async function MessagesPage() {
  const { user } = await getDashboardSession("/dashboard/messages");

  return (
    <DashboardFrame user={user}>
      <DashboardPlaceholderPage
        user={user}
        title="Messages"
        description="Messaging UI will be connected after the visual pass. The page already uses the authenticated dashboard shell."
      />
    </DashboardFrame>
  );
}
