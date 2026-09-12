import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook to immediately disable action triggers and enforce a cooldown period
 * preventing duplicate submissions, rapid double-clicks, and API spam.
 */
export const useCooldown = (defaultCooldownMs = 1500) => {
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const timeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const trigger = useCallback((asyncCallback, cooldownMs = defaultCooldownMs) => {
    return async (...args) => {
      if (isCoolingDown) return;

      setIsCoolingDown(true);

      try {
        if (typeof asyncCallback === 'function') {
          await asyncCallback(...args);
        }
      } finally {
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setIsCoolingDown(false);
          }
        }, cooldownMs);
      }
    };
  }, [isCoolingDown, defaultCooldownMs]);

  return { isCoolingDown, trigger };
};

export default useCooldown;
