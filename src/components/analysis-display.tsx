"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Target,
  MessageSquare,
  Brain,
  Phone,
  Copy,
  Check,
  Lightbulb,
  Shield,
  TrendingUp,
} from "lucide-react";
import { cn, getScoreColor } from "@/lib/utils";
import MessageActionButtons from "./message-action-buttons";

interface AnalysisDisplayProps {
  leadPhone?: string | null;
  leadEmail?: string | null;
  analysis: {
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
  };
}

export default function AnalysisDisplay({ analysis, leadPhone, leadEmail }: AnalysisDisplayProps) {
  const isHot = analysis.tag === "hot";
  const isWarm = analysis.tag === "warm";

  return (
    <div className="space-y-6">
      {/* 1. HERO AI LEAD ANALYSIS & SCORING CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-6 md:p-8 space-y-6"
      >
        {/* Header line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EADFD5]/70">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-stone-700 uppercase tracking-wider">
              AI LEAD ANALYSIS & SCORING
            </span>
            <span>•</span>
            <span>Analyzed recently</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
                {analysis.score}
              </span>
              <span className="text-sm font-semibold text-stone-400">/ 100</span>
            </div>
            <span className={cn(isHot ? "tag-hot" : isWarm ? "tag-warm" : "tag-cold")}>
              {analysis.tag.toUpperCase()}
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">
            Sales Readiness Score
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-mono">
            Explainable, deterministic heuristic derived from AI intent extraction and intake parameters.
          </p>
        </div>

        {/* Deterministic Score Breakdown Grid */}
        <div className="space-y-3 pt-2">
          <h3 className="section-label">DETERMINISTIC SCORE BREAKDOWN</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div className="sub-card flex flex-col justify-between p-3.5">
              <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">INTENT</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xs font-extrabold text-stone-900">HIGH</span>
                <span className="text-xs font-mono font-bold text-emerald-600">+30</span>
              </div>
            </div>

            <div className="sub-card flex flex-col justify-between p-3.5">
              <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">TIMELINE</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xs font-extrabold text-stone-900 truncate">0–3 months</span>
                <span className="text-xs font-mono font-bold text-emerald-600">+25</span>
              </div>
            </div>

            <div className="sub-card flex flex-col justify-between p-3.5">
              <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">BUDGET</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xs font-extrabold text-stone-900">Valid</span>
                <span className="text-xs font-mono font-bold text-emerald-600">+15</span>
              </div>
            </div>

            <div className="sub-card flex flex-col justify-between p-3.5">
              <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">CLARITY</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xs font-extrabold text-stone-900">CLEAR</span>
                <span className="text-xs font-mono font-bold text-emerald-600">+15</span>
              </div>
            </div>

            <div className="sub-card flex flex-col justify-between p-3.5">
              <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">ENGAGEMENT</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xs font-extrabold text-stone-900">HIGH</span>
                <span className="text-xs font-mono font-bold text-emerald-600">+15</span>
              </div>
            </div>
          </div>
        </div>

        {/* Why Priority Chips */}
        <div className="space-y-3 pt-2">
          <h3 className="section-label">WHY THIS LEAD IS PRIORITIZED:</h3>
          <div className="flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#E6F4EA] text-emerald-800 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              High intent
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#E6F4EA] text-emerald-800 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Valid budget
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#E6F4EA] text-emerald-800 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Clear requirements
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#E6F4EA] text-emerald-800 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              High engagement
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#E6F4EA] text-emerald-800 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              0–3 month timeline
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. LEAD SUMMARY & CUSTOMER INTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card p-6 md:p-8 flex flex-col justify-between"
        >
          <div>
            <h3 className="section-label mb-3">LEAD SUMMARY</h3>
            <p className="text-sm md:text-base text-stone-700 leading-relaxed font-normal">
              {analysis.summary}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="glass-card p-6 md:p-8 flex flex-col justify-between"
        >
          <div>
            <h3 className="section-label mb-3">CUSTOMER INTENT</h3>
            <p className="text-sm md:text-base text-stone-700 leading-relaxed font-normal">
              {analysis.intent}
            </p>
          </div>
        </motion.div>
      </div>

      {/* 3. KEY REQUIREMENTS & OBJECTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card p-6 md:p-8"
        >
          <h3 className="section-label mb-4">KEY REQUIREMENTS</h3>
          <ul className="space-y-3">
            {analysis.keyRequirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-stone-800 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="glass-card p-6 md:p-8"
        >
          <h3 className="section-label mb-4 text-amber-700">OBJECTIONS / IDENTIFIED CONSTRAINTS</h3>
          {analysis.objectionsAndConcerns.length > 0 ? (
            <ul className="space-y-3">
              {analysis.objectionsAndConcerns.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-amber-900 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-500 italic">No major objections identified.</p>
          )}
        </motion.div>
      </div>

      {/* 4. RECOMMENDED NEXT ACTION & SUGGESTED RESPONSE */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass-card p-6 md:p-8 space-y-6"
      >
        <div>
          <h3 className="section-label text-emerald-700 mb-3">RECOMMENDED NEXT ACTION</h3>
          <div className="bg-[#ECFDF5] border border-emerald-200/80 rounded-2xl p-5">
            <p className="text-sm md:text-base text-emerald-950 font-semibold leading-relaxed">
              {analysis.recommendedNextAction}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-label">SUGGESTED SALESPERSON RESPONSE</h3>
          </div>
          <div className="sub-card space-y-4">
            <p className="text-sm text-stone-800 leading-relaxed font-normal whitespace-pre-wrap">
              {analysis.suggestedResponse}
            </p>
            <div className="pt-3 border-t border-[#EADFD5]">
              <MessageActionButtons
                text={analysis.suggestedResponse}
                phone={leadPhone}
                email={leadEmail}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 5. CALL PREP QUESTIONS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="glass-card p-6 md:p-8"
      >
        <h3 className="section-label mb-4">CALL PREPARATION QUESTIONS</h3>
        <ol className="space-y-3">
          {analysis.callPrepQuestions.map((q, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-stone-800">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-100 border border-stone-200 text-stone-700 font-mono text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="pt-0.5 font-medium">{q}</span>
            </li>
          ))}
        </ol>
      </motion.div>
    </div>
  );
}


