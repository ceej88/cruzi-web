import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScribeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const LEVEL_GUIDES = [
  {
    level: 1,
    label: 'Introduced',
    keywords: '"introduced", "first time", "explained", "new to"',
    example: '"Today I introduced Sarah to roundabouts for the first time."',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    level: 2,
    label: 'Practiced',
    keywords: '"practiced", "working on", "attempted", "trying"',
    example: '"We practiced emergency stops. She\'s still working on the reaction time."',
    color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  },
  {
    level: 3,
    label: 'Prompted',
    keywords: '"needs reminding", "with prompts", "guided", "reminded"',
    example: '"Her mirror checks are good but she still needs the occasional reminder."',
    color: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  },
  {
    level: 4,
    label: 'Seldom Prompted',
    keywords: '"mostly independent", "rarely needs", "occasional help"',
    example: '"Junctions are looking solid now, she rarely needs any prompting."',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    level: 5,
    label: 'Independent',
    keywords: '"independent", "mastered", "confident", "no prompting"',
    example: '"Her parallel parking is now completely independent and test-ready."',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
];

const ScribeGuide: React.FC<ScribeGuideProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">How to Narrate</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Trigger phrases for AI
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                <Mic className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white mb-1">Speak naturally about the lesson</p>
                  <p className="text-xs text-slate-400">
                    The AI will detect skills and mastery levels based on keywords in your reflection.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {LEVEL_GUIDES.map((guide) => (
                  <div
                    key={guide.level}
                    className={`p-4 rounded-2xl border ${guide.color}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-black">Level {guide.level}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                        {guide.label}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium mb-2 opacity-80">
                      Keywords: {guide.keywords}
                    </p>
                    <p className="text-xs italic opacity-60">{guide.example}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-700">
              <Button
                onClick={onClose}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black tracking-wide"
              >
                Got It
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScribeGuide;
