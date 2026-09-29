"use client";

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
import { useState } from "react";

interface AnalysisDisplayProps {
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

function ScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-hairline"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          className={getScoreColor(score)}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn("text-3xl font-mono font-bold", getScoreColor(score))}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-ink-subtle uppercase tracking-widest">
          Score
        </span>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-ink-subtle hover:text-ink hover:bg-surface-2 transition-all"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-success" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

function AnalysisSection({
  icon: Icon,
  title,
  children,
  className,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn("glass-card p-5", className)}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary-hover" />
        <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}

export default function AnalysisDisplay({ analysis }: AnalysisDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Top Row: Score + Summary + Intent */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
        {/* Score Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-5 flex flex-col items-center justify-center"
        >
          <ScoreGauge score={analysis.score} />
          <div className="mt-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                analysis.tag === "hot" && "tag-hot",
                analysis.tag === "warm" && "tag-warm",
                analysis.tag === "cold" && "tag-cold"
              )}
            >
              {analysis.tag}
            </span>
          </div>
          <p className="text-xs text-ink-subtle mt-2 text-center max-w-[200px]">
            {analysis.reasoning}
          </p>
        </motion.div>

        {/* Summary + Intent */}
        <div className="space-y-4">
          <AnalysisSection icon={Brain} title="Summary" delay={0.1}>
            <p className="text-sm text-ink-muted leading-relaxed">
              {analysis.summary}
            </p>
          </AnalysisSection>

          <AnalysisSection icon={Target} title="Customer Intent" delay={0.2}>
            <p className="text-sm text-ink-muted leading-relaxed">
              {analysis.intent}
            </p>
          </AnalysisSection>
        </div>
      </div>

      {/* Key Requirements + Objections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnalysisSection icon={CheckCircle2} title="Key Requirements" delay={0.3}>
          <ul className="space-y-2">
            {analysis.keyRequirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                <TrendingUp className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </AnalysisSection>

        <AnalysisSection
          icon={AlertTriangle}
          title="Objections & Concerns"
          delay={0.4}
        >
          <ul className="space-y-2">
            {analysis.objectionsAndConcerns.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                <Shield className="w-3.5 h-3.5 text-warm mt-0.5 flex-shrink-0" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </AnalysisSection>
      </div>

      {/* Next Action */}
      <AnalysisSection
        icon={Lightbulb}
        title="Recommended Next Action"
        className="glow-border"
        delay={0.5}
      >
        <p className="text-sm text-ink font-medium leading-relaxed">
          {analysis.recommendedNextAction}
        </p>
      </AnalysisSection>

      {/* Suggested Response */}
      <AnalysisSection icon={MessageSquare} title="Suggested Response" delay={0.6}>
        <div className="relative">
          <div className="absolute top-0 right-0">
            <CopyButton text={analysis.suggestedResponse} />
          </div>
          <p className="text-sm text-ink-muted leading-relaxed pr-8 whitespace-pre-wrap">
            {analysis.suggestedResponse}
          </p>
        </div>
      </AnalysisSection>

      {/* Call Prep Questions */}
      <AnalysisSection icon={Phone} title="Call Prep Questions" delay={0.7}>
        <ol className="space-y-2">
          {analysis.callPrepQuestions.map((q, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-ink-muted">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary-hover text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span>{q}</span>
            </li>
          ))}
        </ol>
      </AnalysisSection>
    </div>
  );
}


