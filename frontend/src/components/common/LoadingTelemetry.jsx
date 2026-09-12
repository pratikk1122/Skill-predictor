import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, CheckCircle2 } from 'lucide-react';

const DEFAULT_MESSAGES = [
  "Parsing technical skills and core competencies...",
  "Benchmarking against Fortune 500 & top-tier ATS filters...",
  "Evaluating keyword semantic alignment & industry density...",
  "Running recruiter 6-second eye-tracking simulation...",
  "Synthesizing personalized career insights & growth roadmap...",
  "Finalizing predictive placement scoring telemetry..."
];

export const LoadingTelemetry = ({
  messages = DEFAULT_MESSAGES,
  title = "AI Engine Running",
  subtitle = "Synthesizing deep placement telemetry",
  intervalMs = 2000
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [messages.length, intervalMs]);

  const progressPercent = Math.min(95, Math.round(((index + 1) / messages.length) * 100));

  return (
    <div className="w-full max-w-xl mx-auto p-8 sm:p-12 text-center bg-white/90 dark:bg-slate-800/90 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-700/80 shadow-xl backdrop-blur-xl">
      {/* Animated Glowing Beacon */}
      <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-8">
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-teal-500/30 dark:bg-teal-400/20 blur-xl"
        />
        <div className="relative w-20 h-20 rounded-full bg-teal-50 dark:bg-teal-950/40 border-2 border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-inner">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-9 h-9" />
          </motion.div>
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 mb-1 tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-400 mb-8">
        {subtitle}
      </p>

      {/* Cycling Engaging Status Messages */}
      <div className="h-12 flex items-center justify-center mb-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="inline-flex items-center gap-2.5 px-4 py-2 bg-teal-50/80 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/60 rounded-full text-xs sm:text-sm font-bold text-teal-700 dark:text-teal-300 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-500 animate-spin" />
            <span>{messages[index]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar & Counter */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 dark:text-slate-400 px-1">
          <span>PROGRESS // TELEMETRY</span>
          <span className="font-bold text-teal-600 dark:text-teal-400">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden p-0.5 border border-slate-200/40 dark:border-slate-700/40">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"
            initial={{ width: "15%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingTelemetry;
