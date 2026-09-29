"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  CheckSquare,
  Square,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { cn, getScoreColor } from "@/lib/utils";
import Link from "next/link";
import { TagBadge } from "./lead-card";

interface LeadItem {
  lead: {
    id: number;
    name: string;
    location: string;
    propertyType: string;
    bhkConfig?: string | null;
    budgetMax?: number | null;
  };
  analysis: {
    score: number;
    tag: string;
    intent: string;
    recommendedNextAction?: string;
    callPrepQuestions?: string[];
  } | null;
}

interface BulkNudgeSectionProps {
  leads: LeadItem[];
  onNudgeComplete?: () => void;
}

export default function BulkNudgeSection({ leads, onNudgeComplete }: BulkNudgeSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sentLeadIds, setSentLeadIds] = useState<number[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    // Default select all analyzed leads with questions
    return leads
      .filter((item) => item.analysis && (item.analysis.callPrepQuestions?.length || item.analysis.recommendedNextAction))
      .slice(0, 5)
      .map((item) => item.lead.id);
  });

  // Filter leads that have analysis questions
  const eligibleLeads = leads.filter(
    (item) => item.analysis && (item.analysis.callPrepQuestions?.length || item.analysis.recommendedNextAction)
  );

  if (eligibleLeads.length === 0) return null;

  const toggleSelectAll = () => {
    if (selectedIds.length === eligibleLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleLeads.map((item) => item.lead.id));
    }
  };

  const toggleLead = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getQuestionForLead = (item: LeadItem) => {
    if (item.analysis?.callPrepQuestions && item.analysis.callPrepQuestions.length > 0) {
      return item.analysis.callPrepQuestions[0];
    }
    if (item.analysis?.recommendedNextAction) {
      return item.analysis.recommendedNextAction;
    }
    return `Hi ${item.lead.name}, following up on your ${item.lead.propertyType} inquiry in ${item.lead.location}. Would you like to review new options?`;
  };

  const handleSendNudges = async () => {
    if (selectedIds.length === 0 || isSending) return;
    setIsSending(true);

    const newlySent: number[] = [];

    for (const leadId of selectedIds) {
      const item = eligibleLeads.find((l) => l.lead.id === leadId);
      if (!item) continue;
      const question = getQuestionForLead(item);

      try {
        // Send nudge to simulation history
        await fetch(`/api/leads/${leadId}/simulate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question }),
        });
        newlySent.push(leadId);
        setSentLeadIds((prev) => [...new Set([...prev, leadId])]);
      } catch (err) {
        console.error(`Failed to send nudge for lead ${leadId}:`, err);
      }
    }

    setIsSending(false);
    if (onNudgeComplete) onNudgeComplete();
  };

  const isAllSelected = selectedIds.length === eligibleLeads.length && eligibleLeads.length > 0;

  return (
    <div className="bg-white border border-[#EADFD5] rounded-3xl shadow-sm mb-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-[#FAF6F1] border-b border-[#EADFD5]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-stone-900 text-base tracking-tight">
                AI Follow-up Nudge Center
              </h3>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-stone-700 border border-[#EADFD5]">
                Bulk Action
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Re-engage inactive leads with personalized questions tailored by AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-white transition-all border border-[#EADFD5]"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-5 space-y-5"
          >
            {/* Control Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#EADFD5]">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-xs font-bold text-stone-800 hover:text-stone-950 transition-colors"
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Square className="w-4 h-4 text-stone-400" />
                )}
                <span>Select All ({eligibleLeads.length} leads)</span>
              </button>

              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-stone-600">
                  <strong className="text-stone-900 font-extrabold">{selectedIds.length}</strong> selected
                </span>
                <button
                  onClick={handleSendNudges}
                  disabled={selectedIds.length === 0 || isSending}
                  className="btn-primary px-5 py-2 text-xs"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Nudges...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Follow-Up Nudges ({selectedIds.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Leads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eligibleLeads.map((item) => {
                const isSelected = selectedIds.includes(item.lead.id);
                const isSent = sentLeadIds.includes(item.lead.id);
                const question = getQuestionForLead(item);

                return (
                  <div
                    key={item.lead.id}
                    onClick={() => toggleLead(item.lead.id)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group text-left",
                      isSelected
                        ? "bg-[#ECFDF5]/70 border-2 border-[#059669] shadow-xs"
                        : "bg-white border-[#EADFD5] hover:bg-[#FAF6F1]/50 shadow-xs",
                      isSent && "border-emerald-500/40 bg-emerald-50/20"
                    )}
                  >
                    <div>
                      {/* Top Row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLead(item.lead.id);
                            }}
                            className="text-[#059669]"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#059669]" />
                            ) : (
                              <Square className="w-4 h-4 text-stone-300" />
                            )}
                          </button>
                          <span className="text-sm font-black text-stone-900 tracking-tight line-clamp-1">
                            {item.lead.name}
                          </span>
                        </div>
                        {item.analysis && <TagBadge tag={item.analysis.tag} />}
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-3 text-xs text-stone-500 font-medium mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {item.lead.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-stone-400" />
                          {item.lead.propertyType} {item.lead.bhkConfig ? `(${item.lead.bhkConfig})` : ""}
                        </span>
                      </div>

                      {/* Nudge Box */}
                      <div className="bg-white p-3 rounded-xl border border-[#EADFD5] space-y-1.5 mb-3">
                        <span className="section-label text-[9px]">PERSONALIZED NUDGE:</span>
                        <p className="text-xs text-stone-800 italic leading-relaxed">
                          &quot;{question}&quot;
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between border-t border-[#EADFD5] pt-2.5 text-xs font-mono">
                      {isSent ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sent to simulator
                        </span>
                      ) : (
                        <span className="text-stone-400">Ready to send</span>
                      )}

                      <Link
                        href={`/call-prep?leadId=${item.lead.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-stone-700 hover:text-stone-950 font-bold flex items-center gap-1 transition-colors"
                      >
                        Simulator <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
