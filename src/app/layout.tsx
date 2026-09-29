import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catapult — AI Lead Prioritization",
  description:
    "AI-powered lead prioritization for real-estate sales teams. Analyze, prioritize, and act on inbound leads in seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-canvas text-ink">
        <div className="flex min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
