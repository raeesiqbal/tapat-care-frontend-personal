import { AppNavbar } from "@/components/navigation/AppNavbar";
import type { NavbarProps } from "@/interface";

export function Navbar({ isTransparent = true }: NavbarProps) {
  return (
    <AppNavbar
      appearance={isTransparent ? "transparent" : "solid"}
      showSearch={false}
      surface="public"
    />
  );
}
