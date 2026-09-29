"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Flame,
  Sun,
  Snowflake,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn, formatCurrency, formatDate, getScoreColor } from "@/lib/utils";
import Link from "next/link";
import { TagBadge } from "@/components/lead-card";

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
  const [showMessageDetails, setShowMessageDetails] = useState(false);

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
        <main className="flex-1 ml-[260px] p-8 flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </main>
      </>
    );
  }

  if (!lead) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 ml-[260px] p-8 flex flex-col items-center justify-center min-h-screen">
          <p className="text-ink-muted mb-4">Lead not found</p>
          <Link href="/" className="btn-secondary">
            Back to Dashboard
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-[260px] p-8 max-w-7xl mx-auto">
        {/* Top Header & Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg border border-hairline bg-surface-1 text-ink-subtle hover:text-ink hover:bg-surface-2 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-3xl font-semibold text-ink tracking-wide">
                  {lead.name}
                </h1>
                {analysis && <TagBadge tag={analysis.tag} />}
              </div>
              <div className="flex items-center gap-4 text-xs text-ink-subtle mt-1">
                <span className="flex items-center gap-1 font-medium text-ink-muted">
                  <MapPin className="w-3.5 h-3.5 text-primary-hover" />
                  {lead.location}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {lead.propertyType} {lead.bhkConfig ? `(${lead.bhkConfig})` : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(lead.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {analysis && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-surface-1 border border-hairline shadow-sm">
                <span className="text-xs text-ink-subtle uppercase tracking-wider font-semibold">
                  AI Score
                </span>
                <span className={cn("font-mono text-2xl font-bold", getScoreColor(analysis.score))}>
                  {analysis.score}
                </span>
              </div>
            )}

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2.5 rounded-xl border border-hairline text-ink-subtle hover:text-hot hover:bg-hot/10 hover:border-hot/30 transition-all"
              title="Delete Lead"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Compact Quick Metadata Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-4 mb-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            {lead.phone && (
              <div>
                <span className="text-[11px] text-ink-subtle block font-medium uppercase tracking-wider">Phone</span>
                <span className="text-ink font-mono mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-ink-subtle" />
                  {lead.phone}
                </span>
              </div>
            )}
            {lead.email && (
              <div>
                <span className="text-[11px] text-ink-subtle block font-medium uppercase tracking-wider">Email</span>
                <span className="text-ink truncate mt-0.5 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-ink-subtle" />
                  {lead.email}
                </span>
              </div>
            )}
            <div>
              <span className="text-[11px] text-ink-subtle block font-medium uppercase tracking-wider">Budget</span>
              <span className="text-primary-hover font-mono font-bold mt-0.5 flex items-center gap-0.5">
                <IndianRupee className="w-3 h-3" />
                {lead.budgetMin ? formatCurrency(lead.budgetMin) : "N/A"}
                {lead.budgetMin && lead.budgetMax ? " – " : ""}
                {lead.budgetMax ? formatCurrency(lead.budgetMax) : ""}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-ink-subtle block font-medium uppercase tracking-wider">Timeline</span>
              <span className="text-ink font-medium mt-0.5 block">{lead.buyingTimeline}</span>
            </div>
            <div>
              <span className="text-[11px] text-ink-subtle block font-medium uppercase tracking-wider">Financing</span>
              <span className="text-ink font-medium mt-0.5 block capitalize">
                {lead.loanReady ? `Loan (${lead.loanReady})` : "Not specified"}
              </span>
            </div>
            {lead.source && (
              <div>
                <span className="text-[11px] text-ink-subtle block font-medium uppercase tracking-wider">Source</span>
                <span className="text-ink font-medium mt-0.5 block capitalize">
                  {lead.source}
                </span>
              </div>
            )}
          </div>

          {/* Expandable Customer Message */}
          {lead.customerMessage && (
            <div className="mt-3 pt-3 border-t border-hairline/60">
              <button
                onClick={() => setShowMessageDetails(!showMessageDetails)}
                className="flex items-center justify-between w-full text-xs text-ink-subtle hover:text-ink transition-colors"
              >
                <span className="font-medium text-ink-muted flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-primary-hover" />
                  Customer Message: &quot;{lead.customerMessage.slice(0, 75)}{lead.customerMessage.length > 75 ? "..." : ""}&quot;
                </span>
                <span className="flex items-center gap-1 text-[11px] text-primary-hover font-medium">
                  {showMessageDetails ? "Hide full message" : "View full message"}
                  {showMessageDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
              </button>

              {showMessageDetails && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2.5 text-xs text-ink-muted leading-relaxed bg-surface-2/60 p-3 rounded-lg border border-hairline/40 italic"
                >
                  &quot;{lead.customerMessage}&quot;
                </motion.p>
              )}
            </div>
          )}
        </motion.div>

        {/* ============================================================ */}
        {/* HERO AI INTELLIGENCE FEATURE SUITE (PROMINENT BOLD FEATURE TABS) */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-ink-subtle uppercase tracking-widest flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary-hover animate-pulse" />
              AI Sales Intelligence Suite
            </h2>
            <span className="text-[11px] text-primary-hover font-semibold bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              Core Product Components
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tab 1: AI Analysis */}
            <button
              onClick={() => setActiveTab("analysis")}
              className={cn(
                "p-4 rounded-xl border text-left transition-all relative overflow-hidden group flex flex-col justify-between h-[95px]",
                activeTab === "analysis"
                  ? "bg-gradient-to-r from-primary/20 via-primary/10 to-surface-2 border-primary shadow-lg shadow-primary/10"
                  : "bg-surface-1 hover:bg-surface-2 border-hairline hover:border-hairline-strong"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                      activeTab === "analysis"
                        ? "bg-primary text-white"
                        : "bg-surface-2 text-primary-hover group-hover:bg-primary/20"
                    )}
                  >
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-ink group-hover:text-primary-hover transition-colors">
                      AI Analysis
                    </h3>
                    <p className="text-[11px] text-ink-subtle">
                      Intent, score & objection map
                    </p>
                  </div>
                </div>
                {analysis && (
                  <span
                    className={cn(
                      "font-mono text-base font-bold px-2 py-0.5 rounded-md bg-surface-2 border border-hairline/60",
                      getScoreColor(analysis.score)
                    )}
                  >
                    {analysis.score}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-hairline/40 text-[11px]">
                <span className="text-ink-subtle">Gemini 2.5 Structured</span>
                <span
                  className={cn(
                    "font-semibold uppercase tracking-wider",
                    activeTab === "analysis" ? "text-primary-hover" : "text-ink-subtle"
                  )}
                >
                  {activeTab === "analysis" ? "Active View →" : "Click to view"}
                </span>
              </div>
            </button>

            {/* Tab 2: Lead Chat */}
            <button
              onClick={() => setActiveTab("chat")}
              className={cn(
                "p-4 rounded-xl border text-left transition-all relative overflow-hidden group flex flex-col justify-between h-[95px]",
                activeTab === "chat"
                  ? "bg-gradient-to-r from-primary/20 via-primary/10 to-surface-2 border-primary shadow-lg shadow-primary/10"
                  : "bg-surface-1 hover:bg-surface-2 border-hairline hover:border-hairline-strong"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                      activeTab === "chat"
                        ? "bg-primary text-white"
                        : "bg-surface-2 text-primary-hover group-hover:bg-primary/20"
                    )}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-ink group-hover:text-primary-hover transition-colors">
                      Lead Chat
                    </h3>
                    <p className="text-[11px] text-ink-subtle">
                      Interactive Groq AI assistant
                    </p>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-hairline/40 text-[11px]">
                <span className="text-ink-subtle">Groq Streaming Chat</span>
                <span
                  className={cn(
                    "font-semibold uppercase tracking-wider",
                    activeTab === "chat" ? "text-primary-hover" : "text-ink-subtle"
                  )}
                >
                  {activeTab === "chat" ? "Active View →" : "Click to chat"}
                </span>
              </div>
            </button>

            {/* Tab 3: Call Prep */}
            <button
              onClick={() => setActiveTab("callprep")}
              className={cn(
                "p-4 rounded-xl border text-left transition-all relative overflow-hidden group flex flex-col justify-between h-[95px]",
                activeTab === "callprep"
                  ? "bg-gradient-to-r from-primary/20 via-primary/10 to-surface-2 border-primary shadow-lg shadow-primary/10"
                  : "bg-surface-1 hover:bg-surface-2 border-hairline hover:border-hairline-strong"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                      activeTab === "callprep"
                        ? "bg-primary text-white"
                        : "bg-surface-2 text-primary-hover group-hover:bg-primary/20"
                    )}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-ink group-hover:text-primary-hover transition-colors">
                      AI Call Prep
                    </h3>
                    <p className="text-[11px] text-ink-subtle">
                      Live property database search
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary-hover border border-primary/30">
                  Custom Feature
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-hairline/40 text-[11px]">
                <span className="text-ink-subtle">Split-panel Inventory</span>
                <span
                  className={cn(
                    "font-semibold uppercase tracking-wider",
                    activeTab === "callprep" ? "text-primary-hover" : "text-ink-subtle"
                  )}
                >
                  {activeTab === "callprep" ? "Active View →" : "Click to prep"}
                </span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Tab Content Display */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
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
        </motion.div>
      </main>
    </>
  );
}
