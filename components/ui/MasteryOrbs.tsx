import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MasteryOrbsProps {
  level: number;
  pendingLevel?: number;
  onChange?: (level: number) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { orb: "w-3 h-3", gap: "gap-1.5" },
  md: { orb: "w-4 h-4", gap: "gap-2" },
  lg: { orb: "w-5 h-5", gap: "gap-2.5" },
};

const MasteryOrbs: React.FC<MasteryOrbsProps> = ({
  level,
  pendingLevel,
  onChange,
  disabled = false,
  size = "md",
  className,
}) => {
  const { orb, gap } = sizeMap[size];
  const hasPending = pendingLevel !== undefined && pendingLevel !== level;

  return (
    <div className={cn("flex items-center", gap, className)}>
      {[1, 2, 3, 4, 5].map((orbLevel) => {
        const isFilled = level >= orbLevel;
        const isPending = hasPending && pendingLevel && pendingLevel >= orbLevel && orbLevel > level;
        const isHigh = orbLevel >= 4;

        return (
          <motion.button
            key={orbLevel}
            disabled={disabled}
            onClick={() => onChange?.(orbLevel)}
            whileHover={!disabled ? { scale: 1.2 } : undefined}
            whileTap={!disabled ? { scale: 0.9 } : undefined}
            className={cn(
              orb,
              "rounded-full transition-all duration-300 relative",
              disabled ? "cursor-default" : "cursor-pointer",
              isFilled
                ? isHigh
                  ? "bg-green-500 shadow-lg shadow-green-500/30"
                  : "bg-primary shadow-lg shadow-primary/30"
                : isPending
                ? "bg-transparent border-2 border-dashed border-indigo-400"
                : "bg-muted"
            )}
          >
            {/* Pending pulse animation */}
            {isPending && (
              <motion.div
                className="absolute inset-0 rounded-full bg-indigo-400"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export { MasteryOrbs };
