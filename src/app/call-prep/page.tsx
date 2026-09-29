"use client";

import LeadSelectorLayout from "@/components/lead-selector-layout";
import { Sparkles } from "lucide-react";
import { Suspense } from "react";

function CallPrepPageContent() {
  return (
    <LeadSelectorLayout
      feature="callprep"
      title="AI Call Prep & Inventory Matcher"
      subtitle="Real-time property database recommendations and pre-call qualification checklist"
      icon={Sparkles}
    />
  );
}

export default function CallPrepPage() {
  return (
    <Suspense fallback={null}>
      <CallPrepPageContent />
    </Suspense>
  );
}
