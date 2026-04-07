import * as React from "react";
import { cn } from "@/lib/utils";
import { PupilLevel } from "@/types";
import { LEVEL_CONFIG } from "@/constants";

interface LevelBadgeProps {
  level: PupilLevel;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  size = "md",
  className,
}) => {
  const config = LEVEL_CONFIG[level];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  );
};

export { LevelBadge };
