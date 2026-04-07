import React, { useState } from 'react';
import { DVSA_CATEGORIES } from '@/constants';
import { StudentProfile } from '@/hooks/useInstructorData';
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronDown,
  CloudUpload,
  RotateCcw,
  ClipboardCheck,
  Check,
  AlertTriangle,
  X,
} from 'lucide-react';

type AssessmentResult = 'pass' | 'needs_work' | 'not_attempted';

interface AssessmentModeProps {
  students: StudentProfile[];
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  onSave: (data: {
    student_id: string;
    topic: string;
    result: AssessmentResult;
    notes: string;
  }) => void;
}

const triggerHaptic = () => {
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(10);
  }
};

const TOPIC_GROUPS: Record<string, string[]> = {
  'Vehicle Control': [
    'Precautions',
    'Controls (Clutch, Gears, etc)',
    'Move Off (Safety & Control)',
    'Ancillary Controls',
  ],
  'Road Awareness': [
    'Mirrors (Signalling & Change Direction)',
    'Signals (Necessary & Correctly)',
    'Response to Signs/Signals',
    'Use of Speed',
    'Following Distance',
    'Progress (Appropriate Speed)',
    'Awareness & Planning',
  ],
  'Junctions & Positioning': [
    'Junctions (Approach & Observation)',
    'Judgement (Overtaking & Meeting)',
    'Positioning (Normal & Lane Discipline)',
    'Pedestrian Crossings',
  ],
  'Manoeuvres': [
    'Parallel Park (Road)',
    'Parallel Park (Bay)',
    'Bay Park (Forward)',
    'Bay Park (Reverse)',
    'Pull Up on Right',
    'Emergency Stop',
    'Turn in the Road',
  ],
};

const RESULT_OPTIONS: { value: AssessmentResult; label: string; icon: React.ReactNode; activeClass: string }[] = [
  { value: 'pass', label: 'Pass', icon: <Check className="h-5 w-5" />, activeClass: 'bg-green-500 text-white shadow-green-500/20' },
  { value: 'needs_work', label: 'Needs Work', icon: <AlertTriangle className="h-5 w-5" />, activeClass: 'bg-amber-500 text-white shadow-amber-500/20' },
  { value: 'not_attempted', label: 'Not Attempted', icon: <X className="h-5 w-5" />, activeClass: 'bg-muted-foreground text-white shadow-muted-foreground/20' },
];

const AssessmentMode: React.FC<AssessmentModeProps> = ({
  students,
  selectedStudentId,
  setSelectedStudentId,
  onSave,
}) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [result, setResult] = useState<AssessmentResult | ''>('');
  const [notes, setNotes] = useState('');

  const selectedStudent = students.find(p => p.user_id === selectedStudentId) || students[0];

  const handleSave = () => {
    if (!selectedTopic || !result || !selectedStudentId) return;
    triggerHaptic();
    onSave({
      student_id: selectedStudentId,
      topic: selectedTopic,
      result: result as AssessmentResult,
      notes,
    });
    // Reset
    setSelectedTopic('');
    setResult('');
    setNotes('');
  };

  const handleReset = () => {
    triggerHaptic();
    setSelectedTopic('');
    setResult('');
    setNotes('');
  };

  const canSave = selectedTopic && result && selectedStudentId;

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Student Selector */}
      <div className="bg-card rounded-[2rem] p-5 shadow-xl border border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-background bg-gradient-to-br from-[hsl(var(--neural-violet))] to-[hsl(var(--neural-purple))]">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedStudent?.full_name || 'Student'}`}
              className="w-full h-full object-cover"
              alt="Avatar"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  triggerHaptic();
                  setSelectedStudentId(e.target.value);
                }}
                className="text-lg font-black text-foreground bg-transparent border-none p-0 focus:ring-0 cursor-pointer appearance-none"
              >
                {students.map(p => (
                  <option key={p.user_id} value={p.user_id}>
                    {p.full_name || 'Student'}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-[9px] font-black text-primary uppercase tracking-widest">
              {selectedStudent?.level?.replace('_', ' ') || 'Beginner'}
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="h-12 w-12 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center active:rotate-180 transition-all duration-500"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Topic Picker */}
      <div className="bg-card rounded-[2rem] p-6 shadow-xl border border-border">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-black text-foreground tracking-tight">Select Topic</h3>
        </div>
        <div className="space-y-4">
          {Object.entries(TOPIC_GROUPS).map(([group, topics]) => (
            <div key={group}>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">
                {group}
              </p>
              <div className="flex flex-wrap gap-2">
                {topics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => {
                      triggerHaptic();
                      setSelectedTopic(topic);
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                      selectedTopic === topic
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Result Selector */}
      {selectedTopic && (
        <div className="bg-card rounded-[2rem] p-6 shadow-xl border border-border">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
            Result for: {selectedTopic}
          </p>
          <div className="flex gap-3">
            {RESULT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  triggerHaptic();
                  setResult(opt.value);
                }}
                className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border-2 ${
                  result === opt.value
                    ? `${opt.activeClass} border-transparent shadow-lg`
                    : 'bg-card border-border text-muted-foreground'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {selectedTopic && result && (
        <div className="bg-card rounded-[2rem] p-6 shadow-xl border border-border">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">
            Notes (optional)
          </p>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this assessment..."
            className="bg-muted border-none rounded-2xl resize-none"
            rows={3}
          />
        </div>
      )}

      {/* Save Button */}
      {canSave && (
        <button
          onClick={handleSave}
          className="w-full py-5 bg-foreground text-background rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] transition-all"
        >
          <CloudUpload className="h-5 w-5" />
          Save Assessment
        </button>
      )}
    </div>
  );
};

export default AssessmentMode;
