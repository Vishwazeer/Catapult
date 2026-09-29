import React from "react";
import { Loader2, Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-xs transition-all">
      <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-sm text-center animate-in fade-in zoom-in-95">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm relative">
          <Loader2 className="w-7 h-7 animate-spin" />
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-slate-900 text-lg">
            Loading...
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Fetching data & rendering page
          </p>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
          <div className="bg-emerald-600 h-full w-2/3 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
