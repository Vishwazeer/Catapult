"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar";
import AnalysisDisplay from "@/components/analysis-display";
import LeadChat from "@/components/lead-chat";
import CallPrep from "@/components/call-prep";
import {
  Loader2,
  ArrowLeft,
  User,
  MapPin,
  Building2,
  IndianRupee,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  Brain,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LeadData {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  location: string;
  propertyType: string;
  bhkConfig: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  buyingTimeline: string;
  loanReady: string | null;
  occupancyType: string | null;
  possessionPreference: string | null;
  customerMessage: string;
  source: string | null;
  createdAt: string;
  preferredAmenities: string[] | null;
  mustHaveFeatures: string | null;
  dealBreakers: string | null;
  sqftMin: number | null;
  sqftMax: number | null;
  preferredFloor: string | null;
  facingDirection: string | null;
  maxLoanAmount: number | null;
  creditScoreRange: string | null;
  downPaymentAvailable: number | null;
  propertyRequirement: string | null;
}

interface AnalysisData {
  summary: string;
  intent: string;
  keyRequirements: string[];
  objectionsAndConcerns: string[];
  recommendedNextAction: string;
  suggestedResponse: string;
  score: number;
  tag: string;
  reasoning: string;
  callPrepQuestions: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type TabType = "analysis" | "chat" | "callprep";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = Number(params.id);

  const [lead, setLead] = useState<LeadData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("analysis");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data.lead);
        setAnalysis(data.analysis);
        setChatMessages(data.chatMessages || []);
      }
    } catch (err) {
      console.error("Failed to fetch lead:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
      router.push("/");
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 ml-[260px] p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </main>
      </>
    );
  }

  if (!lead) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 ml-[260px] p-8 flex flex-col items-center justify-center">
          <p className="text-ink-muted mb-4">Lead not found</p>
          <Link href="/" className="btn-secondary">
            Back to Dashboard
          </Link>
        </main>
      </>
    );
  }

  const tabs = [
    { id: "analysis" as TabType, label: "AI Analysis", icon: Brain },
    { id: "chat" as TabType, label: "Lead Chat", icon: MessageSquare },
    { id: "callprep" as TabType, label: "Call Prep", icon: Sparkles },
  ];

  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-[260px] p-8">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-md text-ink-subtle hover:text-ink hover:bg-surface-1 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink tracking-wide">
                {lead.name}
              </h1>
              <div className="flex items-center gap-3 text-sm text-ink-muted mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {lead.location}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {lead.propertyType}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(lead.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-md text-ink-subtle hover:text-hot hover:bg-hot/10 transition-all"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </motion.div>

        {/* Lead Info Summary Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 mb-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            {lead.phone && (
              <div>
                <span className="text-xs text-ink-subtle block">Phone</span>
                <span className="text-ink flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-ink-subtle" />
                  {lead.phone}
                </span>
              </div>
            )}
            {lead.email && (
              <div>
                <span className="text-xs text-ink-subtle block">Email</span>
                <span className="text-ink flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-ink-subtle" />
                  {lead.email}
                </span>
              </div>
            )}
            <div>
              <span className="text-xs text-ink-subtle block">Budget</span>
              <span className="text-ink flex items-center gap-1 mt-0.5">
                <IndianRupee className="w-3 h-3 text-ink-subtle" />
                {lead.budgetMin ? formatCurrency(lead.budgetMin) : "N/A"}
                {lead.budgetMin && lead.budgetMax ? " – " : ""}
                {lead.budgetMax ? formatCurrency(lead.budgetMax) : ""}
              </span>
            </div>
            <div>
              <span className="text-xs text-ink-subtle block">Timeline</span>
              <span className="text-ink mt-0.5 block">{lead.buyingTimeline}</span>
            </div>
            {lead.bhkConfig && (
              <div>
                <span className="text-xs text-ink-subtle block">Config</span>
                <span className="text-ink mt-0.5 block">{lead.bhkConfig}</span>
              </div>
            )}
            {lead.source && (
              <div>
                <span className="text-xs text-ink-subtle block">Source</span>
                <span className="text-ink mt-0.5 block capitalize">
                  {lead.source}
                </span>
              </div>
            )}
          </div>
          {lead.customerMessage && (
            <div className="mt-4 pt-4 border-t border-hairline">
              <span className="text-xs text-ink-subtle block mb-1">
                Customer Message
              </span>
              <p className="text-sm text-ink-muted leading-relaxed">
                {lead.customerMessage}
              </p>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-surface-1 rounded-lg p-1 border border-hairline w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-primary/15 text-primary-hover"
                  : "text-ink-muted hover:text-ink hover:bg-surface-2"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "analysis" && analysis && (
          <AnalysisDisplay analysis={analysis} />
        )}

        {activeTab === "chat" && (
          <LeadChat leadId={leadId} initialMessages={chatMessages} />
        )}

        {activeTab === "callprep" && analysis && (
          <CallPrep
            leadId={leadId}
            leadName={lead.name}
            leadLocation={lead.location}
            leadPropertyType={lead.propertyType}
            leadBhk={lead.bhkConfig || undefined}
            leadBudgetMax={lead.budgetMax || undefined}
            callPrepQuestions={analysis.callPrepQuestions}
          />
        )}
      </main>
    </>
  );
}
