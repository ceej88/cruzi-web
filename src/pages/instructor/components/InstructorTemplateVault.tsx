import React, { useState, useMemo } from 'react';
import { useInstructorData, TeachingTemplate } from '@/hooks/useInstructorData';
import { useAuth } from '@/contexts/AuthContext';
import { CORE_SKILLS_GROUPS } from '@/constants';
import { GlassCard } from '@/components/ui/GlassCard';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  Send,
  Camera,
  Sparkles,
  X,
  Loader2,
  CheckCircle,
  Shield,
  StickyNote,
  ChevronDown,
  ChevronUp,
  Save,
} from 'lucide-react';

interface InstructorTemplateVaultProps {
  onNavigate?: (tab: string) => void;
}

const InstructorTemplateVault: React.FC<InstructorTemplateVaultProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { templates, students, createTemplate, updateTemplate, deleteTemplate, sendMessage, isLoading } = useInstructorData();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sharingTemplate, setSharingTemplate] = useState<TeachingTemplate | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    category: '',
    content: '',
    ai_summary: '',
  });

  const categories = useMemo(() => ['All', ...CORE_SKILLS_GROUPS.map(g => g.category)], []);

  const showFeedback = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleCreateTemplate = () => {
    if (!user?.id || !newTemplate.title || !newTemplate.content) return;
    
    createTemplate.mutate({
      instructor_id: user.id,
      title: newTemplate.title,
      category: newTemplate.category,
      content: newTemplate.content,
      ai_summary: newTemplate.ai_summary || `A guide to ${newTemplate.title}`,
      last_used: null,
    });
    
    setNewTemplate({ title: '', category: '', content: '', ai_summary: '' });
    setIsModalOpen(false);
    showFeedback('Template created!');
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this methodology?")) return;
    deleteTemplate.mutate(id);
  };

  const handleShareToStudent = (studentId: string) => {
    if (!sharingTemplate) return;
    const student = students.find(p => p.user_id === studentId);
    const shareText = `📚 KNOWLEDGE DROP: ${sharingTemplate.title}\n\n${sharingTemplate.ai_summary || ''}\n\nKey Concept:\n${sharingTemplate.content}`;
    
    sendMessage.mutate({ receiverId: studentId, content: shareText });
    showFeedback(`Shared with ${student?.full_name?.split(' ')[0]}!`);
    setSharingTemplate(null);
  };

  const handleToggleNotes = (templateId: string, currentNotes?: string | null) => {
    if (expandedNotes === templateId) {
      setExpandedNotes(null);
    } else {
      setExpandedNotes(templateId);
      if (!(templateId in editingNotes)) {
        setEditingNotes(prev => ({ ...prev, [templateId]: currentNotes || '' }));
      }
    }
  };

  const handleSaveNotes = async (templateId: string) => {
    setSavingNotes(templateId);
    try {
      await updateTemplate.mutateAsync({
        id: templateId,
        instructor_notes: editingNotes[templateId] || null,
      } as any);
      showFeedback('Notes saved!');
    } finally {
      setSavingNotes(null);
    }
  };

  const isSystemTemplate = (template: TeachingTemplate) => {
    return (template as any).template_type === 'system';
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          (t.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Teaching Vault</h1>
          <p className="text-muted-foreground font-medium text-lg mt-2">Your unique teaching blueprints and expert methodologies.</p>
        </div>
        <div className="flex items-center gap-4">
          {successMsg && (
            <div className="bg-green-500 text-white px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
              <CheckCircle className="h-3 w-3" />
              {successMsg}
            </div>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="h-4 w-4" /> New Template
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                activeCategory === cat 
                ? 'bg-foreground text-background border-foreground shadow-lg' 
                : 'bg-card text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search your methodology..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-6 py-5 bg-card border border-border rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map(template => {
            const isSystem = isSystemTemplate(template);
            const instructorNotes = (template as any).instructor_notes;
            const isExpanded = expandedNotes === template.id;

            return (
              <GlassCard 
                key={template.id} 
                className="p-8 hover:shadow-xl transition-all group flex flex-col h-full relative"
              >
                <div className="mb-6 flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest ${
                      template.category === 'Manoeuvres' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-primary/10 text-primary'
                    }`}>
                      {template.category || 'Uncategorized'}
                    </div>
                    {isSystem && (
                      <div className="px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1">
                        <Shield className="h-2.5 w-2.5" />
                        DVSA Standard
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onNavigate?.('growth-lab')}
                      className="w-8 h-8 rounded-lg bg-foreground text-background hover:bg-primary flex items-center justify-center transition-colors"
                      title="Marketing Assets"
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => setSharingTemplate(template)}
                      className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                      title="Send to Student"
                    >
                      <Send className="h-3 w-3" />
                    </button>
                    {!isSystem && (
                      <button
                        onClick={(e) => handleDeleteTemplate(template.id, e)}
                        className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors"
                        title="Delete"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                
                <h3 className="text-xl font-extrabold text-foreground tracking-tight mb-3">
                  {template.title}
                </h3>
                
                <p className="text-sm text-muted-foreground line-clamp-3 mb-6 font-medium leading-relaxed">
                  {template.content}
                </p>

                {/* Instructor Notes Section */}
                <div className="mb-4">
                  <button
                    onClick={() => handleToggleNotes(template.id, instructorNotes)}
                    className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors w-full"
                  >
                    <StickyNote className="h-3 w-3" />
                    My Notes {instructorNotes ? '•' : ''}
                    {isExpanded ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <Textarea
                        value={editingNotes[template.id] || ''}
                        onChange={(e) => setEditingNotes(prev => ({ ...prev, [template.id]: e.target.value }))}
                        placeholder="Add your personal teaching tips here... e.g. 'I teach the 2-1-2 method for parallel park'"
                        className="min-h-[80px] bg-muted/50 border-muted resize-none text-xs"
                      />
                      <button
                        onClick={() => handleSaveNotes(template.id)}
                        disabled={savingNotes === template.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-all"
                      >
                        {savingNotes === template.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Save className="h-3 w-3" />
                        )}
                        Save Notes
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-auto pt-6 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-primary" /> AI Brief
                  </p>
                  <p className="text-xs text-foreground/80 italic leading-relaxed">
                    "{template.ai_summary}"
                  </p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Share Modal */}
      {sharingTemplate && (
        <div className="fixed inset-0 z-[200] bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 border-b border-border bg-primary/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-extrabold text-foreground tracking-tight">Quick Share</h3>
                <button onClick={() => setSharingTemplate(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Methodology</p>
              <p className="text-sm font-bold text-primary truncate">{sharingTemplate.title}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar max-h-96">
              {students.map(p => (
                <button 
                  key={p.user_id}
                  onClick={() => handleShareToStudent(p.user_id)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:bg-muted transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-border shadow-sm shrink-0">
                    <img src={`https://picsum.photos/100/100?random=${p.id}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">{p.full_name || 'Student'}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{p.level?.replace('_', ' ') || 'Beginner'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 border-b border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-extrabold text-foreground tracking-tight">New Template</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Title</label>
                <input 
                  type="text" 
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  className="w-full bg-muted border border-border rounded-2xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Parallel Parking Foundation"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Category</label>
                <select 
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  className="w-full bg-muted border border-border rounded-2xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Category</option>
                  {CORE_SKILLS_GROUPS.map(g => (
                    <option key={g.category} value={g.category}>{g.category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Content</label>
                <textarea 
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  className="w-full bg-muted border border-border rounded-2xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none"
                  placeholder="Step-by-step methodology..."
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">AI Summary</label>
                <input 
                  type="text" 
                  value={newTemplate.ai_summary}
                  onChange={(e) => setNewTemplate({ ...newTemplate, ai_summary: e.target.value })}
                  className="w-full bg-muted border border-border rounded-2xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Brief summary for students..."
                />
              </div>
            </div>
            <div className="p-8 border-t border-border flex gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateTemplate}
                disabled={!newTemplate.title || !newTemplate.content}
                className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorTemplateVault;
