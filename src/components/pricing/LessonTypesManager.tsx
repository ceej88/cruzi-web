// Cruzi AI - Lesson Types Manager
// Instructor UI for creating and managing lesson pricing categories

import React, { useState } from 'react';
import { useInstructorLessonTypes, useCreateLessonType, useUpdateLessonType, useDeleteLessonType, LessonType } from '@/hooks/useLessonTypes';
import { Plus, Pencil, Trash2, Loader2, GripVertical, Clock, PoundSterling, X, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const DEFAULT_LESSON_TYPES = [
  { name: 'Standard Lesson', price: 40, duration_minutes: 60, description: 'Regular 1-hour driving lesson' },
  { name: 'First Lesson', price: 25, duration_minutes: 60, description: 'Discounted intro rate for new students' },
  { name: '5-Lesson Block', price: 185, duration_minutes: 300, description: '5 hours at a reduced rate' },
  { name: '10-Lesson Block', price: 350, duration_minutes: 600, description: '10 hours – most popular' },
  { name: 'Test Day', price: 60, duration_minutes: 180, description: 'Pick-up, warm-up drive & test waiting' },
  { name: 'Motorway Lesson', price: 50, duration_minutes: 90, description: '90-min motorway session' },
];

interface EditingState {
  id: string | 'new';
  name: string;
  price: string;
  duration_minutes: string;
  description: string;
}

const LessonTypesManager: React.FC = () => {
  const { data: lessonTypes = [], isLoading } = useInstructorLessonTypes();
  const createType = useCreateLessonType();
  const updateType = useUpdateLessonType();
  const deleteType = useDeleteLessonType();
  const [editing, setEditing] = useState<EditingState | null>(null);

  const handleSeedDefaults = async () => {
    for (let i = 0; i < DEFAULT_LESSON_TYPES.length; i++) {
      await createType.mutateAsync({
        ...DEFAULT_LESSON_TYPES[i],
        sort_order: i,
      });
    }
  };

  const handleStartEdit = (lt: LessonType) => {
    setEditing({
      id: lt.id,
      name: lt.name,
      price: lt.price.toString(),
      duration_minutes: lt.duration_minutes.toString(),
      description: lt.description || '',
    });
  };

  const handleStartNew = () => {
    setEditing({
      id: 'new',
      name: '',
      price: '',
      duration_minutes: '60',
      description: '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editing || !editing.name || !editing.price) return;

    if (editing.id === 'new') {
      await createType.mutateAsync({
        name: editing.name,
        price: parseFloat(editing.price),
        duration_minutes: parseInt(editing.duration_minutes) || 60,
        description: editing.description || undefined,
        sort_order: lessonTypes.length,
      });
    } else {
      await updateType.mutateAsync({
        id: editing.id,
        name: editing.name,
        price: parseFloat(editing.price),
        duration_minutes: parseInt(editing.duration_minutes) || 60,
        description: editing.description || null,
      });
    }
    setEditing(null);
  };

  const handleToggleActive = async (lt: LessonType) => {
    await updateType.mutateAsync({ id: lt.id, is_active: !lt.is_active });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state – offer to seed defaults
  if (lessonTypes.length === 0 && !editing) {
    return (
      <div className="space-y-6">
        <div className="p-8 bg-muted border border-border rounded-3xl text-center space-y-4">
          <PoundSterling className="h-10 w-10 text-primary mx-auto" />
          <h4 className="text-lg font-black text-foreground">No Lesson Types Yet</h4>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Create your lesson categories with prices that students will see when booking.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={handleSeedDefaults}
              disabled={createType.isPending}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createType.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Use Defaults
            </button>
            <button
              onClick={handleStartNew}
              className="px-6 py-3 border border-border rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-background transition-all"
            >
              Start From Scratch
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Lesson type cards */}
      {lessonTypes.map((lt) => (
        <div
          key={lt.id}
          className={`p-5 rounded-2xl border transition-all ${
            lt.is_active
              ? 'bg-background border-border shadow-sm'
              : 'bg-muted/50 border-border/50 opacity-60'
          }`}
        >
          {editing?.id === lt.id ? (
            // Inline edit form
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Lesson name"
                  className="bg-muted border border-border rounded-xl px-4 py-3 font-bold text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-black">£</span>
                  <input
                    type="number"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                    placeholder="Price"
                    className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 font-bold text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={editing.duration_minutes}
                    onChange={(e) => setEditing({ ...editing, duration_minutes: e.target.value })}
                    placeholder="Minutes"
                    className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 font-bold text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-[10px] text-muted-foreground font-bold">min</span>
                </div>
                <input
                  type="text"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Description (optional)"
                  className="bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditing(null)}
                  className="p-2 rounded-lg hover:bg-muted transition-all"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updateType.isPending || createType.isPending}
                  className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {(updateType.isPending || createType.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Display row
            <div className="flex items-center gap-4">
              <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h5 className="font-black text-foreground text-sm truncate">{lt.name}</h5>
                  {!lt.is_active && (
                    <span className="text-[9px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase tracking-widest">
                      Hidden
                    </span>
                  )}
                </div>
                {lt.description && (
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{lt.description}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-black text-foreground">£{lt.price}</p>
                <p className="text-[10px] text-muted-foreground font-bold">{lt.duration_minutes} min</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={lt.is_active}
                  onCheckedChange={() => handleToggleActive(lt)}
                  className="scale-75"
                />
                <button
                  onClick={() => handleStartEdit(lt)}
                  className="p-2 rounded-lg hover:bg-muted transition-all"
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="p-2 rounded-lg hover:bg-destructive/10 transition-all">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{lt.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This lesson type will be permanently removed. Students will no longer see it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteType.mutate(lt.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* New entry form */}
      {editing?.id === 'new' && (
        <div className="p-5 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Lesson name"
              autoFocus
              className="bg-background border border-border rounded-xl px-4 py-3 font-bold text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-black">£</span>
              <input
                type="number"
                value={editing.price}
                onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                placeholder="Price"
                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 font-bold text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                value={editing.duration_minutes}
                onChange={(e) => setEditing({ ...editing, duration_minutes: e.target.value })}
                placeholder="Minutes"
                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 font-bold text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-[10px] text-muted-foreground font-bold">min</span>
            </div>
            <input
              type="text"
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              placeholder="Description (optional)"
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(null)}
              className="p-2 rounded-lg hover:bg-muted transition-all"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={createType.isPending || !editing.name || !editing.price}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {createType.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Add button */}
      {editing?.id !== 'new' && (
        <button
          onClick={handleStartNew}
          className="w-full p-4 rounded-2xl border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          <span className="font-bold text-xs uppercase tracking-widest">Add Lesson Type</span>
        </button>
      )}
    </div>
  );
};

export default LessonTypesManager;
