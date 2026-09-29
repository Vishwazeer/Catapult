"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  return (
    <div className="markdown-content text-sm leading-relaxed text-ink-muted">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-hairline bg-surface-1 shadow-sm">
              <table className="w-full text-left text-xs border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-surface-2 text-ink font-semibold border-b border-hairline" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3 py-2 border-r last:border-r-0 border-hairline/60 font-semibold text-ink" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 border-r last:border-r-0 border-b border-hairline/30 text-ink-muted" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed text-ink-muted" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-ink" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-ink-muted" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside my-2 space-y-1 text-ink-muted pl-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside my-2 space-y-1 text-ink-muted pl-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-ink-muted text-xs leading-normal my-0.5" {...props} />
          ),
          h1: ({ node, ...props }) => (
            <h1 className="text-base font-bold text-ink my-3 tracking-wide" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm font-semibold text-ink my-2.5 border-b border-hairline/40 pb-1" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs font-semibold text-primary-hover my-2 uppercase tracking-wider" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 border-primary/60 pl-3 my-2 text-ink-subtle italic text-xs bg-primary/5 py-1 rounded-r-md" {...props} />
          ),
          code: ({ node, ...props }) => (
            <code className="bg-surface-2 px-1.5 py-0.5 rounded text-xs font-mono text-primary-hover border border-hairline/40" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-3 border-hairline/60" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
