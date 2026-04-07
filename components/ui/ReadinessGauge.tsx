import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ReadinessGaugeProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  sublabel?: string;
}

const ReadinessGauge: React.FC<ReadinessGaugeProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  className,
  label,
  sublabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  // Color based on percentage
  const getColor = () => {
    if (percentage >= 80) return "stroke-green-500";
    if (percentage >= 60) return "stroke-cruzi-gold";
    if (percentage >= 40) return "stroke-primary";
    return "stroke-muted-foreground";
  };

  const getGlowColor = () => {
    if (percentage >= 80) return "drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]";
    if (percentage >= 60) return "drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]";
    if (percentage >= 40) return "drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]";
    return "";
  };

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className={cn("transform -rotate-90", getGlowColor())}
      >
        {/* Background circle */}
        <circle
          className="stroke-muted"
          fill="none"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <motion.circle
          className={cn(getColor(), "transition-all duration-700")}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-black text-foreground"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {Math.round(percentage)}%
        </motion.span>
        {label && (
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[7px] font-bold text-muted-foreground/70 uppercase tracking-wide">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

export { ReadinessGauge };
