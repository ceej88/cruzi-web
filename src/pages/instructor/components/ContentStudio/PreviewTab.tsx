// Content Studio - Preview Tab (Live Poster & Export)

import React from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, Loader2, Sparkles, MoreVertical } from 'lucide-react';
import { getThemeById, getBadgeByKey, triggerHaptic } from './types';

interface PreviewTabProps {
  branding: string;
  headline: string;
  statusLine: string;
  studentName: string;
  selectedTheme: string;
  selectedBadge: string;
  caption: { text: string; hashtags: string[] } | null;
  isGeneratingCaption: boolean;
  onRefreshCaption: () => void;
  onExport: () => void;
}

const PreviewTab: React.FC<PreviewTabProps> = ({
  branding,
  headline,
  statusLine,
  studentName,
  selectedTheme,
  selectedBadge,
  caption,
  isGeneratingCaption,
  onRefreshCaption,
  onExport,
}) => {
  const theme = getThemeById(selectedTheme);
  const badge = getBadgeByKey(selectedBadge);
  const BadgeIcon = badge?.Icon;

  return (
    <div className="space-y-6 px-4">
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black uppercase tracking-tight">Content Studio</h2>
        <button className="p-2 text-muted-foreground active:scale-95 transition-all">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Live 9:16 Poster Preview with Decorative Background */}
      <div className="relative mx-auto max-w-[280px]">
        {/* Decorative Animated Gradient Rings */}
        <div 
          className="absolute inset-0 -m-8 rounded-full bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-teal-400/20 blur-2xl"
          style={{ animation: 'pulse 4s ease-in-out infinite' }}
        />
        <div 
          className="absolute inset-0 -m-4 rounded-full bg-gradient-to-tr from-teal-400/15 via-transparent to-violet-500/15 blur-xl"
          style={{ animation: 'pulse 3s ease-in-out infinite reverse' }}
        />

        {/* Poster */}
        <div className={`relative aspect-[9/16] rounded-[2rem] overflow-hidden bg-gradient-to-br ${theme.gradient} shadow-2xl`}>
          {/* Subtle grain texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none" 
               style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} 
          />
          
          <div className={`relative h-full flex flex-col items-center justify-between py-8 px-4 text-center ${
            theme.textColor === 'white' ? 'text-white' : 'text-slate-900'
          }`}>
            {/* Branding */}
            <p className="text-[8px] font-bold uppercase tracking-[0.4em] opacity-70">
              {branding || 'CRUZI ACADEMY'}
            </p>

            {/* Headline */}
            <div className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tight leading-none italic">
                {headline || 'MASTERY UNLOCKED'}
              </h2>
              
              {/* Glass Card */}
              <div className={`mx-auto px-6 py-5 rounded-2xl backdrop-blur-md ${
                theme.textColor === 'white' ? 'bg-white/10 border border-white/20' : 'bg-black/10 border border-black/20'
              }`}>
                {/* Badge Icon */}
                <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                  theme.textColor === 'white' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                }`}>
                  {BadgeIcon ? (
                    <BadgeIcon className="h-6 w-6" />
                  ) : (
                    <span className="text-lg font-black">?</span>
                  )}
                </div>
                
                {/* Student Name */}
                <h3 className="text-lg font-black uppercase tracking-tight">
                  {studentName || 'STUDENT NAME'}
                </h3>
                
                {/* Status Line */}
                <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-1 ${
                  theme.textColor === 'white' ? 'opacity-60' : 'opacity-50'
                }`}>
                  {statusLine || 'BEGINNER LEVEL'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <p className={`text-[7px] font-bold uppercase tracking-[0.3em] ${
              theme.textColor === 'white' ? 'opacity-40' : 'opacity-30'
            }`}>
              Powered by Cruzi
            </p>
          </div>
        </div>
      </div>

      {/* AI Caption Section */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> AI Caption
          </span>
          <button 
            onClick={() => { triggerHaptic(); onRefreshCaption(); }}
            disabled={isGeneratingCaption}
            className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 active:scale-95 transition-all disabled:opacity-50"
          >
            {isGeneratingCaption ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
        </div>

        {caption ? (
          <>
            <p className="text-sm font-medium text-foreground leading-relaxed italic">
              "{caption.text}"
            </p>
            <div className="flex flex-wrap gap-2">
              {caption.hashtags.map(tag => (
                <span key={tag} className="text-[10px] font-bold text-primary">#{tag}</span>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            {isGeneratingCaption ? 'Generating caption...' : 'Caption will generate when you select a student'}
          </p>
        )}
      </div>

      {/* Export Button */}
      <button 
        onClick={() => { triggerHaptic(30); onExport(); }}
        className="w-full py-5 bg-gradient-to-r from-violet-500 via-purple-500 to-teal-400 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-violet-500/30 flex items-center justify-center gap-3 active:scale-95 transition-transform"
      >
        <Download className="h-5 w-5" />
        Export Story Image
      </button>
    </div>
  );
};

export default PreviewTab;
