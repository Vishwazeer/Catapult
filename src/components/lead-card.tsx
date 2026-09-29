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
  isScanning?: boolean;
}

function TagBadge({ tag }: { tag: string }) {
  const config = {
    hot: { icon: Flame, className: "tag-hot", label: "HOT" },
    warm: { icon: Sun, className: "tag-warm", label: "WARM" },
    cold: { icon: Snowflake, className: "tag-cold", label: "COLD" },
  }[tag] || { icon: Sun, className: "tag-warm", label: tag.toUpperCase() };

  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1", config.className)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export default function LeadCard({
  lead,
  analysis,
  index = 0,
  onScan,
  isScanning = false,
}: LeadCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link href={`/leads/${lead.id}`}>
        <div className="glass-card-hover p-5 cursor-pointer group relative">
          {/* Header: Name + Tag + Score */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-hover" />
              </div>
              <div>
                <h3 className="font-semibold text-ink group-hover:text-primary-hover transition-colors">
                  {lead.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3 h-3 text-ink-subtle" />
                  <span className="text-xs text-ink-muted">{lead.location}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {analysis ? (
                <>
                  <TagBadge tag={analysis.tag} />
                  <div
                    className={cn(
                      "font-mono text-lg font-bold",
                      getScoreColor(analysis.score)
                    )}
                  >
                    {analysis.score}
                  </div>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/15 text-primary-hover border border-primary/20">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  {isScanning ? "Scanning..." : "Pending Scan"}
                </span>
              )}
            </div>
          </div>

          {/* Summary or Pending Scan CTA */}
          {analysis ? (
            <p className="text-sm text-ink-muted line-clamp-2 mb-3">
              {analysis.summary}
            </p>
          ) : (
            <div className="py-2.5 px-3 mb-3 rounded-lg bg-surface-1/80 border border-hairline flex items-center justify-between">
              <span className="text-xs text-ink-muted">
                {isScanning
                  ? "AI extracting intent & scoring..."
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
                  className="text-xs px-2.5 py-1 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 flex items-center gap-1.5 transition-all shadow-sm"
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

          {/* Meta Row */}
          <div className="flex items-center gap-4 text-xs text-ink-subtle">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {lead.propertyType}
            </span>
            {(lead.budgetMin || lead.budgetMax) && (
              <span className="flex items-center gap-1">
                <IndianRupee className="w-3 h-3" />
                {lead.budgetMin ? formatCurrency(lead.budgetMin) : ""}
                {lead.budgetMin && lead.budgetMax ? " – " : ""}
                {lead.budgetMax ? formatCurrency(lead.budgetMax) : ""}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {lead.buyingTimeline}
            </span>
            <span className="ml-auto text-ink-subtle/60">
              {formatDate(lead.createdAt)}
            </span>
          </div>

          {/* Hover Arrow */}
          <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-4 h-4 text-primary-hover" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export { TagBadge };
