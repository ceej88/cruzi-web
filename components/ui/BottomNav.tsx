import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

const BottomNav: React.FC<BottomNavProps> = ({
  items,
  activeId,
  onSelect,
  className,
}) => {
  return (
    <nav className={cn("bottom-nav", className)}>
      <div className="flex items-center justify-around px-2 py-1">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "bottom-nav-item flex-1 relative",
                isActive && "active"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "h-6 w-6 relative z-10 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium relative z-10 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export { BottomNav };
