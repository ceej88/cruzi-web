import React, { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ─── Animated Counter Hook ─── */
export function useAnimatedCounter(target: number, duration = 600) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number>();
  const prefersReduced = useReducedMotion();
  useEffect(() => {
    if (prefersReduced) {
      setDisplay(target);
      return;
    }
    const start = display;
    const diff = target - start;
    if (Math.abs(diff) < 0.5) {
      setDisplay(target);
      return;
    }
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + diff * ease);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, prefersReduced]);
  return display;
}

/* ─── Currency Formatter ─── */
export const formatPounds = (n: number) =>
  "£" + Math.round(n).toLocaleString("en-GB");

/* ─── Scroll-In Wrapper ─── */
export const FadeInSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ─── Stat Card ─── */
export const StatCard: React.FC<{
  label: string;
  value: string;
  highlight?: boolean;
  large?: boolean;
}> = ({ label, value, highlight, large }) => (
  <div
    className={`rounded-2xl p-4 sm:p-5 text-center transition-all ${
      highlight
        ? "bg-primary/5 border border-primary/20"
        : "bg-secondary/50 border border-border"
    } ${large ? "col-span-2 sm:col-span-1" : ""}`}
  >
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground mb-1">
      {label}
    </p>
    <p
      className={`font-black font-outfit tracking-tight ${
        large ? "text-3xl sm:text-4xl" : "text-2xl"
      } ${highlight ? "text-primary" : "text-foreground"}`}
    >
      {value}
    </p>
  </div>
);
