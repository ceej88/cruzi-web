import React, { useState } from 'react';
import { X, LogOut, LucideIcon } from 'lucide-react';
import { useUnreadMessageCount } from '@/hooks/useUnreadMessages';
import GlowIcon from '@/components/ui/GlowIcon';
import TierIndicator from '@/components/subscription/TierIndicator';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import { cn } from '@/lib/utils';
interface MenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
}
interface SectionHeader {
  type: 'section';
  label: string;
}
type MenuItemOrSection = MenuItem | SectionHeader;
interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItemOrSection[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  onLogout: () => void;
}
const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
  isOpen,
  onClose,
  menuItems,
  activeTab,
  onTabChange,
  userName,
  onLogout
}) => {
  const unreadMessageCount = useUnreadMessageCount();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const handleNavigation = (tabId: string) => {
    navigator.vibrate?.(10);
    onTabChange(tabId);
    onClose();
  };
  return <>
      {/* Backdrop */}
      {isOpen && <div className="lg:hidden fixed inset-0 bg-foreground/60 backdrop-blur-sm z-[60] transition-opacity duration-300" onClick={onClose} />}

      {/* Drawer Container */}
      <div className={cn("lg:hidden w-72 h-screen text-white flex flex-col fixed left-0 top-0 z-[70]", "transition-transform duration-300 ease-in-out shadow-2xl overflow-hidden", isOpen ? 'translate-x-0' : '-translate-x-full')} style={{
      background: 'linear-gradient(180deg, #0f0a1a 0%, #1a0d25 50%, #0d1a1a 100%)'
    }}>
        {/* Neural Gradient glow overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-50" style={{
        background: 'radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.4) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(45, 212, 191, 0.3) 0%, transparent 50%)'
      }} />
        
        {/* Animated glow orbs */}
        <div className="absolute top-20 -left-10 w-40 h-40 rounded-full blur-3xl animate-pulse pointer-events-none" style={{
        backgroundColor: 'rgba(139, 92, 246, 0.25)'
      }} />
        <div className="absolute bottom-40 -right-10 w-32 h-32 rounded-full blur-3xl animate-pulse pointer-events-none" style={{
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        animationDelay: '1s'
      }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{
        backgroundColor: 'rgba(45, 212, 191, 0.15)'
      }} />

        {/* Header with Close Button */}
        <div className="relative p-6 pt-safe flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tighter neural-gradient-text">
              Cruzi
            </span>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-3 transition-colors active:scale-95 min-h-[48px] min-w-[48px] flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation - Mobile optimized (48px touch targets) */}
        <nav className="relative flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => {
          // Render section header
          if ('type' in item && item.type === 'section') {
            return <div key={`section-${index}`} className="flex items-center gap-3 px-2 py-3 mt-4 first:mt-0">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">
                    {item.label}
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>;
          }
          const menuItem = item as MenuItem;
          const Icon = menuItem.icon;
          const isActive = activeTab === menuItem.id;
          const glowColor = menuItem.id === 'growth-lab' ? 'amber' : menuItem.id === 'neural-matrix' ? 'indigo' : menuItem.id === 'compliance' ? 'emerald' : menuItem.id === 'broadcast' ? 'primary' : 'primary';
          return <button key={menuItem.id} onClick={() => handleNavigation(menuItem.id)} className={cn("w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative group min-h-[48px] active:scale-95", isActive ? 'text-white font-black' : 'text-white/60')} style={isActive ? {
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(168, 85, 247, 0.3) 50%, rgba(45, 212, 191, 0.2) 100%)',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)'
          } : undefined}>
                {/* Hover glow effect */}
                {!isActive && <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(45, 212, 191, 0.08) 100%)'
            }} />}
                
                {isActive ? <div className="relative">
                    <Icon className="h-5 w-5 text-[#a855f7] drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                  </div> : <GlowIcon icon={Icon} size={20} glowColor={glowColor as any} intensity="subtle" animated={menuItem.id === 'growth-lab' || menuItem.id === 'neural-matrix'} />}
                <span className="relative text-sm tracking-tight text-primary-foreground">{menuItem.label}</span>
                {menuItem.id === 'messages' && unreadMessageCount > 0 && <span className="absolute right-4 top-1/2 -translate-y-1/2 min-w-[20px] h-5 rounded-full text-[10px] font-black flex items-center justify-center px-1.5 text-white" style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
            }}>
                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                  </span>}
              </button>;
        })}
        </nav>

        {/* Bottom Section - User Profile */}
        <div className="relative p-4 mt-auto space-y-4 pb-safe">
          {/* Tier Indicator */}
          <div className="px-2">
            <TierIndicator onUpgradeClick={() => setIsUpgradeModalOpen(true)} />
          </div>

          {/* User Profile Section */}
          <div className="rounded-[2rem] p-5" style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(45, 212, 191, 0.08) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          boxShadow: '0 0 30px rgba(139, 92, 246, 0.1)'
        }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #2dd4bf 100%)',
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)'
            }}>
                {userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-white leading-none mb-1 truncate">{userName}</p>
              </div>
            </div>
            <button onClick={onLogout} className="w-full text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all text-white/60 hover:text-white active:scale-95 flex items-center justify-center gap-2 min-h-[48px]" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
              <LogOut className="h-3 w-3" />
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} reason="Unlock unlimited students and full features." />
    </>;
};
export default MobileSidebarDrawer;