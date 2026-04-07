import React from 'react';
import { LogOut, X, LucideIcon } from 'lucide-react';
import { useUnreadMessageCount } from '@/hooks/useUnreadMessages';
import { useInstructorTier } from '@/hooks/useInstructorTier';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface StudentMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  onLogout: () => void;
}

const StudentMobileSidebar: React.FC<StudentMobileSidebarProps> = ({
  isOpen,
  onClose,
  menuItems,
  activeTab,
  onTabChange,
  userName,
  onLogout,
}) => {
  const unreadMessageCount = useUnreadMessageCount();
  const { isElite } = useInstructorTier();

  const handleNavClick = (tabId: string) => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    onTabChange(tabId);
    onClose();
  };

  const handleLogout = () => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    onLogout();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300" 
          onClick={onClose} 
        />
      )}

      {/* Sidebar Drawer */}
      <div 
        className={cn(
          "w-64 h-screen flex flex-col fixed left-0 top-0 z-[70] transition-transform duration-300 ease-in-out shadow-2xl lg:hidden overflow-hidden",
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ 
          background: 'linear-gradient(180deg, #0f0a1a 0%, #1a0d25 50%, #0d1a1a 100%)' 
        }}
      >
        {/* Neural Gradient glow overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-50" 
          style={{
            background: 'radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.4) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(45, 212, 191, 0.3) 0%, transparent 50%)'
          }} 
        />

        {/* Animated glow orbs - Tier aware */}
        <div 
          className={cn(
            "absolute top-20 -left-20 w-64 h-64 rounded-full blur-3xl animate-pulse pointer-events-none",
            isElite ? "bg-primary/30" : "bg-amber-500/30"
          )}
        />
        <div 
          className={cn(
            "absolute bottom-40 -right-20 w-48 h-48 rounded-full blur-3xl animate-pulse pointer-events-none",
            isElite ? "bg-primary/25" : "bg-amber-400/20"
          )}
          style={{ animationDelay: '1s' }}
        />
        
        {/* Header with close button */}
        <div className="relative z-10 p-8 flex flex-col items-center justify-center gap-3 pt-safe">
          <span className="text-2xl font-black tracking-tighter neural-gradient-text font-outfit">Cruzi</span>
          {/* Academy Tier Badge */}
          <div className={cn(
            "px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border",
            isElite 
              ? "bg-primary/10 text-primary border-primary/20" 
              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
          )}>
            ACADEMY {isElite ? 'ELITE' : 'LITE'}
          </div>
          <button 
            onClick={onClose} 
            className="absolute right-4 top-6 text-white/60 hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform"
            style={{ touchAction: 'manipulation' }}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation - Mobile optimized (larger touch targets) */}
        <nav className="relative z-10 flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide scroll-smooth overscroll-contain">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all min-h-[56px] active:scale-95 relative",
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
                style={{
                  touchAction: 'manipulation',
                  ...(isActive ? {
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(168, 85, 247, 0.3) 50%, rgba(45, 212, 191, 0.2) 100%)',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
                  } : {})
                }}
              >
                <Icon className={cn("w-5 h-5", isActive && "text-[#a855f7]")} />
                <span>{item.label}</span>
                {item.id === 'messages' && unreadMessageCount > 0 && (
                  <span 
                    className="absolute right-4 top-1/2 -translate-y-1/2 min-w-[20px] h-[20px] rounded-full text-[10px] font-black flex items-center justify-center px-1.5 text-white" 
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                    }}
                  >
                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer with logout */}
        <div className="relative z-10 p-6 pb-safe">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 text-white/60 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30 transition-all min-h-[56px] active:scale-95"
            style={{ touchAction: 'manipulation' }}
          >
            <LogOut className="h-4 w-4" />
            Exit Portal
          </button>
        </div>
      </div>
    </>
  );
};

export default StudentMobileSidebar;
