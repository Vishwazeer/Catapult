"use client";

import LeadSelectorLayout from "@/components/lead-selector-layout";
import { Brain } from "lucide-react";
import { Suspense } from "react";

function AnalysisPageContent() {
  return (
    <LeadSelectorLayout
      feature="analysis"
      title="AI Lead Intent & Analysis"
      subtitle="Structured intent extraction, quality scoring, and objection mapping"
      icon={Brain}
    />
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={null}>
      <AnalysisPageContent />
    </Suspense>
  );
}
