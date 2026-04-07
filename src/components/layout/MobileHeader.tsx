import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
interface MobileHeaderProps {
  onMenuOpen: () => void;
  onBellClick: () => void;
  unreadCount: number;
}
const MobileHeader: React.FC<MobileHeaderProps> = ({
  onMenuOpen,
  onBellClick,
  unreadCount
}) => {
  return <header className="shrink-0 px-4 py-3 flex items-center justify-between bg-background/95 backdrop-blur-md border-b border-border z-40">
      {/* Menu Button */}
      <button onClick={() => {
      navigator.vibrate?.(10);
      onMenuOpen();
    }} className="min-h-[48px] min-w-[48px] flex items-center justify-center text-muted-foreground bg-card shadow-sm border border-border rounded-xl active:scale-95 transition-all">
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo */}
      <div className="flex flex-col items-center">
        <span 
          className="text-lg font-black tracking-tighter leading-none bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#2DD4BF] bg-clip-text text-transparent"
          style={{ 
            animation: 'text-glow 3s ease-in-out infinite',
            filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.5)) drop-shadow(0 0 16px rgba(45,212,191,0.3))'
          }}
        >
          Cruzi
        </span>
        <span className="uppercase tracking-widest leading-none mt-1 text-muted-foreground font-bold text-[10px]">V4.5</span>
      </div>

      {/* Notification Bell */}
      <button onClick={() => {
      navigator.vibrate?.(10);
      onBellClick();
    }} className="relative min-h-[48px] min-w-[48px] flex items-center justify-center text-muted-foreground active:scale-95 transition-all">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && <span className="absolute top-2 right-2 w-5 h-5 bg-destructive rounded-full border-2 border-background text-[10px] font-black text-destructive-foreground flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>}
      </button>
    </header>;
};
export default MobileHeader;