import React from 'react';
import { Menu } from 'lucide-react';

interface StudentMobileHeaderProps {
  onMenuOpen: () => void;
}

const StudentMobileHeader: React.FC<StudentMobileHeaderProps> = ({ onMenuOpen }) => {
  // Haptic feedback for native feel
  const handleMenuClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    onMenuOpen();
  };

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-4 flex items-center justify-between pt-safe">
      <button 
        onClick={handleMenuClick} 
        className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg touch-target-min active:scale-95 transition-transform"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #2dd4bf 100%)',
          touchAction: 'manipulation'
        }}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-white" />
      </button>
      <span className="text-xl font-black neural-gradient-text font-outfit">Cruzi</span>
      <div className="w-11" aria-hidden="true" />
    </header>
  );
};

export default StudentMobileHeader;
