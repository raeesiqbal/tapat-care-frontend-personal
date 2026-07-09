export type NavigationSurface = "public" | "onboarding" | "dashboard";
export type NavigationAppearance = "transparent" | "solid";

export type NavigationItem = {
  label: string;
  href: string;
};

export type NavbarActionKind = "link" | "primary" | "secondary" | "outline";

export type NavbarAction = NavigationItem & {
  kind: NavbarActionKind;
};

export type NavbarContextLabel = {
  hrefPrefix: string;
  label: string;
};

export const publicNavItems: NavigationItem[] = [
  { label: "Why Tapat", href: "#what-tapat-means" },
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Reviews", href: "#reviews" },
  { label: "About", href: "/about" },
  { label: "Contact & Support", href: "/contact" },
];

export const navbarItems: Record<NavigationSurface, NavigationItem[]> = {
  public: publicNavItems,
  onboarding: [],
  dashboard: [],
};

export const navbarActions: Record<NavigationSurface, NavbarAction[]> = {
  public: [
    { label: "Log in", href: "/login", kind: "secondary" },
    { label: "Join Tapat", href: "/get-started", kind: "primary" },
  ],
  onboarding: [{ label: "Log in", href: "/login", kind: "secondary" }],
  dashboard: [],
};

export const navbarContextLabels: Record<
  NavigationSurface,
  NavbarContextLabel[]
> = {
  public: [],
  onboarding: [
    { hrefPrefix: "/get-started", label: "" },
    { hrefPrefix: "/onboarding/provider", label: "" },
    { hrefPrefix: "/onboarding/careseeker", label: "" },
  ],
  dashboard: [],
};
