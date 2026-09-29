"use client";

import { motion } from "framer-motion";
import { cn, getScoreColor, formatCurrency, formatDate } from "@/lib/utils";
import {
  MapPin,
  Calendar,
  IndianRupee,
  Flame,
  Snowflake,
  Sun,
  ArrowRight,
  Building2,
  User,
  Sparkles,
  Loader2,
  RefreshCw,
  Pencil,
} from "lucide-react";
import Link from "next/link";

interface LeadCardProps {
  lead: {
    id: number;
    name: string;
    location: string;
    propertyType: string;
    budgetMin: number | null;
    budgetMax: number | null;
    buyingTimeline: string;
    createdAt: string | Date;
  };
  analysis: {
    summary: string;
    score: number;
    tag: string;
    intent: string;
  } | null;
  index?: number;
  onScan?: (id: number) => void;
  onEdit?: (lead: any) => void;
  onRescan?: (id: number) => void;
  isScanning?: boolean;
}

function TagBadge({ tag }: { tag: string }) {
  const config = {
    hot: { icon: Flame, className: "tag-hot", label: "HIGH INTENT" },
    warm: { icon: Sun, className: "tag-warm", label: "MODERATE INTENT" },
    cold: { icon: Snowflake, className: "tag-cold", label: "LOW INTENT" },
  }[tag] || { icon: Sun, className: "tag-warm", label: tag.toUpperCase() };

  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 font-bold", config.className)}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}

export default function LeadCard({
  lead,
  analysis,
  index = 0,
  onScan,
  onEdit,
  onRescan,
  isScanning = false,
}: LeadCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link href={`/leads/${lead.id}`}>
        <div className="bg-white hover:bg-slate-50/50 p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group relative flex flex-col justify-between h-full min-h-[220px]">
          <div>
            {/* Header: Avatar + Name + Location & Badges */}
            <div className="flex items-start justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors truncate">
                    {lead.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{lead.location}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons & Tag/Score pills */}
              <div className="flex items-center gap-1.5 shrink-0">
                {onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit(lead);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100"
                    title="Edit Lead"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {analysis && onRescan && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRescan(lead.id);
                    }}
                    disabled={isScanning}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="Re-scan Analysis"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isScanning && "animate-spin")} />
                  </button>
                )}

                {analysis ? (
                  <>
                    <TagBadge tag={analysis.tag} />
                    <div
                      className={cn(
                        "font-mono text-xs font-bold px-2 py-0.5 rounded-md border bg-slate-50 border-slate-200 shrink-0",
                        getScoreColor(analysis.score)
                      )}
                    >
                      {analysis.score}
                    </div>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
                    {isScanning ? "Scanning..." : "Pending Scan"}
                  </span>
                )}
              </div>
            </div>

            {/* AI Summary Container (unclipped, clean 3-line display with proper padding) */}
            {analysis ? (
              <p className="text-xs text-slate-700 leading-normal bg-slate-50/80 p-3 rounded-xl border border-slate-100/90 mb-4 line-clamp-3 min-h-[62px] overflow-hidden">
                {analysis.summary}
              </p>
            ) : (
              <div className="py-3 px-3 mb-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between min-h-[62px]">
                <span className="text-xs text-slate-500">
                  {isScanning
                    ? "AI extracting buyer intent..."
                    : "AI analysis pending for this lead"}
                </span>
                {onScan && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onScan(lead.id);
                    }}
                    disabled={isScanning}
                    className="text-xs px-2.5 py-1 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        Scan Now
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Meta Details Row */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2 flex-wrap">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span className="capitalize">{lead.propertyType}</span>
              </span>
              {(lead.budgetMin || lead.budgetMax) && (
                <span className="flex items-center gap-1 text-slate-800 font-semibold font-mono text-[11px]">
                  <IndianRupee className="w-3 h-3 text-emerald-600" />
                  {lead.budgetMin ? formatCurrency(lead.budgetMin) : ""}
                  {lead.budgetMin && lead.budgetMax ? " – " : ""}
                  {lead.budgetMax ? formatCurrency(lead.budgetMax) : ""}
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <Calendar className="w-3 h-3 text-slate-400" />
                {lead.buyingTimeline}
              </span>
            </div>
            <div className="flex items-center gap-1 ml-auto text-[11px] text-slate-400">
              <span>{formatDate(lead.createdAt)}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all ml-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export { TagBadge };
