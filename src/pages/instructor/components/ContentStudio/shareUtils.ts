// Content Studio - Share Utilities

import { toast } from '@/hooks/use-toast';

export type Platform = 'instagram' | 'tiktok' | 'snapchat' | 'whatsapp';

export interface PlatformConfig {
  id: Platform;
  label: string;
  deepLink: string;
  webFallback?: string;
  color: string;
  gradient: string;
}

export const PLATFORMS: PlatformConfig[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    deepLink: 'instagram://camera',
    webFallback: 'https://www.instagram.com/',
    color: '#E4405F',
    gradient: 'from-pink-500 via-purple-500 to-orange-400',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    deepLink: 'tiktok://',
    webFallback: 'https://www.tiktok.com/',
    color: '#000000',
    gradient: 'from-slate-900 to-slate-700',
  },
  {
    id: 'snapchat',
    label: 'Snapchat',
    deepLink: 'snapchat://',
    webFallback: 'https://www.snapchat.com/',
    color: '#FFFC00',
    gradient: 'from-yellow-400 to-yellow-500',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    deepLink: 'whatsapp://send?text=',
    webFallback: 'https://web.whatsapp.com/',
    color: '#25D366',
    gradient: 'from-green-500 to-green-600',
  },
];

/**
 * Check if Web Share API is available and supports file sharing
 */
export const canNativeShare = (): boolean => {
  return typeof navigator !== 'undefined' && 'share' in navigator;
};

/**
 * Check if Web Share API can share files (not just text/URLs)
 */
export const canShareFiles = async (file: File): Promise<boolean> => {
  if (!canNativeShare()) return false;
  try {
    return navigator.canShare?.({ files: [file] }) ?? false;
  } catch {
    return false;
  }
};

/**
 * Native share using Web Share API
 */
export const nativeShare = async (
  blob: Blob,
  caption: string,
  filename = 'cruzi-achievement.png'
): Promise<boolean> => {
  try {
    const file = new File([blob], filename, { type: 'image/png' });
    
    if (!navigator.canShare?.({ files: [file] })) {
      return false;
    }

    await navigator.share({
      files: [file],
      title: 'Cruzi Achievement',
      text: caption,
    });

    return true;
  } catch (error) {
    // User cancelled or share failed
    if ((error as Error).name !== 'AbortError') {
      console.error('Share failed:', error);
    }
    return false;
  }
};

/**
 * Copy text to clipboard with fallback
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch {
    return false;
  }
};

/**
 * Format caption with hashtags
 */
export const formatCaption = (caption: { text: string; hashtags: string[] } | null): string => {
  if (!caption) return '';
  const hashtags = caption.hashtags.map(t => `#${t}`).join(' ');
  return `${caption.text}\n\n${hashtags}`;
};

/**
 * Download image from data URL
 */
export const downloadImage = (dataUrl: string, filename?: string): void => {
  const link = document.createElement('a');
  link.download = filename || `Cruzi_Content_${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
};

/**
 * Open platform deep link (mobile) or web fallback (desktop)
 */
export const openPlatform = (platform: PlatformConfig, isMobile: boolean, caption = ''): void => {
  if (isMobile) {
    // For WhatsApp, append the caption to the deep link
    if (platform.id === 'whatsapp' && caption) {
      window.location.href = `${platform.deepLink}${encodeURIComponent(caption)}`;
    } else {
      window.location.href = platform.deepLink;
    }
  } else if (platform.webFallback) {
    // Desktop: always open web fallback
    if (platform.id === 'whatsapp' && caption) {
      window.open(`${platform.webFallback}send?text=${encodeURIComponent(caption)}`, '_blank');
    } else {
      window.open(platform.webFallback, '_blank');
    }
  }
};

/**
 * Get instruction message for platform share
 */
export const getShareInstruction = (platform: Platform, isMobile: boolean): string => {
  if (isMobile) {
    return `Image saved! Caption copied. Opening ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`;
  }
  return `Image downloaded. Open ${platform.charAt(0).toUpperCase() + platform.slice(1)} on your phone to share.`;
};

/**
 * Trigger haptic feedback if available
 */
export const triggerHaptic = (duration = 10): void => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(duration);
  }
};
