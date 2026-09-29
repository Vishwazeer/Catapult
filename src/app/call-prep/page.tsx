"use client";

import LeadSelectorLayout from "@/components/lead-selector-layout";
import { MessageCircle } from "lucide-react";
import { Suspense } from "react";

function CallPrepPageContent() {
  return (
    <LeadSelectorLayout
      feature="callprep"
      title="WhatsApp Chat Simulator & Follow-up Evaluator"
      subtitle="Interactive WhatsApp-style simulator powered by Grok roleplay and separate lead re-evaluator"
      icon={MessageCircle}
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
