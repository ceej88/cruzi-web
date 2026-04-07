import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface MobileBottomNavProps {
  items: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  items,
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="shrink-0 bg-card border-t border-border px-4 py-2 pb-safe z-50">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                navigator.vibrate?.(10);
                onTabChange(item.id);
              }}
              className={cn(
                "flex flex-col items-center gap-1 min-h-[56px] min-w-[56px] px-4 py-2 rounded-xl",
                "active:scale-95 transition-all",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              style={{ touchAction: 'manipulation' }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
