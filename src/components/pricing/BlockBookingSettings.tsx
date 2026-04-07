// Cruzi AI - Block Booking Settings
// Toggle and price configuration for instructor settings

import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  useInstructorPricingSettings,
  useUpdateInstructorPricing,
} from '@/hooks/useStudentPricing';
import { Clock, Save, Loader2, Package } from 'lucide-react';

const BlockBookingSettings: React.FC = () => {
  const { data: settings, isLoading } = useInstructorPricingSettings();
  const updatePricing = useUpdateInstructorPricing();

  const [blockEnabled, setBlockEnabled] = useState(true);
  const [block10, setBlock10] = useState('');
  const [block20, setBlock20] = useState('');
  const [block30, setBlock30] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const hourlyRate = settings?.hourly_rate || 45;

  // Default block prices with standard discounts
  const defaultBlock10 = Math.round(hourlyRate * 10 * 0.95);
  const defaultBlock20 = Math.round(hourlyRate * 20 * 0.90);
  const defaultBlock30 = Math.round(hourlyRate * 30 * 0.85);

  // Initialize form when settings load
  useEffect(() => {
    if (settings) {
      setBlockEnabled(settings.block_booking_enabled ?? true);
      setBlock10(settings.block_10_price?.toString() || '');
      setBlock20(settings.block_20_price?.toString() || '');
      setBlock30(settings.block_30_price?.toString() || '');
      setHasChanges(false);
    }
  }, [settings]);

  const handleToggle = (enabled: boolean) => {
    setBlockEnabled(enabled);
    setHasChanges(true);
  };

  const handlePriceChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updatePricing.mutateAsync({
      block_booking_enabled: blockEnabled,
      block_10_price: block10 ? parseFloat(block10) : null,
      block_20_price: block20 ? parseFloat(block20) : null,
      block_30_price: block30 ? parseFloat(block30) : null,
    });
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <GlassCard className="p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-10 bg-muted rounded mb-2" />
        <div className="h-10 bg-muted rounded" />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 space-y-6">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground">Block Booking</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Discounted hour packages for students
            </p>
          </div>
        </div>
        <Switch
          checked={blockEnabled}
          onCheckedChange={handleToggle}
        />
      </div>

      {/* Explainer */}
      <div className="bg-muted/50 p-4 rounded-xl border border-border">
        <p className="text-xs text-muted-foreground">
          {blockEnabled 
            ? 'Students will see block booking options in their top-up modal. Set custom prices below or leave blank for default discounts.'
            : 'Block booking is disabled. Students will only see single hour purchases.'}
        </p>
      </div>

      {/* Block Prices */}
      {blockEnabled && (
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
            <Clock className="h-3 w-3" /> Block Prices
          </h4>

          <div className="grid gap-4">
            {/* 10 Hours */}
            <div className="flex items-center gap-4">
              <div className="w-20 text-right">
                <span className="text-sm font-black text-foreground">10 Hours</span>
              </div>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">£</span>
                <Input
                  type="number"
                  value={block10}
                  onChange={(e) => handlePriceChange(setBlock10, e.target.value)}
                  placeholder={defaultBlock10.toString()}
                  className="pl-8"
                />
              </div>
              <span className="text-[10px] text-muted-foreground w-24">
                Default: £{defaultBlock10}
              </span>
            </div>

            {/* 20 Hours */}
            <div className="flex items-center gap-4">
              <div className="w-20 text-right">
                <span className="text-sm font-black text-foreground">20 Hours</span>
              </div>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">£</span>
                <Input
                  type="number"
                  value={block20}
                  onChange={(e) => handlePriceChange(setBlock20, e.target.value)}
                  placeholder={defaultBlock20.toString()}
                  className="pl-8"
                />
              </div>
              <span className="text-[10px] text-muted-foreground w-24">
                Default: £{defaultBlock20}
              </span>
            </div>

            {/* 30 Hours */}
            <div className="flex items-center gap-4">
              <div className="w-20 text-right">
                <span className="text-sm font-black text-foreground">30 Hours</span>
              </div>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">£</span>
                <Input
                  type="number"
                  value={block30}
                  onChange={(e) => handlePriceChange(setBlock30, e.target.value)}
                  placeholder={defaultBlock30.toString()}
                  className="pl-8"
                />
              </div>
              <span className="text-[10px] text-muted-foreground w-24">
                Default: £{defaultBlock30}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      {hasChanges && (
        <button
          onClick={handleSave}
          disabled={updatePricing.isPending}
          className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {updatePricing.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Block Settings
        </button>
      )}
    </GlassCard>
  );
};

export default BlockBookingSettings;
