// Content Studio - Share Hub Modal

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  X, 
  Share2, 
  Copy, 
  Download, 
  Instagram, 
  Music2, 
  Ghost, 
  MessageCircle,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import {
  PLATFORMS,
  Platform,
  canNativeShare,
  canShareFiles,
  nativeShare,
  copyToClipboard,
  formatCaption,
  downloadImage,
  openPlatform,
  getShareInstruction,
  triggerHaptic,
} from './shareUtils';

interface ShareHubProps {
  isOpen: boolean;
  onClose: () => void;
  imageBlob: Blob | null;
  imageUrl: string;
  caption: { text: string; hashtags: string[] } | null;
}

const PLATFORM_ICONS: Record<Platform, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  tiktok: Music2,
  snapchat: Ghost,
  whatsapp: MessageCircle,
};

const ShareHub: React.FC<ShareHubProps> = ({
  isOpen,
  onClose,
  imageBlob,
  imageUrl,
  caption,
}) => {
  const isMobile = useIsMobile();
  const [canFileShare, setCanFileShare] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Check file sharing capability on mount
  React.useEffect(() => {
    if (imageBlob && isOpen) {
      const file = new File([imageBlob], 'test.png', { type: 'image/png' });
      canShareFiles(file).then(setCanFileShare);
    }
  }, [imageBlob, isOpen]);

  const fullCaption = formatCaption(caption);

  const handleNativeShare = useCallback(async () => {
    if (!imageBlob) return;
    
    triggerHaptic(15);
    setIsSharing(true);
    
    toast({ title: 'Opening share menu...' });
    
    const success = await nativeShare(imageBlob, fullCaption);
    
    if (!success && !canNativeShare()) {
      toast({ title: 'Sharing not supported on this device', variant: 'destructive' });
    }
    
    setIsSharing(false);
  }, [imageBlob, fullCaption]);

  const handleCopyCaption = useCallback(async () => {
    triggerHaptic();
    
    const success = await copyToClipboard(fullCaption);
    
    if (success) {
      toast({ title: 'Caption copied to clipboard!' });
    } else {
      toast({ title: 'Failed to copy caption', variant: 'destructive' });
    }
  }, [fullCaption]);

  const handleDownload = useCallback(() => {
    triggerHaptic();
    downloadImage(imageUrl);
    toast({ title: 'Image saved to downloads!' });
  }, [imageUrl]);

  const handlePlatformShare = useCallback(async (platformId: Platform) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;

    triggerHaptic(20);

    // 1. Download image
    downloadImage(imageUrl);

    // 2. Copy caption
    await copyToClipboard(fullCaption);

    // 3. Show instruction toast
    const instruction = getShareInstruction(platformId, isMobile);
    toast({ title: instruction });

    // 4. Open platform (mobile deep link or desktop fallback)
    setTimeout(() => {
      openPlatform(platform, isMobile, fullCaption);
    }, 500);
  }, [imageUrl, fullCaption, isMobile]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            style={{ 
              maxHeight: '85vh',
              paddingBottom: 'env(safe-area-inset-bottom)'
            }}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Image Ready!</h2>
                  <p className="text-xs text-muted-foreground">Share your achievement</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(85vh - 120px)' }}>
              {/* Preview Thumbnail */}
              {imageUrl && (
                <div className="mx-auto w-32 aspect-[9/16] rounded-2xl overflow-hidden shadow-lg border border-border/50">
                  <img 
                    src={imageUrl} 
                    alt="Export preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Device Info */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                {isMobile ? (
                  <>
                    <Smartphone className="h-3 w-3" />
                    <span>Mobile sharing enabled</span>
                  </>
                ) : (
                  <>
                    <Monitor className="h-3 w-3" />
                    <span>Desktop mode</span>
                  </>
                )}
              </div>

              {/* Native Share (Mobile Only) */}
              {isMobile && canFileShare && (
                <button
                  onClick={handleNativeShare}
                  disabled={isSharing}
                  className="w-full py-4 bg-gradient-to-r from-violet-500 via-purple-500 to-teal-400 text-white rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-violet-500/30 flex items-center justify-center gap-3 active:scale-95 transition-transform disabled:opacity-50"
                >
                  <Share2 className="h-5 w-5" />
                  Share to Stories
                </button>
              )}

              {/* Platform Buttons Grid */}
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map((platform) => {
                  const Icon = PLATFORM_ICONS[platform.id];
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handlePlatformShare(platform.id)}
                      className={`py-4 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all bg-gradient-to-r ${platform.gradient} ${
                        platform.id === 'snapchat' ? 'text-black' : 'text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {platform.label}
                    </button>
                  );
                })}
              </div>

              {/* Copy Caption */}
              <button
                onClick={handleCopyCaption}
                className="w-full py-4 bg-muted hover:bg-muted/80 text-foreground rounded-2xl font-bold text-sm flex items-center justify-center gap-3 active:scale-95 transition-all border border-border/50"
              >
                <Copy className="h-5 w-5" />
                Copy Caption
              </button>

              {/* Download Image */}
              <button
                onClick={handleDownload}
                className="w-full py-4 bg-muted hover:bg-muted/80 text-foreground rounded-2xl font-bold text-sm flex items-center justify-center gap-3 active:scale-95 transition-all border border-border/50"
              >
                <Download className="h-5 w-5" />
                Download Image
              </button>

              {/* Caption Preview */}
              {caption && (
                <div className="bg-muted/50 rounded-2xl p-4 border border-border/30">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Caption Preview</p>
                  <p className="text-sm text-foreground italic">"{caption.text}"</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {caption.hashtags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold text-primary">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Desktop Instructions */}
              {!isMobile && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    💡 For best results, open this page on your mobile device to use the native share sheet.
                  </p>
                </div>
              )}
            </div>

            {/* Done Button */}
            <div className="p-4 border-t border-border/50">
              <button
                onClick={onClose}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm uppercase tracking-wider active:scale-95 transition-transform"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareHub;
