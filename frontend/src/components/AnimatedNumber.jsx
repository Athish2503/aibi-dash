import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedNumber
 * Smoothly interpolates numerical values with an exponential ease-out curve.
 * Gives executive dashboard KPI metrics an authored, living feel.
 */
export default function AnimatedNumber({
  value = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 650,
  className = '',
}) {
  const numericTarget = typeof value === 'number'
    ? value
    : parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;

  const [currentVal, setCurrentVal] = useState(numericTarget);
  const startValRef = useRef(numericTarget);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const start = startValRef.current;
    const target = numericTarget;
    if (start === target) return;

    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Confident natural deceleration: cubic-bezier(0.16, 1, 0.3, 1) approximation
      const ease = 1 - Math.pow(1 - progress, 3.2);
      const next = start + (target - start) * ease;

      setCurrentVal(next);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentVal(target);
        startValRef.current = target;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [numericTarget, duration]);

  const formatted = currentVal.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`tabular-nums font-mono ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
