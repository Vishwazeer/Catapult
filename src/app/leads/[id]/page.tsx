"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar";
import AnalysisDisplay from "@/components/analysis-display";
import LeadChat from "@/components/lead-chat";
import CustomerSimulator from "@/components/customer-simulator";
import PropertyMatches from "@/components/property-matches";
import LeadEditModal from "@/components/lead-edit-modal";
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
  Pencil,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import { cn, formatCurrency, formatDate, getScoreColor } from "@/lib/utils";
import Link from "next/link";
import { TagBadge } from "@/components/lead-card";
import PhaseSelector from "@/components/phase-selector";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [isRescanning, setIsRescanning] = useState(false);

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

  const handleRescan = async () => {
    if (isRescanning) return;
    setIsRescanning(true);
    try {
      await fetch(`/api/leads/${leadId}/analyze`, { method: "POST" });
      await fetchLead();
    } catch (err) {
      console.error("Rescan failed:", err);
    } finally {
      setIsRescanning(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    fetchLead();
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
      <main className="flex-1 ml-[260px] p-6 md:p-10 max-w-7xl mx-auto space-y-6">
        {/* Top Header & Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-stone-900 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <span className="text-stone-300">/</span>
            <span className="font-extrabold text-stone-900">{lead.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-stone-500 hidden sm:inline">
              Lead Record <span className="text-stone-700 font-semibold">#lead_{lead.id}</span>
            </span>
            <PhaseSelector
              leadId={leadId}
              currentPhase={(lead as any).phase || "Incoming"}
              onPhaseChange={(newPhase) => {
                setLead((prev) => prev ? { ...prev, phase: newPhase } as any : null);
              }}
              size="md"
            />
            <Link href="/" className="btn-primary">
              + Add Lead
            </Link>
          </div>
        </motion.div>

        {/* HERO LEAD SUMMARY CARD (IMAGE 1 PARITY) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-6 md:p-8 space-y-6"
        >
          {/* Top metadata tags line */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap font-mono">
              <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200">
                ID: lead_{lead.id}
              </span>
              {analysis && (
                <span className="bg-[#ECFDF5] text-emerald-700 px-3 py-1 rounded-full border border-emerald-200/80 font-bold">
                  AI Analyzed ({analysis.score}/100 • {analysis.tag.toUpperCase()})
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 font-mono text-stone-400 text-xs">
              <span>Created: {formatDate(lead.createdAt)}</span>
              <span>•</span>
              <button
                onClick={() => setShowEditModal(true)}
                className="hover:text-stone-800 transition-colors inline-flex items-center gap-1 text-stone-600 font-sans font-semibold"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Lead
              </button>
            </div>
          </div>

          {/* Lead Title & Location */}
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-stone-900 tracking-tight">
              {lead.name}
            </h1>
            <p className="text-stone-500 mt-1 flex items-center gap-1.5 font-medium text-sm md:text-base">
              <MapPin className="w-4 h-4 text-stone-400" />
              {lead.location}
            </p>
          </div>

          {/* 3-Column Key Intake Metrics Sub-cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="sub-card space-y-2 p-5">
              <span className="section-label">TARGET BUDGET</span>
              <div className="text-xl md:text-2xl font-black text-stone-900 tracking-tight font-mono">
                {lead.budgetMin ? formatCurrency(lead.budgetMin) : "N/A"}
                {lead.budgetMin && lead.budgetMax ? " – " : ""}
                {lead.budgetMax ? formatCurrency(lead.budgetMax) : ""}
              </div>
              <p className="text-xs text-stone-400 font-mono">
                Raw: ₹{lead.budgetMin ? (lead.budgetMin * 100000).toLocaleString('en-IN') : 'N/A'}
              </p>
            </div>

            <div className="sub-card space-y-2 p-5">
              <span className="section-label">BUYING TIMELINE</span>
              <div className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
                {lead.buyingTimeline}
              </div>
              <p className="text-xs text-stone-400 font-mono">
                Key: {lead.buyingTimeline.toLowerCase()}
              </p>
            </div>

            <div className="sub-card space-y-2 p-5">
              <span className="section-label">PROPERTY REQUIREMENT</span>
              <div className="text-base md:text-lg font-extrabold text-stone-900 leading-snug">
                {lead.propertyRequirement || `${lead.propertyType} ${lead.bhkConfig ? `(${lead.bhkConfig})` : ''}`}
              </div>
            </div>
          </div>

          {/* Inbound Customer Message / Conversation Notes */}
          {lead.customerMessage && (
            <div className="space-y-3 pt-2">
              <h3 className="section-label">INBOUND CUSTOMER MESSAGE / CONVERSATION NOTES</h3>
              <div className="sub-card p-5 text-stone-800 text-sm md:text-base leading-relaxed font-normal">
                &quot;{lead.customerMessage}&quot;
              </div>
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

            {/* Tab 3: Customer Simulator */}
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
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-ink group-hover:text-primary-hover transition-colors">
                      WhatsApp Chat Simulator
                    </h3>
                    <p className="text-[11px] text-ink-subtle">
                      WhatsApp follow-up simulator
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary-hover border border-primary/30">
                  Custom Feature
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-hairline/40 text-[11px]">
                <span className="text-ink-subtle">WhatsApp Sim</span>
                <span
                  className={cn(
                    "font-semibold uppercase tracking-wider",
                    activeTab === "callprep" ? "text-primary-hover" : "text-ink-subtle"
                  )}
                >
                  {activeTab === "callprep" ? "Active View →" : "Click to simulate"}
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
          className="mb-8"
        >
          {activeTab === "analysis" && analysis && (
            <AnalysisDisplay
              analysis={analysis}
              leadPhone={lead.phone}
              leadEmail={lead.email}
            />
          )}

          {activeTab === "chat" && (
            <LeadChat leadId={leadId} initialMessages={chatMessages} />
          )}

          {activeTab === "callprep" && analysis && (
            <CustomerSimulator
              leadId={leadId}
              leadName={lead.name}
              leadPhone={lead.phone}
              leadEmail={lead.email}
              leadLocation={lead.location}
              leadPropertyType={lead.propertyType}
              leadBhk={lead.bhkConfig || undefined}
              leadBudgetMax={lead.budgetMax || undefined}
              callPrepQuestions={analysis.callPrepQuestions}
            />
          )}
        </motion.div>

        {/* Relevant Property Matches Section */}
        <div className="mt-8">
          <PropertyMatches
            leadName={lead.name}
            leadPhone={lead.phone}
            leadLocation={lead.location}
            leadPropertyType={lead.propertyType}
            leadBhk={lead.bhkConfig || undefined}
            leadBudgetMax={lead.budgetMax || undefined}
          />
        </div>

        {/* Lead Edit Modal */}
        {showEditModal && (
          <LeadEditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleEditSuccess}
            leadId={leadId}
            leadData={lead}
          />
        )}
      </main>
    </>
  );
}
