"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function WelcomeLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar from 0 to 100% over 1.3s
    const startTime = Date.now();
    const duration = 1300;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
        }, 220);
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
          exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F4EEE8] select-none"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/15 via-emerald-400/8 to-teal-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

          {/* Centered Brand Container */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            
            {/* Logo Icon Mark with Animated Ring */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-8"
            >
              {/* Pulsing Backlight Ring */}
              <motion.div 
                animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-4 rounded-3xl bg-[#059669]/25 blur-lg" 
              />

              {/* Logo Box */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-[2rem] bg-white border border-[#EADFD5] shadow-2xl flex items-center justify-center p-5 relative overflow-hidden">
                <img src="/icon.svg" alt="Catapult Logo" className="w-full h-full object-contain" />
              </div>
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-stone-900 tracking-tight font-sans">
                Catapult
              </h1>
              <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#ECFDF5] text-[#059669] border border-emerald-200 shadow-sm align-middle">
                PRO
              </span>
            </motion.div>

            {/* Subtitle / Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-stone-600 font-mono text-sm sm:text-base uppercase tracking-[0.25em] font-extrabold mt-3 sm:mt-4"
            >
              Real Estate Lead Intelligence
            </motion.p>

            {/* Progress Bar & Percentage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="mt-10 flex flex-col items-center w-full max-w-[280px] sm:max-w-[340px]"
            >
              <div className="w-full h-2.5 bg-white border border-[#EADFD5] rounded-full overflow-hidden p-0.5 shadow-inner">
                <motion.div
                  className="h-full bg-[#059669] rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>

              <div className="flex items-center justify-between w-full mt-3 px-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#059669] animate-spin" />
                  Loading Intelligence
                </span>
                <span className="text-xs font-mono font-black text-[#059669]">
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
