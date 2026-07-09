import { AppNavbar } from "@/components/navigation/AppNavbar";

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#fbfafc] text-gray-950">
      <AppNavbar appearance="solid" showSearch={false} surface="onboarding" />
      {children}
    </div>
  );
}
