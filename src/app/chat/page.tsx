"use client";

import LeadSelectorLayout from "@/components/lead-selector-layout";
import { MessageSquare } from "lucide-react";
import { Suspense } from "react";

function ChatPageContent() {
  return (
    <LeadSelectorLayout
      feature="chat"
      title="Interactive Lead Assistant"
      subtitle="Context-grounded conversational AI powered by Groq"
      icon={MessageSquare}
    />
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageContent />
    </Suspense>
  );
}
