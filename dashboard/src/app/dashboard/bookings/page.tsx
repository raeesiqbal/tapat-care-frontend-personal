import { DashboardFrame } from "@/features/dashboard/components/dashboard-frame";
import { DashboardPlaceholderPage } from "@/features/dashboard/components/dashboard-placeholder-page";
import { getDashboardSession } from "@/features/dashboard/server";

export default async function BookingsPage() {
  const { user } = await getDashboardSession("/dashboard/bookings");

  return (
    <DashboardFrame user={user}>
      <DashboardPlaceholderPage
        user={user}
        title="Bookings"
        description="Booking operations will be connected next. For now this page uses the same role-aware dashboard structure as the overview."
      />
    </DashboardFrame>
  );
}
