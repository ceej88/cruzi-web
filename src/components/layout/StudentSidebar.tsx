import React, { useState } from 'react';
import { LogOut, Home, MessageCircle, Map, Brain, Users, MapPin, Radio, BookOpen, BarChart3, Settings, LucideIcon } from 'lucide-react';
import { useUnreadMessageCount } from '@/hooks/useUnreadMessages';
import { useInstructorTier } from '@/hooks/useInstructorTier';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface StudentSidebarProps {
  menuItems: MenuItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  onLogout: () => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({
  menuItems,
  activeTab,
  onTabChange,
  userName,
  onLogout,
}) => {
  const unreadMessageCount = useUnreadMessageCount();
  const { isElite } = useInstructorTier();

  return (
    <aside 
      className="w-64 h-screen text-white flex flex-col shrink-0 relative overflow-hidden"
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
          "absolute top-20 -left-10 w-40 h-40 rounded-full blur-3xl animate-pulse pointer-events-none",
          isElite ? "bg-[rgba(139,92,246,0.25)]" : "bg-[rgba(251,191,36,0.25)]"
        )}
      />
      <div 
        className={cn(
          "absolute bottom-40 -right-10 w-32 h-32 rounded-full blur-3xl animate-pulse pointer-events-none",
          isElite ? "bg-[rgba(168,85,247,0.2)]" : "bg-[rgba(251,191,36,0.15)]"
        )}
        style={{ animationDelay: '1s' }} 
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none" 
        style={{ backgroundColor: 'rgba(45, 212, 191, 0.15)' }} 
      />

      {/* Logo Header */}
      <div className="relative p-6 flex flex-col items-center gap-3">
        <span className="text-2xl font-black tracking-tighter neural-gradient-text">
          Cruzi
        </span>
        {/* Academy Tier Badge */}
        <div className={cn(
          "px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border",
          isElite 
            ? "bg-primary/10 text-primary border-primary/20" 
            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
        )}>
          ACADEMY {isElite ? 'ELITE' : 'LITE'}
        </div>
      </div>
      
      {/* Navigation - Desktop optimized (smaller targets for mouse) */}
      <nav className="relative flex-1 px-3 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button 
              key={item.id} 
              onClick={() => onTabChange(item.id)} 
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 relative group min-h-[36px]",
                isActive ? 'text-white font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
              style={isActive ? {
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(168, 85, 247, 0.3) 50%, rgba(45, 212, 191, 0.2) 100%)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.3)'
              } : undefined}
            >
              <Icon 
                className={cn(
                  "h-4 w-4",
                  isActive && "text-[#a855f7] drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                )} 
              />
              <span className="relative text-sm tracking-tight">{item.label}</span>
              {item.id === 'messages' && unreadMessageCount > 0 && (
                <span 
                  className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[18px] h-[18px] rounded-full text-[9px] font-black flex items-center justify-center px-1 text-white" 
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

      {/* Bottom Section - User Profile */}
      <div className="relative p-3 mt-auto space-y-3">
        {/* User Profile Section */}
        <div 
          className="rounded-2xl p-4" 
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(45, 212, 191, 0.08) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.1)'
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-xs" 
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #2dd4bf 100%)',
                boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)'
              }}
            >
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white leading-none truncate">{userName}</p>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="w-full text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-lg transition-all text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center gap-2 min-h-[36px]" 
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <LogOut className="h-3 w-3" />
            Exit Portal
          </button>
        </div>
      </div>
    </aside>
  );
};

// Export icon mapping for menu items
export const studentMenuIcons: Record<string, LucideIcon> = {
  'home': Home,
  'messages': MessageCircle,
  'learning-path': Map,
  'cruzi-ai': Brain,
  'parent-plan': Users,
  'intel': MapPin,
  'practice': Radio,
  'study': BookOpen,
  'syllabus': BarChart3,
  'settings': Settings,
};

export default StudentSidebar;
