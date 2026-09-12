import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative p-2.5 rounded-xl backdrop-blur-md transition-all duration-200 
        bg-white/60 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80
        hover:border-teal-400 dark:hover:border-teal-500 shadow-sm hover:shadow-md active:scale-95 group ${className}`}
    >
      <motion.div
        key={isDark ? "dark" : "light"}
        initial={{ rotate: -45, scale: 0.8, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 45, scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex items-center justify-center text-slate-700 dark:text-slate-200"
      >
        {isDark ? (
          <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:rotate-45 transition-transform" />
        ) : (
          <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 group-hover:-rotate-12 transition-transform" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
