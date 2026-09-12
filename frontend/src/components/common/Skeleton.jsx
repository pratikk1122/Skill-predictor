import React from 'react';

/**
 * Base atomic Skeleton box with smooth pulse shimmer
 */
export const Skeleton = ({ className = "", variant = "rectangular" }) => {
  const baseClasses = "animate-pulse bg-slate-200/80 dark:bg-slate-700/60";
  const variantClasses = {
    rectangular: "rounded-xl",
    circular: "rounded-full",
    text: "rounded-md h-4 w-full",
  }[variant] || "rounded-xl";

  return <div className={`${baseClasses} ${variantClasses} ${className}`} />;
};

/**
 * ATS Score Card Skeleton (Mirrors ResumeScorer results gauge & breakdown)
 */
export const ScoreCardSkeleton = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Score Hero Skeleton */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800/80 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col items-center justify-center text-center">
          <Skeleton className="h-3 w-28 mb-8" />
          <Skeleton className="w-32 h-32 rounded-full mb-6" />
          <Skeleton className="h-6 w-36 rounded-full" />
        </div>

        {/* Skill Analytics Breakdown Skeleton */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/80 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-700/60 shadow-sm">
          <Skeleton className="h-4 w-44 mb-8" />
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-3.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Grid Skeleton */}
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white dark:bg-slate-800/80 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700/60">
          <Skeleton className="h-4 w-40 mb-6" />
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-16 w-20 rounded-2xl" />
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700/60">
          <Skeleton className="h-4 w-36 mb-6" />
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Responsive Chart Skeleton (Mirrors Recharts Radar / Bar charts)
 */
export const ChartSkeleton = ({ height = "h-[360px]" }) => {
  return (
    <div className={`w-full ${height} rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 p-6 flex flex-col items-center justify-center relative overflow-hidden`}>
      <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center animate-pulse">
        <div className="w-28 h-28 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600" />
      </div>
      <Skeleton className="h-3 w-40 mt-6" />
    </div>
  );
};

/**
 * Question / Interview Card Skeleton
 */
export const QuestionCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 sm:p-10 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="flex gap-4">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 flex-1 rounded-xl" />
      </div>
    </div>
  );
};

export default Skeleton;
