import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Bell, MessageSquare, Clock, Check, Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface NotificationSetting {
  notification_type: string;
  enabled: boolean;
  timing_hours: number | null;
  custom_message: string;
}

const NOTIFICATION_TYPES = [
  {
    type: 'lesson_reminder',
    label: 'Lesson Reminder',
    description: 'Auto-send before a lesson',
    hasTiming: true,
    defaultTiming: 24,
    defaultMessage: 'Please check in and read the app notes, and be ready for your lesson.',
    prefix: 'The message will always start: "You have a driving lesson on [Day] at [Time]."',
  },
  {
    type: 'payment_reminder',
    label: 'Pay Reminder',
    description: 'Payment reminder before lessons',
    hasTiming: true,
    defaultTiming: 48,
    defaultMessage: 'This is a payment reminder — please ensure payment is made before your lesson.',
    prefix: 'The message will always start: "You have a driving lesson on [Day] at [Time]."',
  },
  {
    type: 'lesson_changes',
    label: 'Lesson Changes',
    description: 'Notify when date/time changes',
    hasTiming: false,
    defaultTiming: null,
    defaultMessage: 'Your lesson time has been updated. Please check the app for the new details.',
  },
  {
    type: 'progress_update',
    label: 'Progress',
    description: 'When progress is updated',
    hasTiming: false,
    defaultTiming: null,
    defaultMessage: 'Your progress has been updated! Check the app to see how you\'re doing.',
  },
  {
    type: 'on_way',
    label: 'On Way',
    description: 'Manual quick send',
    hasTiming: false,
    defaultTiming: null,
    defaultMessage: 'I am on my way.',
  },
  {
    type: 'arrived',
    label: 'Arrived',
    description: 'Manual quick send',
    hasTiming: false,
    defaultTiming: null,
    defaultMessage: 'I have arrived.',
  },
  {
    type: 'passed_test',
    label: 'Passed Test',
    description: 'Congratulations message',
    hasTiming: false,
    defaultTiming: null,
    defaultMessage: 'Congratulations on passing your driving test! 🎉',
  },
  {
    type: 'passed_theory',
    label: 'Passed Theory',
    description: 'Theory pass message',
    hasTiming: false,
    defaultTiming: null,
    defaultMessage: 'Well done on passing your theory test! 🎉',
  },
  {
    type: 'birthday',
    label: 'Birthday',
    description: 'Auto birthday greeting',
    hasTiming: false,
    defaultTiming: null,
    defaultMessage: 'Wishing you a very happy birthday! 🎂',
  },
];

const TIMING_OPTIONS = [
  { value: 12, label: '12 hours before' },
  { value: 24, label: '24 hours before' },
  { value: 48, label: '48 hours before' },
  { value: 72, label: '72 hours before' },
];

interface NotificationSettingsProps {
  onBack: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Record<string, NotificationSetting>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    loadSettings();
  }, [user?.id]);

  const loadSettings = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('instructor_id', user.id);

    const loaded: Record<string, NotificationSetting> = {};

    // Initialize all types with defaults
    for (const nt of NOTIFICATION_TYPES) {
      const existing = data?.find((d: any) => d.notification_type === nt.type);
      loaded[nt.type] = {
        notification_type: nt.type,
        enabled: existing?.enabled ?? false,
        timing_hours: existing?.timing_hours ?? nt.defaultTiming,
        custom_message: existing?.custom_message ?? nt.defaultMessage,
      };
    }

    setSettings(loaded);
    setIsLoading(false);
  };

  const updateSetting = (type: string, field: keyof NotificationSetting, value: any) => {
    setSettings(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);

    try {
      for (const [type, setting] of Object.entries(settings)) {
        const { error } = await supabase
          .from('notification_settings')
          .upsert({
            instructor_id: user.id,
            notification_type: type,
            enabled: setting.enabled,
            timing_hours: setting.timing_hours,
            custom_message: setting.custom_message,
          }, { onConflict: 'instructor_id,notification_type' });

        if (error) throw error;
      }

      toast({ title: 'Saved', description: 'Notification settings updated.' });
      setHasChanges(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const messageCharLimit = 160;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="flex-1 overflow-y-auto overscroll-contain -webkit-overflow-scrolling-touch">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-bold">Back</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
              hasChanges
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-black text-foreground tracking-tight">SMS Notifications</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure automated SMS messages sent to your students. Each SMS uses 1 credit.
          </p>
        </div>

        <div className="space-y-3">
          {NOTIFICATION_TYPES.map((nt, i) => {
            const setting = settings[nt.type];
            if (!setting) return null;

            return (
              <motion.div
                key={nt.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-card border rounded-2xl overflow-hidden transition-colors ${
                  setting.enabled ? 'border-primary/30' : 'border-border'
                }`}
              >
                {/* Toggle row */}
                <button
                  onClick={() => updateSetting(nt.type, 'enabled', !setting.enabled)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      setting.enabled ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <MessageSquare className={`h-4 w-4 ${setting.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-foreground">{nt.label}</p>
                      <p className="text-[10px] text-muted-foreground">{nt.description}</p>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                    setting.enabled ? 'bg-primary' : 'bg-muted'
                  }`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      setting.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                </button>

                {/* Expanded settings when enabled */}
                {setting.enabled && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border/50">
                    {/* Timing selector for reminder types */}
                    {nt.hasTiming && (
                      <div className="pt-3">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2">
                          <Clock className="h-3 w-3" />
                          Send timing
                        </label>
                        <select
                          value={setting.timing_hours || nt.defaultTiming || 24}
                          onChange={(e) => updateSetting(nt.type, 'timing_hours', parseInt(e.target.value))}
                          className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm font-medium text-foreground"
                        >
                          {TIMING_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Prefix info */}
                    {nt.prefix && (
                      <p className="text-[10px] text-muted-foreground italic pt-2">
                        {nt.prefix}
                      </p>
                    )}

                    {/* Custom message */}
                    <div className={nt.prefix ? '' : 'pt-3'}>
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2 block">
                        Message
                      </label>
                      <textarea
                        value={setting.custom_message}
                        onChange={(e) => {
                          if (e.target.value.length <= messageCharLimit) {
                            updateSetting(nt.type, 'custom_message', e.target.value);
                          }
                        }}
                        rows={2}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground resize-none"
                        placeholder={nt.defaultMessage}
                      />
                      <p className="text-[10px] text-muted-foreground text-right mt-1">
                        {messageCharLimit - (setting.custom_message?.length || 0)} characters remaining
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
