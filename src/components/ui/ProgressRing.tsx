import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: "primary" | "success" | "gold" | "cyan";
  showValue?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const colorMap = {
  primary: "stroke-primary",
  success: "stroke-cruzi-success",
  gold: "stroke-cruzi-gold",
  cyan: "stroke-cruzi-cyan",
};

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 80,
  strokeWidth = 6,
  color = "primary",
  showValue = true,
  className,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn("progress-ring", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
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
        <circle
          className={cn(colorMap[color], "transition-all duration-500 ease-out")}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          showValue && (
            <span className="text-lg font-bold font-outfit">
              {Math.round(progress)}%
            </span>
          )
        )}
      </div>
    </div>
  );
};

export { ProgressRing };
