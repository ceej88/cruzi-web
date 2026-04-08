import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

interface GradientButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "accent" | "gold" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-9 px-4 text-sm rounded-lg",
      md: "h-11 px-6 text-base rounded-xl",
      lg: "h-14 px-8 text-lg rounded-xl",
      icon: "h-11 w-11 rounded-xl",
    };

    const variantClasses = {
      primary: "bg-[#7c3aed] text-white shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:bg-[#6d28d9] hover:shadow-[0_0_40px_rgba(124,58,237,0.7)]",
      accent: "btn-gradient-accent",
      gold: "btn-gradient-gold",
      outline:
        "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium",
          "touch-target transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        disabled={disabled || isLoading}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {size !== "icon" && children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

GradientButton.displayName = "GradientButton";

export { GradientButton };
