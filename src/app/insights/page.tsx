"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar";
import {
  BarChart3,
  Loader2,
  RefreshCw,
  TrendingUp,
  MapPin,
  Flame,
  Sun,
  Snowflake,
  AlertCircle,
  Building2,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Lead {
  id: number;
  name: string;
  location: string;
  propertyType: string;
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

const STAGES = ["Incoming", "Engaged", "Meeting", "Proposal", "Converted", "Closed"] as const;

export default function InsightsPage() {
  const [leadsData, setLeadsData] = useState<LeadWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Compute Metrics matching the reference design
  const totalLeads = leadsData.length;
  
  const openLeads = leadsData.filter(
    (item) => (item.lead.phase || "Incoming") !== "Converted" && (item.lead.phase || "Incoming") !== "Closed"
  );
  
  const wonLeads = leadsData.filter((item) => item.lead.phase === "Converted").length;
  const lostLeads = leadsData.filter((item) => item.lead.phase === "Closed").length;
  const closedLeads = wonLeads + lostLeads;
  const winRate = closedLeads > 0 ? Math.round((wonLeads / closedLeads) * 100) : 0;

  const leadsWithoutBudget = openLeads.filter(
    (item) => !item.lead.budgetMin && !item.lead.budgetMax
  ).length;

  const openPipelineValue = openLeads.reduce((acc, item) => {
    const val = item.lead.budgetMax || item.lead.budgetMin || 0;
    return acc + val;
  }, 0);

  const overdueFollowups = leadsData.filter((item) => {
    const phase = item.lead.phase || "Incoming";
    return phase === "Incoming" || phase === "Engaged";
  }).length;

  const scoredLeads = leadsData.filter((item) => item.analysis !== null);
  const avgScore =
    scoredLeads.length > 0
      ? Math.round(
          scoredLeads.reduce((acc, item) => acc + (item.analysis?.score || 0), 0) /
            scoredLeads.length
        )
      : 0;

  // Pipeline by stage breakdown
  const maxStageCount = Math.max(
    ...STAGES.map((s) => leadsData.filter((l) => (l.lead.phase || "Incoming") === s).length),
    1
  );

  const stageBreakdown = STAGES.map((stage) => {
    const stageItems = leadsData.filter((l) => (l.lead.phase || "Incoming") === stage);
    const count = stageItems.length;
    const scoredInStage = stageItems.filter((l) => l.analysis !== null);
    const stageAvgScore =
      scoredInStage.length > 0
        ? Math.round(
            scoredInStage.reduce((acc, l) => acc + (l.analysis?.score || 0), 0) /
              scoredInStage.length
          )
        : null;

    return {
      stage,
      count,
      avgScore: stageAvgScore,
      percentage: (count / maxStageCount) * 100,
    };
  });

  // Priority mix breakdown
  const hotCount = leadsData.filter((l) => l.analysis?.tag === "hot").length;
  const warmCount = leadsData.filter((l) => l.analysis?.tag === "warm").length;
  const coldCount = leadsData.filter((l) => l.analysis?.tag === "cold").length;
  const notScoredCount = leadsData.filter((l) => !l.analysis).length;

  const hotPct = totalLeads > 0 ? (hotCount / totalLeads) * 100 : 0;
  const warmPct = totalLeads > 0 ? (warmCount / totalLeads) * 100 : 0;
  const coldPct = totalLeads > 0 ? (coldCount / totalLeads) * 100 : 0;
  const notScoredPct = totalLeads > 0 ? (notScoredCount / totalLeads) * 100 : 0;

  // Top cities breakdown
  const cityMap = new Map<string, { count: number; hotCount: number }>();
  leadsData.forEach(({ lead, analysis }) => {
    const rawCity = lead.location || "Unknown";
    // Clean city name (e.g., "Sector 54, Gurugram" -> "Gurugram")
    const parts = rawCity.split(",");
    const city = (parts[parts.length - 1] || rawCity).trim();

    const current = cityMap.get(city) || { count: 0, hotCount: 0 };
    current.count += 1;
    if (analysis?.tag === "hot") {
      current.hotCount += 1;
    }
    cityMap.set(city, current);
  });

  const cityList = Array.from(cityMap.entries())
    .map(([city, data]) => ({ city, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-[260px] p-8 min-h-screen bg-slate-50/50">
        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center border border-emerald-200">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">
                  Insights
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Pipeline health for the {totalLeads} leads in this workspace. Calculated live.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchLeads(true)}
              className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all shadow-xs"
              title="Refresh Insights"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              Live Pipeline Metrics
            </span>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* 5 KPI Metric Cards Row (matching reference layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Card 1: Open Leads */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    OPEN LEADS
                  </span>
                  <span className="font-mono text-3xl font-bold text-slate-900 block mt-1">
                    {openLeads.length}
                  </span>
                </div>
                <span className="text-xs text-slate-500 mt-3 block">
                  {totalLeads} total
                </span>
              </motion.div>

              {/* Card 2: Open Pipeline */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    OPEN PIPELINE
                  </span>
                  <span className="font-mono text-3xl font-bold text-slate-900 block mt-1">
                    {formatCurrency(openPipelineValue)}
                  </span>
                </div>
                <span className="text-xs text-slate-500 mt-3 block truncate">
                  Sum of stated budgets · {leadsWithoutBudget} unpriced
                </span>
              </motion.div>

              {/* Card 3: Win Rate */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    WIN RATE
                  </span>
                  <span className="font-mono text-3xl font-bold text-slate-900 block mt-1">
                    {winRate}%
                  </span>
                </div>
                <span className="text-xs text-slate-500 mt-3 block">
                  {wonLeads} won · {lostLeads} lost
                </span>
              </motion.div>

              {/* Card 4: Overdue Follow-ups */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    OVERDUE FOLLOW-UPS
                  </span>
                  <span className="font-mono text-3xl font-bold text-slate-900 block mt-1">
                    {overdueFollowups}
                  </span>
                </div>
                <span className="text-xs text-slate-500 mt-3 block">
                  Work these first
                </span>
              </motion.div>

              {/* Card 5: Average AI Score */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    AVG AI SCORE
                  </span>
                  <span className="font-mono text-3xl font-bold text-emerald-700 block mt-1">
                    {avgScore} <span className="text-xs font-normal text-slate-400">/100</span>
                  </span>
                </div>
                <span className="text-xs text-slate-500 mt-3 block">
                  Across {scoredLeads.length} scored leads
                </span>
              </motion.div>
            </div>

            {/* Main Content Grid: 2 Columns (Matching Reference Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Pipeline by stage (7 cols) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Pipeline by stage
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lead count per status, with the average AI score in that stage.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {stageBreakdown.map((st) => (
                    <div key={st.stage} className="flex items-center gap-4 text-xs">
                      {/* Stage Name */}
                      <span className="w-24 font-medium text-slate-700 shrink-0">
                        {st.stage}
                      </span>

                      {/* Progress Bar Container */}
                      <div className="flex-1 bg-slate-100 h-6 rounded-lg overflow-hidden relative p-0.5">
                        {st.count > 0 && (
                          <div
                            className="bg-emerald-700 h-full rounded-md transition-all duration-500"
                            style={{ width: `${Math.max(st.percentage, 8)}%` }}
                          />
                        )}
                      </div>

                      {/* Score / Count Label */}
                      <div className="w-20 text-right font-mono text-slate-600 shrink-0">
                        {st.count > 0 ? (
                          <span>
                            <strong className="text-slate-900 font-bold">{st.count}</strong>
                            {st.avgScore !== null && (
                              <span className="text-slate-400 text-[11px] ml-1">
                                · avg {st.avgScore}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right Column: Top Cities */}
              <div className="lg:col-span-6 space-y-6">

                {/* Right Bottom Card: Top Cities */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4"
                >
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Top cities
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Geographic distribution of leads and high-intent buyers.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5 px-2">CITY</th>
                          <th className="py-2.5 px-2 text-right">LEADS</th>
                          <th className="py-2.5 px-2 text-right">HIGH INTENT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {cityList.map((item) => (
                          <tr key={item.city} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-2 font-medium text-slate-900 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {item.city}
                            </td>
                            <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">
                              {item.count}
                            </td>
                            <td className="py-3 px-2 text-right font-mono font-bold text-rose-600">
                              {item.hotCount}
                            </td>
                          </tr>
                        ))}
                        {cityList.length === 0 && (
                          <tr>
                            <td colSpan={3} className="py-6 text-center text-slate-400">
                              No geographic data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
