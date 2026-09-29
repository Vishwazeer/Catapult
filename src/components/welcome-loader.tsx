"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Building2 } from "lucide-react";

export default function WelcomeLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar from 0 to 100% over 1.2s
    const startTime = Date.now();
    const duration = 1200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="welcome-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F4EEE8] select-none"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute w-[450px] h-[450px] bg-gradient-to-tr from-emerald-500/10 via-emerald-400/5 to-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          {/* Centered Brand Container */}
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            
            {/* Logo Icon Mark with Animated Ring */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-6"
            >
              {/* Pulsing Backlight Ring */}
              <motion.div 
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-3 rounded-3xl bg-[#059669]/20 blur-md" 
              />

              {/* Logo Box */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white border border-[#EADFD5] shadow-xl flex items-center justify-center p-3 relative overflow-hidden">
                <img src="/icon.svg" alt="Catapult Logo" className="w-full h-full object-contain" />
              </div>
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight font-sans">
                Catapult
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-emerald-200 shadow-2xs">
                PRO
              </span>
            </motion.div>

            {/* Subtitle / Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-stone-500 font-mono text-xs uppercase tracking-[0.2em] font-bold mt-2"
            >
              Real Estate Lead Intelligence
            </motion.p>

            {/* Progress Bar & Percentage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="mt-8 flex flex-col items-center w-full max-w-[220px]"
            >
              <div className="w-full h-2 bg-white border border-[#EADFD5] rounded-full overflow-hidden p-0.5 shadow-inner">
                <motion.div
                  className="h-full bg-[#059669] rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>

              <div className="flex items-center justify-between w-full mt-2.5 px-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#059669] animate-spin" />
                  Loading Intelligence
                </span>
                <span className="text-[10px] font-mono font-bold text-[#059669]">
                  {progress}%
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
