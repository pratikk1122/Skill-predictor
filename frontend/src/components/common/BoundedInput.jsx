import React from 'react';
import { sanitizeInput, countWords } from '../../utils/sanitize';

export const BoundedInput = ({
  id,
  value = "",
  onChange,
  label,
  placeholder,
  as = "input",
  rows = 3,
  minChars = 0,
  maxChars = 300,
  minWords = 0,
  maxWords = 60,
  helperText,
  disabled = false,
  className = "",
  required = false
}) => {
  const currentChars = value.length;
  const currentWords = countWords(value);

  const isUnderMinChars = minChars > 0 && currentChars > 0 && currentChars < minChars;
  const isOverMaxChars = currentChars >= maxChars;
  const isNearLimit = currentChars >= maxChars * 0.85;

  const isUnderMinWords = minWords > 0 && currentWords > 0 && currentWords < minWords;
  const isOverMaxWords = maxWords > 0 && currentWords > maxWords;

  const hasWarning = isUnderMinChars || isUnderMinWords;
  const hasError = isOverMaxChars || isOverMaxWords;

  const handleChange = (e) => {
    let nextVal = e.target.value;
    // Strictly cap characters at maxChars
    if (nextVal.length > maxChars) {
      nextVal = nextVal.slice(0, maxChars);
    }
    // Sanitize malicious tags
    const clean = sanitizeInput(nextVal);
    onChange(clean);
  };

  const Component = as === "textarea" ? "textarea" : "input";

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between items-center px-1">
          <label htmlFor={id} className="block text-xs font-bold text-slate-700 dark:text-slate-200">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className={`font-semibold ${
              hasError 
                ? "text-rose-500 font-bold" 
                : isNearLimit 
                ? "text-amber-500" 
                : "text-slate-400 dark:text-slate-400"
            }`}>
              {currentChars}/{maxChars} chars
            </span>
            {maxWords > 0 && (
              <span className="text-slate-400 dark:text-slate-400 hidden sm:inline">
                • {currentWords}/{maxWords} words
              </span>
            )}
          </div>
        </div>
      )}

      <div className="relative">
        <Component
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={as === "textarea" ? rows : undefined}
          disabled={disabled}
          className={`w-full px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border rounded-2xl text-xs sm:text-sm font-medium
            text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 outline-none transition-all
            ${hasError 
              ? "border-rose-400 focus:ring-2 focus:ring-rose-400/20" 
              : isNearLimit 
              ? "border-amber-400 focus:ring-2 focus:ring-amber-400/20" 
              : "border-slate-200 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        />
      </div>

      {/* Helper and Bound Validation Feedback */}
      <div className="flex justify-between items-center text-[10px] px-1 font-medium">
        {hasWarning ? (
          <span className="text-amber-600 dark:text-amber-400 font-semibold">
            {isUnderMinChars && `Must be at least ${minChars} characters.`}
            {isUnderMinWords && ` Recommend at least ${minWords} words for better accuracy.`}
          </span>
        ) : hasError ? (
          <span className="text-rose-600 dark:text-rose-400 font-semibold">
            Maximum limit reached. Excess characters are trimmed.
          </span>
        ) : helperText ? (
          <span className="text-slate-400 dark:text-slate-400">{helperText}</span>
        ) : <span />}

        {/* Visual Progress Bar */}
        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              hasError ? "bg-rose-500" : isNearLimit ? "bg-amber-500" : "bg-teal-500"
            }`}
            style={{ width: `${Math.min(100, (currentChars / maxChars) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default BoundedInput;
