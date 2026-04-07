// Cruzi AI - Create Template Modal
// Modal for creating/editing teaching methodology templates

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { generateSummaryForTemplate } from '@/services/instructorAIService';
import { CORE_SKILLS_GROUPS } from '@/constants';

interface TeachingTemplate {
  id: string;
  title: string;
  category?: string;
  content: string;
  ai_summary: string;
  last_used?: string;
}

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<TeachingTemplate, 'id' | 'last_used'> & { id?: string }) => void;
  initialData?: TeachingTemplate;
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('None');
  const [content, setContent] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category || 'None');
      setContent(initialData.content);
      setAiSummary(initialData.ai_summary);
    } else if (isOpen) {
      setTitle('');
      setCategory('None');
      setContent('');
      setAiSummary('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleGenerateSummary = async () => {
    if (!content.trim()) return;
    setIsGenerating(true);
    try {
      const summary = await generateSummaryForTemplate(content);
      setAiSummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!title || !content) {
      alert("Please fill in Title and Content");
      return;
    }
    onSave({
      id: initialData?.id,
      title,
      category: category === 'None' ? undefined : category,
      content,
      ai_summary: aiSummary || "Short summary of " + title,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-10 pt-10 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              {initialData ? 'Edit Methodology' : 'Create Template'}
            </h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Define your unique teaching style for the AI to replicate.
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-10 py-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[70vh]">
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Method Title</label>
            <input 
              type="text"
              placeholder="e.g., Parallel Parking Strategy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Syllabus Category</label>
            <div className="relative">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-5 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none appearance-none font-bold text-foreground pr-10"
              >
                <option value="None">None / General</option>
                {CORE_SKILLS_GROUPS.map(g => (
                  <option key={g.category} value={g.category}>{g.category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Teaching Content (AI Context)</label>
            <textarea 
              placeholder="Describe your step-by-step methodology..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-6 py-6 bg-muted border border-border rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all min-h-[200px] font-medium text-foreground leading-relaxed"
            />
          </div>

          <div className="space-y-3 bg-primary/5 p-6 rounded-[2rem] border border-primary/20">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Student-Facing Summary</label>
              <button 
                onClick={handleGenerateSummary}
                disabled={isGenerating || !content.trim()}
                className="flex items-center gap-2 px-3 py-1.5 bg-background border border-primary/20 rounded-xl text-[9px] font-black text-primary hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 shadow-sm"
              >
                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                AI Generate
              </button>
            </div>
            <textarea 
              placeholder="A concise, student-friendly version..."
              value={aiSummary}
              onChange={(e) => setAiSummary(e.target.value)}
              className="w-full px-5 py-4 bg-background/50 border border-background rounded-2xl focus:ring-2 focus:ring-primary outline-none min-h-[80px] text-sm font-bold text-foreground leading-relaxed placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 bg-muted border-t border-border flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-4 bg-background border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-4 bg-foreground text-background rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-primary transition-all active:scale-95"
          >
            {initialData ? 'Update methodology' : 'Add to Vault'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTemplateModal;
