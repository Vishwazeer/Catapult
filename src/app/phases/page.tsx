"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/sidebar";
import PhaseSelector, { LEAD_PHASES } from "@/components/phase-selector";
import {
  Kanban,
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  Loader2,
  RefreshCw,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import { cn, formatCurrency, getScoreColor } from "@/lib/utils";
import Link from "next/link";
import { TagBadge } from "@/components/lead-card";

interface Lead {
  id: number;
  name: string;
  location: string;
  propertyType: string;
  bhkConfig?: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  buyingTimeline: string;
  phase?: string | null;
  createdAt: string;
}

interface Analysis {
  summary: string;
  score: number;
  tag: string;
  intent: string;
}

interface LeadWithAnalysis {
  lead: Lead;
  analysis: Analysis | null;
}

export default function PhasesPage() {
  const [leadsData, setLeadsData] = useState<LeadWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLeadIds, setExpandedLeadIds] = useState<number[]>([]);

  const fetchLeads = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeadsData(data.leads || []);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(true);
  }, []);

  const handlePhaseChange = (leadId: number, newPhase: string) => {
    setLeadsData((prev) =>
      prev.map((item) =>
        item.lead.id === leadId
          ? { ...item, lead: { ...item.lead, phase: newPhase } }
          : item
      )
    );
  };

  const toggleExpand = (leadId: number) => {
    setExpandedLeadIds((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-[260px] p-8 min-h-screen bg-slate-50/50">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center border border-emerald-200">
                <Kanban className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">
                  Phases
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Vertical list view of clients grouped across 6 stages
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchLeads(true)}
              className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all shadow-xs"
              title="Refresh Phases"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              {leadsData.length} Total Clients
            </span>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : (
          /* Vertical Stack of Stage Sections */
          <div className="space-y-6 max-w-5xl">
            {LEAD_PHASES.map((phaseObj) => {
              const phaseLeads = leadsData.filter(
                (item) => (item.lead.phase || "Incoming") === phaseObj.id
              );

              return (
                <div
                  key={phaseObj.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4"
                >
                  {/* Stage Section Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold border",
                          phaseObj.color
                        )}
                      >
                        {phaseObj.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {phaseLeads.length} {phaseLeads.length === 1 ? "Client" : "Clients"}
                      </span>
                    </div>
                  </div>

                  {/* Stage Client List */}
                  <div className="space-y-2.5">
                    {phaseLeads.map(({ lead, analysis }) => {
                      const isExpanded = expandedLeadIds.includes(lead.id);

                      return (
                        <div
                          key={lead.id}
                          className="border border-[#EADFD5] hover:border-emerald-500/60 rounded-2xl bg-white hover:bg-[#FAF6F1]/50 transition-all relative z-10 hover:z-30"
                        >
                          {/* Primary List Row */}
                          <div
                            onClick={() => toggleExpand(lead.id)}
                            className="p-3.5 flex items-center justify-between gap-4 cursor-pointer select-none"
                          >
                            {/* Left: Chevron + Name + Intent Tag */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <button
                                type="button"
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>

                              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                <User className="w-4 h-4" />
                              </div>

                              <Link
                                href={`/leads/${lead.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition-colors truncate"
                              >
                                {lead.name}
                              </Link>

                              {analysis ? (
                                <TagBadge tag={analysis.tag} />
                              ) : (
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 shrink-0">
                                  <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                                  Scanning
                                </span>
                              )}
                            </div>

                            {/* Right: Score Pill + Phase Dropdown Selector */}
                            <div
                              className="flex items-center gap-3 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {analysis && (
                                <span
                                  className={cn(
                                    "font-mono text-xs font-bold px-2.5 py-1 rounded-md border bg-white border-slate-200",
                                    getScoreColor(analysis.score)
                                  )}
                                >
                                  {analysis.score} / 100
                                </span>
                              )}

                              <PhaseSelector
                                leadId={lead.id}
                                currentPhase={lead.phase || "Incoming"}
                                onPhaseChange={(newP) => handlePhaseChange(lead.id, newP)}
                                size="sm"
                              />

                              <Link
                                href={`/leads/${lead.id}`}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="View Full Lead Details"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>

                          {/* Collapsible Hidden Details Drawer */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-slate-200/60 bg-white p-4 space-y-3 text-xs"
                              >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
                                  <div className="flex items-center gap-1.5 font-medium">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Location: {lead.location}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 font-medium">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>
                                      {lead.propertyType} {lead.bhkConfig ? `(${lead.bhkConfig})` : ""}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-700">
                                    <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                                    <span>
                                      {lead.budgetMin ? formatCurrency(lead.budgetMin) : "N/A"}
                                      {lead.budgetMin && lead.budgetMax ? " – " : ""}
                                      {lead.budgetMax ? formatCurrency(lead.budgetMax) : ""}
                                    </span>
                                  </div>
                                </div>

                                {analysis && (
                                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                                    {analysis.summary}
                                  </p>
                                )}

                                <div className="flex justify-end pt-1">
                                  <Link
                                    href={`/leads/${lead.id}`}
                                    className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                                  >
                                    Open Full Lead Profile →
                                  </Link>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}

                    {phaseLeads.length === 0 && (
                      <div className="py-5 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        No clients currently in {phaseObj.label}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
