import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@tapat-care/ui-primitives";

import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"),
  title: "Tapat Dashboard",
  description: "Dashboard zone for careseekers, caregivers, and superadmins.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.cdnfonts.com/css/graphik-trial"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
