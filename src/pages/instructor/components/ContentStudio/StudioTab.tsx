// Content Studio - Studio Tab (Identity & Theming)

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import { THEMES, ThemeConfig, triggerHaptic } from './types';

interface StudioTabProps {
  branding: string;
  setBranding: (value: string) => void;
  headline: string;
  setHeadline: (value: string) => void;
  statusLine: string;
  setStatusLine: (value: string) => void;
  selectedStudent: string;
  setSelectedStudent: (value: string) => void;
  selectedTheme: string;
  setSelectedTheme: (value: string) => void;
  students: Array<{ id: string; full_name: string | null; email: string }>;
  isPolishing: boolean;
  onPolish: () => void;
}

const StudioTab: React.FC<StudioTabProps> = ({
  branding,
  setBranding,
  headline,
  setHeadline,
  statusLine,
  setStatusLine,
  selectedStudent,
  setSelectedStudent,
  selectedTheme,
  setSelectedTheme,
  students,
  isPolishing,
  onPolish,
}) => {
  const handleThemeSelect = (themeId: string) => {
    triggerHaptic();
    setSelectedTheme(themeId);
  };

  return (
    <motion.div 
      className="space-y-6 px-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      {/* AI Polish Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
            Identity
          </h3>
          <button 
            onClick={() => { triggerHaptic(); onPolish(); }}
            disabled={isPolishing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 via-purple-500 to-teal-400 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            {isPolishing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            AI Polish
          </button>
        </div>

        {/* Card-style Input Fields */}
        <div className="space-y-3">
          <InputCard
            label="School Branding"
            value={branding}
            onChange={(val) => setBranding(val.toUpperCase())}
            placeholder="CRUZI ACADEMY"
          />
          <InputCard
            label="Headline"
            value={headline}
            onChange={(val) => setHeadline(val.toUpperCase())}
            placeholder="MASTERY UNLOCKED"
          />
          <InputCard
            label="Status Line"
            value={statusLine}
            onChange={(val) => setStatusLine(val.toUpperCase())}
            placeholder="BEGINNER LEVEL"
          />
        </div>
      </section>

      {/* Student Selector */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
          Feature Student
        </h3>
        <div className="bg-background border border-border rounded-2xl overflow-hidden">
          <div className="relative">
            <select
              value={selectedStudent}
              onChange={(e) => { triggerHaptic(); setSelectedStudent(e.target.value); }}
              className="w-full px-4 py-4 bg-transparent text-base font-bold text-foreground appearance-none cursor-pointer focus:outline-none"
            >
              <option value="">Select a student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.full_name || s.email}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Theme Grid */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
          Neural Theme
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={selectedTheme === theme.id}
              onSelect={() => handleThemeSelect(theme.id)}
            />
          ))}
        </div>
      </section>
    </motion.div>
  );
};

interface InputCardProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const InputCard: React.FC<InputCardProps> = ({ label, value, onChange, placeholder }) => (
  <div className="bg-background border border-border rounded-2xl overflow-hidden">
    <div className="px-4 pt-3 pb-1">
      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
        {label}
      </label>
    </div>
    <div className="flex items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 pb-3 bg-transparent text-sm font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 mr-4" />
    </div>
  </div>
);

interface ThemeCardProps {
  theme: ThemeConfig;
  isSelected: boolean;
  onSelect: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isSelected, onSelect }) => (
  <motion.button
    onClick={onSelect}
    className={`relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${theme.gradient} shadow-lg active:scale-95 transition-all ${
      isSelected ? 'ring-4 ring-primary ring-offset-2 ring-offset-background scale-105' : ''
    }`}
    whileTap={{ scale: 0.95 }}
  >
    <div className="absolute inset-0 flex items-end p-2">
      <span className={`text-[8px] font-bold uppercase tracking-widest ${
        theme.textColor === 'white' ? 'text-white/80' : 'text-slate-800/80'
      }`}>
        {theme.name}
      </span>
    </div>
    {isSelected && (
      <motion.div 
        className="absolute inset-0 border-2 border-white/50 rounded-2xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      />
    )}
  </motion.button>
);

export default StudioTab;
