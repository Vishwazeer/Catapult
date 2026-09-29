import type { Metadata } from "next";
import { Suspense } from "react";
import NavigationBar from "@/components/navigation-bar";
import WelcomeLoader from "@/components/welcome-loader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catapult — AI Lead Prioritization",
  description:
    "AI-powered lead prioritization for real-estate sales teams. Analyze, prioritize, and act on inbound leads in seconds.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink">
        <WelcomeLoader />
        <Suspense fallback={null}>
          <NavigationBar />
        </Suspense>
        <div className="flex min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
