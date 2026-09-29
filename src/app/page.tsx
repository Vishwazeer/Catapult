"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/sidebar";
import LeadCard, { TagBadge } from "@/components/lead-card";
import {
  Flame,
  Sun,
  Snowflake,
  Users,
  TrendingUp,
  Loader2,
  Plus,
  LayoutGrid,
  List,
  Search,
  Sparkles,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { cn, getScoreColor, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import LeadEditModal from '@/components/lead-edit-modal';
import BulkNudgeSection from '@/components/bulk-nudge-section';

interface Lead {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  location: string;
  propertyType: string;
  budgetMin: number | null;
  budgetMax: number | null;
  buyingTimeline: string;
  createdAt: string;
}

interface Analysis {
  summary: string;
  score: number;
  tag: string;
  intent: string;
  recommendedNextAction?: string;
}

interface LeadWithAnalysis {
  lead: Lead;
  analysis: Analysis | null;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
  subtitle,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  delay: number;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-5 relative overflow-hidden bg-white border border-slate-200/90 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            {label}
          </p>
          <p className="text-3xl font-mono font-bold mt-1 text-slate-900">
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs",
            color === "text-ink" && "bg-emerald-50 text-emerald-600 border-emerald-100",
            color === "text-hot" && "bg-red-50 text-red-600 border-red-100",
            color === "text-warm" && "bg-amber-50 text-amber-600 border-amber-100",
            color === "text-cold" && "bg-blue-50 text-blue-600 border-blue-100"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [leadsData, setLeadsData] = useState<LeadWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"board" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [scanningIds, setScanningIds] = useState<number[]>([]);
  const [editingLead, setEditingLead] = useState<any | null>(null);

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

  // Check if any leads have no analysis — if so, auto-poll every 3s
  const pendingLeads = leadsData.filter((l) => !l.analysis);

  useEffect(() => {
    if (pendingLeads.length > 0) {
      const interval = setInterval(() => {
        fetchLeads(false);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [pendingLeads.length]);

  const handleScanLead = async (leadId: number) => {
    if (scanningIds.includes(leadId)) return;
    setScanningIds((prev) => [...prev, leadId]);
    try {
      const res = await fetch(`/api/leads/${leadId}/analyze`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchLeads(false);
      }
    } catch (err) {
      console.error("Failed to trigger analysis:", err);
    } finally {
      setScanningIds((prev) => prev.filter((id) => id !== leadId));
    }
  };

  const handleScanAllPending = async () => {
    for (const item of pendingLeads) {
      handleScanLead(item.lead.id);
    }
  };

  const handleEditLead = (lead: any) => {
    setEditingLead(lead);
  };

  const handleEditSuccess = (leadId: number) => {
    setEditingLead(null);
    fetchLeads(true); // Refresh to get updated data + new analysis
  };

  const handleRescanLead = async (leadId: number) => {
    if (scanningIds.includes(leadId)) return;
    setScanningIds(prev => [...prev, leadId]);
    try {
      await fetch(`/api/leads/${leadId}/analyze`, { method: 'POST' });
      await fetchLeads(false);
    } catch (err) {
      console.error('Rescan failed:', err);
    } finally {
      setScanningIds(prev => prev.filter(id => id !== leadId));
    }
  };

  const hotLeads = leadsData.filter((l) => l.analysis?.tag === "hot");
  const warmLeads = leadsData.filter((l) => l.analysis?.tag === "warm");
  const coldLeads = leadsData.filter((l) => l.analysis?.tag === "cold");

  const filteredLeads = leadsData.filter((l) => {
    const matchesSearch = searchQuery
      ? l.lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.lead.location.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesTag = filterTag
      ? filterTag === "pending"
        ? !l.analysis
        : l.analysis?.tag === filterTag
      : true;
    return matchesSearch && matchesTag;
  });

  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-[260px] p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">
              Lead Dashboard
            </h1>
            <p className="text-sm text-stone-500 font-medium mt-1">
              Prioritize and act on your inbound leads
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchLeads(true)}
              className="p-2.5 rounded-full border border-[#EADFD5] bg-white hover:bg-[#FAF6F1] text-stone-600 transition-all shadow-sm"
              title="Refresh leads"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            <Link href="/leads/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              New Lead
            </Link>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Leads"
            value={leadsData.length}
            color="text-ink"
            delay={0}
            subtitle={
              pendingLeads.length > 0
                ? `${pendingLeads.length} awaiting AI scan`
                : "All leads prioritized"
            }
          />
          <StatCard
            icon={Flame}
            label="High Intent"
            value={hotLeads.length}
            color="text-hot"
            delay={0.1}
            subtitle="Ready to buy immediately"
          />
          <StatCard
            icon={Sun}
            label="Moderate Intent"
            value={warmLeads.length}
            color="text-warm"
            delay={0.2}
            subtitle="1-3 month timeline"
          />
          <StatCard
            icon={Snowflake}
            label="Low Intent"
            value={coldLeads.length}
            color="text-cold"
            delay={0.3}
            subtitle="Exploring / long-term"
          />
        </div>

        {/* Pending Leads Banner (if any) */}
        {pendingLeads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-hover animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-ink">
                  {pendingLeads.length} New Lead{pendingLeads.length > 1 ? "s" : ""} Processing
                </h4>
                <p className="text-xs text-ink-muted">
                  AI background scan extracting buyer intent and score.
                </p>
              </div>
            </div>
            <button
              onClick={handleScanAllPending}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Scan All Pending
            </button>
          </motion.div>
        )}

        {/* Bulk Follow-up Nudge Center */}
        {leadsData.length > 0 && (
          <BulkNudgeSection
            leads={leadsData}
            onNudgeComplete={() => fetchLeads(false)}
          />
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
            <input
              type="text"
              placeholder="Search leads by name, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-dark w-full pl-9"
            />
          </div>
          <div className="flex gap-1">
            {[
              { tag: null, label: "All" },
              { tag: "hot", label: "High Intent" },
              { tag: "warm", label: "Moderate Intent" },
              { tag: "cold", label: "Low Intent" },
              ...(pendingLeads.length > 0
                ? [{ tag: "pending", label: `Pending (${pendingLeads.length})` }]
                : []),
            ].map((f) => (
              <button
                key={f.label}
                onClick={() => setFilterTag(f.tag)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  filterTag === f.tag
                    ? "bg-primary/15 text-primary-hover border border-primary/30"
                    : "text-ink-subtle hover:text-ink hover:bg-surface-1"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1.5 p-1 bg-white border border-[#EADFD5] rounded-full shadow-sm">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-tight transition-all",
                viewMode === "list"
                  ? "bg-[#059669] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-[#FAF6F1]"
              )}
            >
              <List className="w-4 h-4" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-tight transition-all",
                viewMode === "board"
                  ? "bg-[#059669] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-[#FAF6F1]"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Card View</span>
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && leadsData.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-primary/50" />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-2">
              No leads yet
            </h3>
            <p className="text-sm text-ink-muted mb-6 max-w-sm">
              Start by adding your first lead. AI will analyze and prioritize it
              automatically.
            </p>
            <Link href="/leads/new" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add First Lead
            </Link>
          </motion.div>
        )}

        {/* Pending Leads Section (shown if any are unanalyzed) */}
        {!loading && pendingLeads.length > 0 && viewMode === "board" && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary-hover animate-spin" />
              <h2 className="text-sm font-semibold text-ink">
                Awaiting AI Scan ({pendingLeads.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingLeads.map((item, i) => (
                <LeadCard
                  key={item.lead.id}
                  lead={item.lead}
                  analysis={null}
                  index={i}
                  onScan={handleScanLead}
                  onEdit={handleEditLead}
                  onRescan={handleRescanLead}
                  isScanning={scanningIds.includes(item.lead.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Board View */}
        {!loading && leadsData.length > 0 && viewMode === "board" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                tag: "hot",
                label: "High Intent Leads",
                icon: Flame,
                color: "text-hot",
                leads: hotLeads,
              },
              {
                tag: "warm",
                label: "Moderate Intent Leads",
                icon: Sun,
                color: "text-warm",
                leads: warmLeads,
              },
              {
                tag: "cold",
                label: "Low Intent Leads",
                icon: Snowflake,
                color: "text-cold",
                leads: coldLeads,
              },
            ].map((col) => (
              <div key={col.tag}>
                <div className="flex items-center gap-2 mb-4">
                  <col.icon className={cn("w-4 h-4", col.color)} />
                  <h2 className={cn("text-sm font-semibold", col.color)}>
                    {col.label}
                  </h2>
                  <span className="ml-auto text-xs text-ink-subtle bg-surface-1 px-2 py-0.5 rounded-full">
                    {col.leads.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {col.leads
                    .filter((l) => {
                      if (!searchQuery) return true;
                      return (
                        l.lead.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        l.lead.location
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      );
                    })
                    .map((item, i) => (
                      <LeadCard
                        key={item.lead.id}
                        lead={item.lead}
                        analysis={item.analysis}
                        index={i}
                        onScan={handleScanLead}
                        onEdit={handleEditLead}
                        onRescan={handleRescanLead}
                        isScanning={scanningIds.includes(item.lead.id)}
                      />
                    ))}
                  {col.leads.length === 0 && (
                    <div className="glass-card p-8 text-center">
                      <p className="text-sm text-ink-subtle">
                        No {col.tag} leads
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View (Image 3 Mode) */}
        {!loading && leadsData.length > 0 && viewMode === "list" && (
          <div className="bg-white rounded-3xl border border-[#EADFD5] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF6F1] border-b border-[#EADFD5] section-label">
                    <th className="py-4 px-5 text-center">PRIORITY / SCORE</th>
                    <th className="py-4 px-5">CUSTOMER</th>
                    <th className="py-4 px-5">BUDGET · TIMELINE</th>
                    <th className="py-4 px-5">AI SUMMARY</th>
                    <th className="py-4 px-5">RECOMMENDED NEXT ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADFD5]/70 text-xs text-stone-800 font-sans">
                  {filteredLeads.map(({ lead, analysis }, i) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-[#FAF6F1]/50 transition-colors group cursor-pointer"
                      onClick={() => window.location.href = `/leads/${lead.id}`}
                    >
                      {/* Priority / Score */}
                      <td className="py-5 px-5 align-top text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5 mx-auto">
                          {analysis ? (
                            <>
                              <TagBadge tag={analysis.tag} />
                              <span
                                className={cn(
                                  "font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200",
                                  getScoreColor(analysis.score)
                                )}
                              >
                                {analysis.score} / 100
                              </span>
                            </>
                          ) : (
                            <span className="font-mono text-[10px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                              Pending Scan
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-5 px-5 align-top">
                        <div>
                          <span className="font-black text-stone-900 text-sm tracking-tight block">
                            {lead.name}
                          </span>
                          <div className="text-stone-500 text-xs space-y-0.5 mt-1 font-medium">
                            <div className="flex items-center gap-1 text-stone-600">
                              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              {lead.location}
                            </div>
                            {lead.phone && <div className="font-mono text-[11px]">📞 {lead.phone}</div>}
                            {lead.email && <div className="font-mono text-[11px] truncate max-w-[160px]">✉️ {lead.email}</div>}
                          </div>
                        </div>
                      </td>

                      {/* Budget · Timeline */}
                      <td className="py-5 px-5 align-top font-mono">
                        <div className="space-y-1">
                          <div className="font-extrabold text-stone-900 text-xs">
                            {lead.budgetMin ? formatCurrency(lead.budgetMin) : "N/A"}
                            {lead.budgetMin && lead.budgetMax ? " – " : ""}
                            {lead.budgetMax ? formatCurrency(lead.budgetMax) : ""}
                          </div>
                          <div className="text-stone-500 text-xs font-sans font-medium">
                            {lead.buyingTimeline}
                          </div>
                          <div className="text-xs text-stone-400 font-sans capitalize">
                            {lead.propertyType}
                          </div>
                        </div>
                      </td>

                      {/* AI Summary */}
                      <td className="py-5 px-5 align-top max-w-xs">
                        <p className="text-stone-700 line-clamp-3 text-xs leading-relaxed font-normal">
                          {analysis ? analysis.summary : "No AI analysis generated yet."}
                        </p>
                      </td>

                      {/* Recommended Next Action */}
                      <td className="py-5 px-5 align-top max-w-xs">
                        <div className="space-y-2.5">
                          <p className="text-xs font-semibold text-stone-900 line-clamp-2 leading-relaxed">
                            {analysis ? analysis.recommendedNextAction : "Run AI scan to extract next action"}
                          </p>
                          <div className="flex items-center gap-2 pt-0.5" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/leads/${lead.id}`}
                              className="btn-primary text-xs px-3.5 py-1.5"
                            >
                              View Lead →
                            </Link>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {editingLead && (
          <LeadEditModal
            isOpen={!!editingLead}
            onClose={() => setEditingLead(null)}
            onSuccess={handleEditSuccess}
            leadId={editingLead.id}
            leadData={editingLead}
          />
        )}
      </main>
    </>
  );
}
