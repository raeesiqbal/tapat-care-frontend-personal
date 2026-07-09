import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ToastProvider } from "@/components/shared/ToastProvider";
import { VerificationToastBridge } from "@/components/shared/VerificationToastBridge";


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Home - Tapat Care",
  description: "Tapat Care provides reliable and compassionate home healthcare services with trusted caregivers for your loved ones.",
  keywords: "home healthcare, caregivers, elderly care, home care services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.cdnfonts.com/css/graphik-trial"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <div className="">
        {children}
        <Suspense fallback={null}>
          <VerificationToastBridge />
        </Suspense>
        <ToastProvider />
        </div>
      </body>
    </html>
  );
}
