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
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 shrink-0 rounded-xl 
        bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 
        hover:border-teal-500/50 dark:hover:border-teal-400/50 shadow-xs hover:shadow-sm 
        transition-all duration-200 active:scale-95 focus:outline-none group ${className}`}
    >
      <div className="relative w-4.5 h-4.5 sm:w-5 sm:h-5 flex items-center justify-center overflow-hidden">
        {/* Sun Icon (shown in dark mode) */}
        <Sun 
          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400 absolute transition-all duration-300 transform ${
            isDark 
              ? 'scale-100 rotate-0 opacity-100' 
              : 'scale-0 -rotate-90 opacity-0'
          }`} 
        />
        {/* Moon Icon (shown in light mode) */}
        <Moon 
          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 absolute transition-all duration-300 transform ${
            !isDark 
              ? 'scale-100 rotate-0 opacity-100' 
              : 'scale-0 rotate-90 opacity-0'
          }`} 
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
