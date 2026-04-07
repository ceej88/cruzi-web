import * as React from "react";
import { cn } from "@/lib/utils";
import { SkillProficiency } from "@/types";
import { Star } from "lucide-react";

interface SkillBadgeProps {
  level: SkillProficiency;
  label?: string;
  showStars?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const levelConfig = {
  [SkillProficiency.INTRODUCED]: {
    label: "Introduced",
    color: "bg-muted text-muted-foreground",
    stars: 1,
  },
  [SkillProficiency.UNDER_INSTRUCTION]: {
    label: "Helped",
    color: "bg-cruzi-cyan/20 text-cruzi-cyan",
    stars: 2,
  },
  [SkillProficiency.PROMPTED]: {
    label: "Prompted",
    color: "bg-cruzi-indigo/20 text-cruzi-indigo",
    stars: 3,
  },
  [SkillProficiency.SELDOM_PROMPTED]: {
    label: "Independent",
    color: "bg-cruzi-gold/20 text-cruzi-gold",
    stars: 4,
  },
  [SkillProficiency.INDEPENDENT]: {
    label: "Reflection",
    color: "bg-cruzi-success/20 text-cruzi-success",
    stars: 5,
  },
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

const SkillBadge: React.FC<SkillBadgeProps> = ({
  level,
  label,
  showStars = true,
  size = "md",
  className,
}) => {
  const config = levelConfig[level];
  const displayLabel = label || config.label;

  return (
    <div
      className={cn(
        "skill-badge inline-flex items-center gap-1.5 rounded-full font-medium",
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {showStars && (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3 w-3",
                i < config.stars ? "fill-current" : "fill-none opacity-30"
              )}
            />
          ))}
        </div>
      )}
      <span>{displayLabel}</span>
    </div>
  );
};

export { SkillBadge };
