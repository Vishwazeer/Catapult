"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  return (
    <div className="markdown-content text-sm leading-relaxed text-stone-800 font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <div className="my-3 overflow-x-auto rounded-2xl border border-[#EADFD5] bg-white shadow-xs">
              <table className="w-full text-left text-xs border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#FAF6F1] text-stone-900 font-extrabold border-b border-[#EADFD5]" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3.5 py-2.5 border-r last:border-r-0 border-[#EADFD5] font-extrabold text-stone-900 text-xs" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3.5 py-2.5 border-r last:border-r-0 border-b border-[#EADFD5]/60 text-stone-800 text-xs leading-normal" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed text-stone-800 font-normal" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-extrabold text-stone-950" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-stone-600 font-normal" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside my-2 space-y-1 text-stone-800 pl-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside my-2 space-y-1 text-stone-800 pl-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-stone-800 text-xs leading-normal my-0.5" {...props} />
          ),
          h1: ({ node, ...props }) => (
            <h1 className="text-base font-extrabold text-stone-900 my-3 tracking-tight" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm font-extrabold text-stone-900 my-2.5 border-b border-[#EADFD5] pb-1 tracking-tight" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs font-mono font-bold text-stone-600 my-2 uppercase tracking-wider" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-3 border-[#C8524B] pl-3.5 my-2.5 text-stone-700 italic text-xs bg-[#FAF6F1] py-1.5 rounded-r-xl" {...props} />
          ),
          code: ({ node, ...props }) => (
            <code className="bg-[#FAF6F1] px-2 py-0.5 rounded-md text-xs font-mono font-semibold text-stone-900 border border-[#EADFD5]" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-3 border-[#EADFD5]" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
