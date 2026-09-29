"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar";
import LeadCard from "@/components/lead-card";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Lead {
  id: number;
  name: string;
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
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-subtle uppercase tracking-wider font-medium">
            {label}
          </p>
          <p className={cn("text-3xl font-mono font-bold mt-1", color)}>
            {value}
          </p>
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            color === "text-ink" && "bg-primary/10",
            color === "text-hot" && "bg-hot/10",
            color === "text-warm" && "bg-warm/10",
            color === "text-cold" && "bg-cold/10"
          )}
        >
          <Icon className={cn("w-5 h-5", color)} />
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [leadsData, setLeadsData] = useState<LeadWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeadsData(data.leads || []);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
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
    const matchesTag = filterTag ? l.analysis?.tag === filterTag : true;
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
            <h1 className="font-display text-3xl font-semibold text-ink tracking-wide">
              Lead Dashboard
            </h1>
            <p className="text-sm text-ink-muted mt-1">
              Prioritize and act on your inbound leads
            </p>
          </div>
          <Link href="/leads/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Lead
          </Link>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Leads"
            value={leadsData.length}
            color="text-ink"
            delay={0}
          />
          <StatCard
            icon={Flame}
            label="Hot Leads"
            value={hotLeads.length}
            color="text-hot"
            delay={0.1}
          />
          <StatCard
            icon={Sun}
            label="Warm Leads"
            value={warmLeads.length}
            color="text-warm"
            delay={0.2}
          />
          <StatCard
            icon={Snowflake}
            label="Cold Leads"
            value={coldLeads.length}
            color="text-cold"
            delay={0.3}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-dark w-full pl-9"
            />
          </div>
          <div className="flex gap-1">
            {[
              { tag: null, label: "All" },
              { tag: "hot", label: "Hot" },
              { tag: "warm", label: "Warm" },
              { tag: "cold", label: "Cold" },
            ].map((f) => (
              <button
                key={f.label}
                onClick={() => setFilterTag(f.tag)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  filterTag === f.tag
                    ? "bg-primary/15 text-primary-hover border border-primary/30"
                    : "bg-surface-1 text-ink-muted border border-hairline hover:bg-surface-2"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex border border-hairline rounded-md overflow-hidden ml-auto">
            <button
              onClick={() => setViewMode("board")}
              className={cn(
                "p-2 transition-all",
                viewMode === "board"
                  ? "bg-surface-2 text-ink"
                  : "text-ink-subtle hover:bg-surface-1"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 transition-all",
                viewMode === "list"
                  ? "bg-surface-2 text-ink"
                  : "text-ink-subtle hover:bg-surface-1"
              )}
            >
              <List className="w-4 h-4" />
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

        {/* Board View */}
        {!loading && leadsData.length > 0 && viewMode === "board" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                tag: "hot",
                label: "Hot Leads",
                icon: Flame,
                color: "text-hot",
                leads: hotLeads,
              },
              {
                tag: "warm",
                label: "Warm Leads",
                icon: Sun,
                color: "text-warm",
                leads: warmLeads,
              },
              {
                tag: "cold",
                label: "Cold Leads",
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

        {/* List View */}
        {!loading && leadsData.length > 0 && viewMode === "list" && (
          <div className="space-y-3">
            {filteredLeads.map((item, i) => (
              <LeadCard
                key={item.lead.id}
                lead={item.lead}
                analysis={item.analysis}
                index={i}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
