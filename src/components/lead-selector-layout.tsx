"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { Loader2, ArrowLeft, Brain, MessageSquare, Sparkles, User, MapPin, Building2, Search } from "lucide-react";
import { cn, formatCurrency, getScoreColor } from "@/lib/utils";
import { TagBadge } from "./lead-card";
import AnalysisDisplay from "./analysis-display";
import LeadChat from "./lead-chat";
import CustomerSimulator from "./customer-simulator";

interface LeadWithAnalysis {
  lead: {
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
              <FeatureIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                {title}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Client / Lead Selection Panel (4 cols) */}
            <div className="lg:col-span-4 glass-card p-5 flex flex-col h-fit bg-white border border-[#EADFD5] shadow-sm rounded-3xl">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Filter clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-[#EADFD5] rounded-2xl pl-10 pr-4 py-2.5 text-stone-900 text-xs font-sans focus:ring-2 focus:ring-emerald-500/30 focus:border-[#059669] outline-none transition-all placeholder:text-stone-400"
                  />
                </div>
              </div>

              <div className="flex-1 space-y-2.5">
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
                        "p-3.5 rounded-2xl border transition-all cursor-pointer group text-left",
                        isSelected
                          ? "bg-[#ECFDF5]/70 border-[#059669] shadow-xs border-2"
                          : "bg-white hover:bg-[#FAF6F1]/80 border-[#EADFD5]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                              isSelected
                                ? "bg-emerald-600 text-white"
                                : "bg-stone-100 text-stone-600 border border-stone-200"
                            )}
                          >
                            <User className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-stone-900 tracking-tight truncate">
                              {item.lead.name}
                            </h4>
                            <span className="text-xs text-stone-500 font-medium flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                              <span className="truncate">{item.lead.location}</span>
                            </span>
                          </div>
                        </div>

                        {item.analysis ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={cn(
                                "font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full border bg-white border-stone-200 shrink-0 shadow-2xs",
                                getScoreColor(item.analysis.score)
                              )}
                            >
                              {item.analysis.score}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-stone-400 italic shrink-0">Pending</span>
                        )}
                      </div>

                      <div className="mt-2.5 text-xs text-stone-600 flex items-center justify-between border-t border-[#EADFD5]/70 pt-2 font-mono">
                        <span className="font-sans font-medium text-stone-700">{item.lead.propertyType} {item.lead.bhkConfig ? `· ${item.lead.bhkConfig}` : ""}</span>
                        {item.lead.budgetMax && (
                          <span className="font-mono text-stone-900 font-extrabold">
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
                    <AnalysisDisplay
                      analysis={selectedItem.analysis as any}
                      leadPhone={selectedItem.lead.phone}
                      leadEmail={selectedItem.lead.email}
                    />
                  )}

                  {feature === "chat" && (
                    <LeadChat key={selectedItem.lead.id} leadId={selectedItem.lead.id} leadName={selectedItem.lead.name} />
                  )}

                  {(feature === "callprep" || feature === "call-prep") && selectedItem.analysis && (
                    <CustomerSimulator
                      key={selectedItem.lead.id}
                      leadId={selectedItem.lead.id}
                      leadName={selectedItem.lead.name}
                      leadPhone={selectedItem.lead.phone}
                      leadEmail={selectedItem.lead.email}
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
