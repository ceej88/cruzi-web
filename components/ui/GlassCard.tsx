import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "solid" | "glow";
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4 md:p-6",
  lg: "p-6 md:p-8",
};

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    const baseClasses = cn(
      "relative overflow-hidden rounded-2xl",
      "backdrop-blur-xl border transition-all duration-300",
      paddingStyles[padding]
    );

    const variantClasses = {
      default: "glass-card",
      solid: "glass-card-solid",
      glow: "glass-card card-glow",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
