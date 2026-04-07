// Content Studio - Main Component (Native Mobile App Experience)

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Bell, MoreVertical, Palette, Award, Eye, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInstructorData } from '@/hooks/useInstructorData';
import { generateMilestoneCopy, generateTipSocialCopy } from '@/services/instructorAIService';
import { toast } from '@/hooks/use-toast';
import StudioTab from './StudioTab';
import BadgesTab from './BadgesTab';
import PreviewTab from './PreviewTab';
import ShareHub from './ShareHub';
import { TabType, triggerHaptic, getBadgeByKey } from './types';
import { renderCanvasImage } from './canvasExport';

const TABS: { id: TabType; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'studio', Icon: Palette },
  { id: 'badges', Icon: Award },
  { id: 'preview', Icon: Eye },
];

const ContentStudio: React.FC = () => {
  const navigate = useNavigate();
  const { students } = useInstructorData();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<TabType>('studio');

  // Identity inputs
  const [branding, setBranding] = useState('CRUZI ACADEMY');
  const [headline, setHeadline] = useState('MASTERY UNLOCKED');
  const [statusLine, setStatusLine] = useState('');

  // Selections
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState('cyber');
  const [selectedBadge, setSelectedBadge] = useState<string>('first_steps');

  // AI state
  const [caption, setCaption] = useState<{ text: string; hashtags: string[] } | null>(null);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);

  // UI feedback
  const [showSuccess, setShowSuccess] = useState(false);

  // Share Hub state
  const [showShareHub, setShowShareHub] = useState(false);
  const [exportedImageBlob, setExportedImageBlob] = useState<Blob | null>(null);
  const [exportedImageUrl, setExportedImageUrl] = useState<string>('');

  // Derive student info
  const activeStudent = useMemo(() => 
    students.find(s => s.id === selectedStudent) || students[0],
    [students, selectedStudent]
  );

  const studentName = activeStudent?.full_name || activeStudent?.email?.split('@')[0] || 'Student';

  // Auto-set status line from student level
  useEffect(() => {
    if (activeStudent?.level) {
      setStatusLine(activeStudent.level.replace('_', ' ').toUpperCase());
    }
  }, [activeStudent]);

  // Auto-generate caption when student or badge changes
  useEffect(() => {
    if (activeStudent && selectedBadge) {
      generateCaption();
    }
  }, [activeStudent?.id, selectedBadge]);

  const generateCaption = useCallback(async () => {
    if (!activeStudent) return;
    
    setIsGeneratingCaption(true);
    try {
      const badge = getBadgeByKey(selectedBadge);
      const badgeLabel = badge?.label || 'Achievement';
      const result = await generateMilestoneCopy(
        activeStudent.full_name || 'Student',
        `${badgeLabel} - ${activeStudent.level || 'BEGINNER'}`
      );
      setCaption({ text: result.caption, hashtags: result.hashtags });
    } catch {
      setCaption({
        text: `Celebrating ${activeStudent.full_name || 'our student'}'s incredible progress! 🚗💪`,
        hashtags: ['DrivingSchool', 'StudentSuccess', 'LearnToDrive'],
      });
    } finally {
      setIsGeneratingCaption(false);
    }
  }, [activeStudent, selectedBadge]);

  const handlePolish = async () => {
    setIsPolishing(true);
    try {
      const result = await generateTipSocialCopy(headline, statusLine || branding);
      setHeadline(result.caption.split('\n')[0].replace(/[💡🚗✨]/g, '').trim().toUpperCase().slice(0, 40));
      showSuccessToast('Identity polished!');
    } catch {
      toast({ title: 'Polish failed', variant: 'destructive' });
    } finally {
      setIsPolishing(false);
    }
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    
    try {
      const { blob, dataUrl } = await renderCanvasImage(canvasRef.current, {
        branding,
        headline,
        statusLine,
        studentName,
        themeId: selectedTheme,
        badgeKey: selectedBadge,
      });
      
      setExportedImageBlob(blob);
      setExportedImageUrl(dataUrl);
      setShowShareHub(true);
    } catch (error) {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  const showSuccessToast = (message: string) => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
    toast({ title: message });
  };

  const handleTabChange = (tab: TabType) => {
    triggerHaptic();
    setActiveTab(tab);
  };

  const handleBack = () => {
    triggerHaptic();
    navigate('/instructor');
  };

  return (
    <div 
      className="fixed inset-0 bg-background flex flex-col overflow-hidden"
      style={{ height: '100dvh' }}
    >
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CheckCircle className="h-4 w-4" />
            Success
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Branded Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 py-3 pt-safe">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <button 
            onClick={handleBack}
            className="h-11 w-11 flex items-center justify-center text-muted-foreground bg-card shadow-sm border border-border rounded-xl active:scale-95 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {/* Centered Cruzi Branding */}
          <div className="flex flex-col items-center">
            <span 
              className="text-base font-black tracking-tighter leading-none bg-gradient-to-r from-[hsl(var(--neural-violet))] via-[hsl(var(--neural-purple))] to-[hsl(var(--neural-teal))] bg-clip-text text-transparent"
            >
              Cruzi
            </span>
            <span className="uppercase tracking-widest leading-none mt-0.5 text-muted-foreground font-bold text-[9px]">
              V4.5
            </span>
          </div>
          
          {/* Right Icons */}
          <div className="flex items-center gap-1">
            <button className="h-11 w-11 flex items-center justify-center text-muted-foreground active:scale-95 transition-all">
              <Bell className="h-4 w-4" />
            </button>
            <button className="h-11 w-11 flex items-center justify-center text-muted-foreground active:scale-95 transition-all">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Premium Segmented Control */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-1 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-[2rem]">
          {TABS.map((tab) => {
            const Icon = tab.Icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 py-4 rounded-[30px] flex items-center justify-center transition-all duration-300 active:scale-95 ${
                  isActive 
                    ? 'bg-white dark:bg-slate-900 shadow-xl text-blue-600 dark:text-blue-400 border border-blue-50 dark:border-blue-900' 
                    : 'text-slate-300 dark:text-slate-500 hover:text-slate-400 dark:hover:text-slate-400'
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        className="flex-1 overflow-y-auto overscroll-y-contain pb-8 pt-2"
        style={{ touchAction: 'pan-y' }}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'studio' && (
            <StudioTab
              key="studio"
              branding={branding}
              setBranding={setBranding}
              headline={headline}
              setHeadline={setHeadline}
              statusLine={statusLine}
              setStatusLine={setStatusLine}
              selectedStudent={selectedStudent}
              setSelectedStudent={setSelectedStudent}
              selectedTheme={selectedTheme}
              setSelectedTheme={setSelectedTheme}
              students={students}
              isPolishing={isPolishing}
              onPolish={handlePolish}
            />
          )}
          {activeTab === 'badges' && (
            <BadgesTab
              key="badges"
              selectedBadge={selectedBadge}
              setSelectedBadge={setSelectedBadge}
            />
          )}
          {activeTab === 'preview' && (
            <PreviewTab
              key="preview"
              branding={branding}
              headline={headline}
              statusLine={statusLine}
              studentName={studentName}
              selectedTheme={selectedTheme}
              selectedBadge={selectedBadge}
              caption={caption}
              isGeneratingCaption={isGeneratingCaption}
              onRefreshCaption={generateCaption}
              onExport={handleExport}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Hidden Canvas for Export */}
      <canvas 
        ref={canvasRef} 
        width={1080} 
        height={1920} 
        className="hidden" 
      />

      {/* Share Hub Modal */}
      <ShareHub
        isOpen={showShareHub}
        onClose={() => setShowShareHub(false)}
        imageBlob={exportedImageBlob}
        imageUrl={exportedImageUrl}
        caption={caption}
      />
    </div>
  );
};

export default ContentStudio;
