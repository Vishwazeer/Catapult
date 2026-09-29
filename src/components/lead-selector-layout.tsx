"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { Loader2, ArrowLeft, Brain, MessageSquare, Sparkles, User, MapPin, Building2, Search } from "lucide-react";
import { cn, formatCurrency, getScoreColor } from "@/lib/utils";
import { TagBadge } from "./lead-card";
import AnalysisDisplay from "./analysis-display";
import LeadChat from "./lead-chat";
import CallPrep from "./call-prep";

interface LeadWithAnalysis {
  lead: {
    id: number;
    name: string;
    location: string;
    propertyType: string;
    bhkConfig: string | null;
    budgetMin: number | null;
    budgetMax: number | null;
    buyingTimeline: string;
    createdAt: string;
  };
  analysis: {
    summary: string;
    score: number;
    tag: string;
    intent: string;
    callPrepQuestions: string[];
  } | null;
}

interface LeadSelectorLayoutProps {
  feature: "analysis" | "chat" | "callprep" | "call-prep";
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

export default function LeadSelectorLayout({
  feature,
  title,
  subtitle,
  icon: FeatureIcon,
}: LeadSelectorLayoutProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const leadIdParam = searchParams.get("leadId");

  const [leadsData, setLeadsData] = useState<LeadWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(
    leadIdParam ? Number(leadIdParam) : null
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        const leads = data.leads || [];
        setLeadsData(leads);
        // If no lead selected yet and leads exist, default to first lead with analysis
        if (!selectedLeadId && leads.length > 0) {
          const firstAnalyzed = leads.find((l: any) => l.analysis) || leads[0];
          setSelectedLeadId(firstAnalyzed.lead.id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch leads for selector:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = leadsData.find((l) => l.lead.id === selectedLeadId);

  const filteredLeads = leadsData.filter((l) => {
    if (!searchQuery) return true;
    return (
      l.lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.lead.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-[260px] p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/20">
              <FeatureIcon className="w-5 h-5 text-primary-hover" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink tracking-wide">
                {title}
              </h1>
              <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Client / Lead Selection Panel (4 cols) */}
            <div className="lg:col-span-4 glass-card p-4 flex flex-col h-[650px]">
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-subtle" />
                  <input
                    type="text"
                    placeholder="Filter clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-dark w-full text-xs pl-8 py-2"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredLeads.map((item) => {
                  const isSelected = item.lead.id === selectedLeadId;
                  return (
                    <div
                      key={item.lead.id}
                      onClick={() => {
                        setSelectedLeadId(item.lead.id);
                        router.replace(`/${feature}?leadId=${item.lead.id}`);
                      }}
                      className={cn(
                        "p-3 rounded-xl border transition-all cursor-pointer group text-left",
                        isSelected
                          ? "bg-primary/15 border-primary shadow-sm"
                          : "bg-surface-2/60 hover:bg-surface-2 border-hairline"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                              isSelected
                                ? "bg-primary text-white"
                                : "bg-surface-3 text-ink-subtle"
                            )}
                          >
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <h4
                              className={cn(
                                "text-xs font-semibold transition-colors",
                                isSelected ? "text-primary-hover font-bold" : "text-ink"
                              )}
                            >
                              {item.lead.name}
                            </h4>
                            <span className="text-[11px] text-ink-subtle flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {item.lead.location}
                            </span>
                          </div>
                        </div>

                        {item.analysis ? (
                          <div className="flex items-center gap-1.5">
                            <TagBadge tag={item.analysis.tag} />
                            <span
                              className={cn(
                                "font-mono text-xs font-bold",
                                getScoreColor(item.analysis.score)
                              )}
                            >
                              {item.analysis.score}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-ink-subtle italic">Pending</span>
                        )}
                      </div>

                      <div className="mt-2 text-[11px] text-ink-subtle flex items-center justify-between border-t border-hairline/40 pt-1.5">
                        <span>{item.lead.propertyType} {item.lead.bhkConfig ? `· ${item.lead.bhkConfig}` : ""}</span>
                        {item.lead.budgetMax && (
                          <span className="font-mono text-primary-hover font-medium">
                            ≤ {formatCurrency(item.lead.budgetMax)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Feature Output Panel (8 cols) */}
            <div className="lg:col-span-8">
              {selectedItem ? (
                <>
                  {feature === "analysis" && selectedItem.analysis && (
                    <AnalysisDisplay analysis={selectedItem.analysis as any} />
                  )}

                  {feature === "chat" && (
                    <LeadChat key={selectedItem.lead.id} leadId={selectedItem.lead.id} />
                  )}

                  {(feature === "callprep" || feature === "call-prep") && selectedItem.analysis && (
                    <CallPrep
                      key={selectedItem.lead.id}
                      leadId={selectedItem.lead.id}
                      leadName={selectedItem.lead.name}
                      leadLocation={selectedItem.lead.location}
                      leadPropertyType={selectedItem.lead.propertyType}
                      leadBhk={selectedItem.lead.bhkConfig || undefined}
                      leadBudgetMax={selectedItem.lead.budgetMax || undefined}
                      callPrepQuestions={selectedItem.analysis.callPrepQuestions}
                    />
                  )}
                </>
              ) : (
                <div className="glass-card p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <p className="text-sm text-ink-muted">Select a lead from the left to view {title}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
