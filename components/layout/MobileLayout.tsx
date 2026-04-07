import * as React from "react";
import { cn } from "@/lib/utils";
import { BottomNav, NavItem } from "@/components/ui/BottomNav";
import { motion, AnimatePresence } from "framer-motion";

interface MobileLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  header?: React.ReactNode;
  fab?: React.ReactNode;
  className?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  navItems,
  activeTab,
  onTabChange,
  header,
  fab,
  className,
}) => {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-40 glass-card rounded-none border-x-0 border-t-0">
          <div className="px-4 py-3 pt-safe">{header}</div>
        </header>
      )}

      {/* Main Content */}
      <main className="pb-nav">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      {fab && fab}

      {/* Bottom Navigation */}
      <BottomNav items={navItems} activeId={activeTab} onSelect={onTabChange} />
    </div>
  );
};

export { MobileLayout };
