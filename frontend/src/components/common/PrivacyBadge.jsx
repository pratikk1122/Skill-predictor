import React, { useState } from 'react';
import { ShieldCheck, Lock, EyeOff, Server, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PrivacyBadge = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Inline Badge Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium 
          bg-slate-100/80 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/40 
          border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 
          hover:text-teal-700 dark:hover:text-teal-300 transition-all cursor-pointer backdrop-blur-md active:scale-95 group ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
        <span>Privacy & Data Security: In-Memory Processing & Zero Data Selling</span>
      </button>

      {/* Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Lock size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    Privacy & Data Governance
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Our strict policy on candidate data protection
                  </p>
                </div>
              </div>

              {/* Points */}
              <div className="space-y-4 mb-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <div className="flex gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                  <Server className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-0.5">Ephemeral In-Memory Parsing</h4>
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      Uploaded resumes and mock interview recordings are parsed in temporary application memory for instantaneous telemetry.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                  <EyeOff className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-0.5">Zero Data Selling or Brokerage</h4>
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      We never sell, syndicate, or monetize your resume text, contact email, or assessment results to third-party recruitment brokers.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-0.5">Strict End-to-End Encryption</h4>
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      All communications between the browser, API gateway, and LLM servers are secured via modern TLS/HTTPS encryption with strict bearer authentication.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dismiss button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                I Understand & Acknowledge
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PrivacyBadge;
