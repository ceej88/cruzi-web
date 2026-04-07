import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, Loader2, Save, Check } from 'lucide-react';
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
    label: 'Next Lesson Reminder',
    hasTiming: true,
    defaultTiming: 24,
    defaultMessage: 'Please check in and read the app notes, and be ready for your lesson.',
    prefix: 'Message starts: "You have a driving lesson on [Day] at [Time]."',
  },
  {
    type: 'payment_reminder',
    label: 'Outstanding Payment Reminder',
    hasTiming: true,
    defaultTiming: 48,
    defaultMessage: 'This is a payment reminder — please ensure payment is made before your lesson.',
    prefix: 'Message starts: "You have a driving lesson on [Day] at [Time]."',
  },
  {
    type: 'lesson_changes',
    label: 'Lesson Changes',
    hasTiming: false,
    defaultTiming: null,
    defaultMessage: 'Your lesson time has been updated. Please check the app for the new details.',
  },
  {
    type: 'progress_update',
    label: 'Progress Update',
    hasTiming: false,
    defaultTiming: null,
    defaultMessage: 'Your progress has been updated! Check the app to see how you\'re doing.',
  },
  {
    type: 'on_way',
    label: 'On My Way',
    hasTiming: false,
    defaultTiming: null,
    defaultMessage: 'I am on my way.',
  },
  {
    type: 'arrived',
    label: 'Arrived',
    hasTiming: false,
    defaultTiming: null,
    defaultMessage: 'I have arrived.',
  },
  {
    type: 'passed_test',
    label: 'Passed Test',
    hasTiming: false,
    defaultTiming: null,
    defaultMessage: 'Congratulations on passing your driving test! 🎉',
  },
  {
    type: 'birthday',
    label: 'Birthday',
    hasTiming: false,
    defaultTiming: null,
    defaultMessage: 'Wishing you a very happy birthday! 🎂',
  },
];

const TIMING_OPTIONS = [
  { value: 12, label: 'Send 12 hours before' },
  { value: 24, label: 'Send 24 hours before' },
  { value: 48, label: 'Send 48 hours before' },
  { value: 72, label: 'Send 72 hours before' },
];

const SmsRemindersTab: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Record<string, NotificationSetting>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingType, setSavingType] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) loadSettings();
  }, [user?.id]);

  const loadSettings = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    const { data } = await (supabase as any)
      .from('notification_settings')
      .select('*')
      .eq('instructor_id', user.id);

    const loaded: Record<string, NotificationSetting> = {};
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
  };

  const handleSave = async (type: string) => {
    if (!user?.id) return;
    const setting = settings[type];
    if (!setting) return;
    setSavingType(type);
    try {
      const { error } = await (supabase as any)
        .from('notification_settings')
        .upsert({
          instructor_id: user.id,
          notification_type: type,
          enabled: setting.enabled,
          timing_hours: setting.timing_hours,
          custom_message: setting.custom_message,
        }, { onConflict: 'instructor_id,notification_type' });
      if (error) throw error;
      toast({ title: 'Saved', description: `${NOTIFICATION_TYPES.find(n => n.type === type)?.label} settings updated.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
    } finally {
      setSavingType(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-[#6B7280]" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {NOTIFICATION_TYPES.map((nt) => {
        const setting = settings[nt.type];
        if (!setting) return null;

        return (
          <div
            key={nt.type}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
          >
            {/* Header with toggle */}
            <div className="px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1A1A2E]">{nt.label}</h3>
              <button
                onClick={() => {
                  updateSetting(nt.type, 'enabled', !setting.enabled);
                  // Auto-save toggle
                  setTimeout(() => handleSave(nt.type), 100);
                }}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  setting.enabled ? 'bg-[#34C759]' : 'bg-slate-300'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  setting.enabled ? 'left-[22px]' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* Expanded settings */}
            {setting.enabled && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                {/* Timing */}
                {nt.hasTiming && (
                  <div className="grid grid-cols-[80px_1fr] items-center gap-0 border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-3 py-2.5 text-xs font-semibold text-[#6B7280] border-r border-slate-200">
                      Frequency
                    </div>
                    <select
                      value={setting.timing_hours || nt.defaultTiming || 24}
                      onChange={(e) => updateSetting(nt.type, 'timing_hours', parseInt(e.target.value))}
                      className="px-3 py-2.5 text-sm text-[#1A1A2E] bg-white border-0 outline-none"
                    >
                      {TIMING_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Prefix */}
                {nt.prefix && (
                  <p className="text-[10px] text-[#6B7280] italic">{nt.prefix}</p>
                )}

                {/* Message */}
                <div className="grid grid-cols-[80px_1fr] items-start gap-0 border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-3 py-2.5 text-xs font-semibold text-[#6B7280] border-r border-slate-200">
                    Message
                  </div>
                  <textarea
                    value={setting.custom_message}
                    onChange={(e) => {
                      if (e.target.value.length <= 160) {
                        updateSetting(nt.type, 'custom_message', e.target.value);
                      }
                    }}
                    rows={2}
                    className="px-3 py-2 text-sm text-[#1A1A2E] bg-white border-0 outline-none resize-none"
                  />
                </div>
                <p className="text-[10px] text-[#6B7280]">
                  Remaining characters : {160 - (setting.custom_message?.length || 0)}
                </p>

                {/* Save button */}
                <button
                  onClick={() => handleSave(nt.type)}
                  disabled={savingType === nt.type}
                  className="px-5 py-2 bg-[#3B82F6] text-white rounded-lg text-xs font-bold active:scale-95 transition-all disabled:opacity-50"
                  style={{ touchAction: 'manipulation' }}
                >
                  {savingType === nt.type ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SmsRemindersTab;
