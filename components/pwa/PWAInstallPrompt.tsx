import React from 'react';
import { X, Zap, Share, MoreVertical, Download } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';

const PWAInstallPrompt: React.FC = () => {
  const { 
    shouldShowPrompt, 
    platform, 
    installApp, 
    dismissPrompt, 
    isInstallable 
  } = usePWAInstall();

  if (!shouldShowPrompt || !isInstallable) return null;

  const handleInstall = async () => {
    if (navigator.vibrate) navigator.vibrate(20);
    
    if (platform === 'android') {
      const success = await installApp();
      if (!success) {
        // Fallback handled by UI instructions
      }
    }
    // iOS shows instructions only
  };

  const handleDismiss = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    dismissPrompt();
  };

  return (
    <Drawer open={shouldShowPrompt} onOpenChange={(open) => !open && handleDismiss()}>
      <DrawerContent className="bg-[hsl(var(--background))] border-t border-border/50 rounded-t-[32px] max-h-[75vh]">
        {/* Neural gradient glow effect */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[80px] -mr-20 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 blur-[60px] -ml-16 -mb-16 pointer-events-none" />
        
        <DrawerHeader className="relative z-10 text-center pt-6 pb-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/80 to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <Zap size={32} fill="white" className="text-primary-foreground" />
            </div>
          </div>
          <DrawerTitle className="text-2xl font-black italic uppercase tracking-tight text-foreground">
            Install Cruzi
          </DrawerTitle>
          <DrawerDescription className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Add to home screen for the best experience
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 pb-4 relative z-10">
          {/* Benefits grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { emoji: '⚡', text: 'Instant access' },
              { emoji: '📴', text: 'Works offline' },
              { emoji: '🚀', text: 'Faster loading' },
              { emoji: '📲', text: 'Native app feel' },
            ].map((benefit, i) => (
              <div 
                key={i} 
                className="bg-muted/50 rounded-2xl p-4 flex items-center gap-3 border border-border/50"
              >
                <span className="text-xl">{benefit.emoji}</span>
                <span className="text-sm font-semibold text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Platform-specific instructions */}
          <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
            {platform === 'ios' ? (
              <div className="flex items-start gap-4">
                <Share size={24} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    Tap the <span className="font-bold text-primary">Share</span> button in Safari, 
                    then scroll down and tap{' '}
                    <span className="font-bold italic">"Add to Home Screen"</span>
                  </p>
                </div>
              </div>
            ) : platform === 'android' ? (
              <div className="flex items-start gap-4">
                <Download size={24} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    Tap <span className="font-bold text-primary">Install</span> below, or use your browser menu{' '}
                    <MoreVertical size={16} className="inline-block mx-1" /> and select{' '}
                    <span className="font-bold italic">"Install App"</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <Download size={24} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    Click the install icon in your browser's address bar, or use the menu to{' '}
                    <span className="font-bold italic">"Install Cruzi"</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DrawerFooter className="relative z-10 pt-2 pb-8 gap-3">
          {platform === 'android' && (
            <Button 
              onClick={handleInstall}
              className="w-full h-14 text-base font-black uppercase tracking-wider rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
            >
              <Download size={20} className="mr-2" />
              Install Now
            </Button>
          )}
          <Button 
            variant="ghost" 
            onClick={handleDismiss}
            className="w-full h-12 text-muted-foreground font-semibold"
          >
            <X size={18} className="mr-2" />
            Maybe Later
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default PWAInstallPrompt;
