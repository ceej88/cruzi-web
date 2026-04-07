import React, { useCallback } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Link2, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShareBarProps {
  title: string;
  url: string;
  description?: string;
}

const ShareBar: React.FC<ShareBarProps> = ({ title, url, description }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || '');

  const shareLinks = [
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-[#25D366] hover:text-white',
    },
    {
      label: 'X / Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'hover:bg-foreground hover:text-background',
    },
    {
      label: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-[#1877F2] hover:text-white',
    },
    {
      label: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-[#0A66C2] hover:text-white',
    },
  ];

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url, text: description });
      } catch {
        // user cancelled
      }
    }
  }, [title, url, description]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied!', description: 'Paste it anywhere to share.' });
    } catch {
      toast({ title: 'Could not copy link', variant: 'destructive' });
    }
  }, [url]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1">Share</span>
      
      {shareLinks.map(({ label, icon: Icon, href, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          className={`w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground transition-all ${color}`}
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}

      <button
        onClick={handleCopyLink}
        aria-label="Copy link"
        className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
      >
        <Link2 className="h-4 w-4" />
      </button>

      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={handleNativeShare}
          aria-label="Share"
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Share2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ShareBar;
