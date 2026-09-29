"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  Building2,
  ChevronLeft,
  ChevronRight,
  Brain,
  MessageSquare,
  MessageCircle,
  Sparkles,
  GitBranch,
  Kanban,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/phases", label: "Phases", icon: Kanban },
  { href: "/leads/new", label: "New Lead", icon: UserPlus },
  { href: "/properties", label: "Properties", icon: Building2 },
];

const aiSuiteItems = [
  { href: "/analysis", label: "AI Analysis", icon: Brain },
  { href: "/chat", label: "Lead Chat", icon: MessageSquare },
  { href: "/call-prep", label: "WhatsApp Sim", icon: MessageCircle, badge: "PRO" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-[#EADFD5] flex flex-col z-50 shadow-sm"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[#EADFD5] gap-3">
        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-terracotta/20">
          <img src="/icon.svg" alt="Catapult" className="w-full h-full object-cover" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-1.5"
            >
              <span className="font-sans text-xl font-black tracking-tight text-stone-900">
                Catapult
              </span>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                PRO
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {/* Main Nav */}
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 group text-sm font-bold tracking-tight",
                  isActive
                    ? "bg-[#ECFDF5] text-emerald-950 font-black border border-emerald-200 shadow-xs"
                    : "text-stone-700 hover:bg-[#FAF6F1]/80 hover:text-stone-950 font-semibold"
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0 transition-colors",
                    isActive ? "text-[#059669]" : "text-stone-400 group-hover:text-stone-700"
                  )}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>

        {/* AI Suite Nav */}
        <div className="space-y-1.5 pt-2">
          {!collapsed && (
            <div className="px-3 pb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#059669]" />
                AI INTELLIGENCE
              </span>
            </div>
          )}
          {aiSuiteItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 group relative text-sm font-bold tracking-tight",
                  isActive
                    ? "bg-[#ECFDF5] text-emerald-950 font-black border border-emerald-200 shadow-xs"
                    : "text-stone-700 hover:bg-[#FAF6F1]/80 hover:text-stone-950 font-semibold"
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0 transition-colors",
                    isActive ? "text-[#059669]" : "text-stone-400 group-hover:text-stone-700"
                  )}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-between w-full"
                    >
                      <span className="whitespace-nowrap">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-slate-200/90">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}
