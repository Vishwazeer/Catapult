"use client";

import React, { useState } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const LEAD_PHASES = [
  { id: "Incoming", label: "Incoming", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "Engaged", label: "Engaged", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { id: "Meeting", label: "Meeting", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "Proposal", label: "Proposal", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { id: "Converted", label: "Converted", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { id: "Closed", label: "Closed", color: "bg-rose-100 text-rose-800 border-rose-200" },
] as const;

export type PhaseType = (typeof LEAD_PHASES)[number]["id"];

interface PhaseSelectorProps {
  leadId: number;
  currentPhase?: string | null;
  onPhaseChange?: (newPhase: string) => void;
  size?: "sm" | "md";
}

export default function PhaseSelector({
  leadId,
  currentPhase = "Incoming",
  onPhaseChange,
  size = "sm",
}: PhaseSelectorProps) {
  const [phase, setPhase] = useState<string>(currentPhase || "Incoming");
  const [updating, setUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const activePhaseObj = LEAD_PHASES.find((p) => p.id === phase) || LEAD_PHASES[0];

  const handleSelect = async (newPhase: string) => {
    if (newPhase === phase || updating) return;
    setUpdating(true);
    setIsOpen(false);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: newPhase }),
      });
      if (res.ok) {
        setPhase(newPhase);
        if (onPhaseChange) onPhaseChange(newPhase);
      }
    } catch (err) {
      console.error("Failed to update phase:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={updating}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-semibold border transition-all shadow-xs hover:opacity-90 cursor-pointer",
          size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
          activePhaseObj.color
        )}
      >
        {updating ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <span>{activePhaseObj.label}</span>
        )}
        <ChevronDown className="w-3 h-3 opacity-70" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[990]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1.5 w-40 rounded-2xl bg-white border border-[#EADFD5] shadow-2xl z-[999] py-1.5 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-3.5 py-1 text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider border-b border-[#EADFD5]">
              STAGE
            </div>
            {LEAD_PHASES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelect(p.id)}
                className={cn(
                  "w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#FAF6F1] transition-colors font-medium",
                  p.id === phase ? "font-extrabold text-stone-900 bg-[#FAF6F1]" : "text-stone-700"
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      p.id === "Incoming" && "bg-blue-500",
                      p.id === "Engaged" && "bg-amber-500",
                      p.id === "Meeting" && "bg-purple-500",
                      p.id === "Proposal" && "bg-orange-500",
                      p.id === "Converted" && "bg-emerald-500",
                      p.id === "Closed" && "bg-rose-500"
                    )}
                  />
                  {p.label}
                </span>
                {p.id === phase && <Check className="w-3.5 h-3.5 text-[#059669]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
