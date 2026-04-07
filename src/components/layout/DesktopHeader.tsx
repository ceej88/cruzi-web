import React from 'react';
import { Bell, Rocket, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesktopHeaderProps {
  userName: string;
  onBellClick: () => void;
  unreadCount: number;
  onLogout: () => void;
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  userName,
  onBellClick,
  unreadCount,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Cruzi Intelligence Badge */}
        <div className="flex items-center gap-4">
          <div 
            className="px-4 py-2 rounded-xl border flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(168,85,247,0.05) 50%, rgba(45,212,191,0.03) 100%)',
              borderColor: 'rgba(139,92,246,0.2)'
            }}
          >
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest leading-none mb-1">Cruzi Intelligence</p>
              <p className="text-sm font-semibold text-violet-500/90 leading-none">Methodology Sync Active</p>
            </div>
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs shadow-sm"
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'rgb(16, 185, 129)'
              }}
              title="Cloud Sync Enabled"
            >
              <Rocket className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button 
            onClick={onBellClick}
            className="relative min-h-[36px] min-w-[36px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-[10px] font-black text-destructive-foreground flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-border" />

          {/* User Profile */}
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 group"
          >
            <div className="text-right">
              <p className="text-sm font-bold text-foreground leading-none mb-1 group-hover:text-destructive transition-colors">{userName}</p>
              <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest leading-none">Log Out</p>
            </div>
            <div 
              className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center text-white font-black text-xs"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #2dd4bf 100%)'
              }}
            >
              {userName.slice(0, 2).toUpperCase()}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;
