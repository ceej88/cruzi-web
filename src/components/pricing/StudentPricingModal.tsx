// Cruzi AI - Student Pricing Modal
// Allows instructors to set custom rates per student

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useStudentPricingForInstructor,
  useUpsertStudentPricing,
  useAddGiftedHours,
  useDeleteStudentPricing,
  useInstructorPricingSettings,
} from '@/hooks/useStudentPricing';
import {
  Percent,
  PoundSterling,
  Gift,
  Tag,
  Loader2,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface StudentPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    user_id: string;
    full_name: string | null;
    email: string;
  } | null;
}

const StudentPricingModal: React.FC<StudentPricingModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { data: existingPricing, isLoading: pricingLoading } = useStudentPricingForInstructor(student?.user_id || null);
  const { data: instructorSettings } = useInstructorPricingSettings();
  const upsertPricing = useUpsertStudentPricing();
  const addGiftedHours = useAddGiftedHours();
  const deletePricing = useDeleteStudentPricing();

  const [pricingType, setPricingType] = useState<'PERCENTAGE' | 'FIXED_RATE'>('PERCENTAGE');
  const [discountPercent, setDiscountPercent] = useState<string>('');
  const [customRate, setCustomRate] = useState<string>('');
  const [appliesTo, setAppliesTo] = useState<'ALL' | 'SINGLE_ONLY' | 'BLOCKS_ONLY'>('ALL');
  const [label, setLabel] = useState<string>('');
  const [giftHours, setGiftHours] = useState<string>('');

  const hourlyRate = instructorSettings?.hourly_rate || 45;

  // Initialize form when pricing loads
  useEffect(() => {
    if (existingPricing) {
      setPricingType(existingPricing.pricing_type as 'PERCENTAGE' | 'FIXED_RATE');
      setDiscountPercent(existingPricing.discount_percent?.toString() || '');
      setCustomRate(existingPricing.custom_hourly_rate?.toString() || '');
      setAppliesTo(existingPricing.applies_to as 'ALL' | 'SINGLE_ONLY' | 'BLOCKS_ONLY');
      setLabel(existingPricing.label || '');
    } else {
      // Reset form for new student
      setPricingType('PERCENTAGE');
      setDiscountPercent('');
      setCustomRate('');
      setAppliesTo('ALL');
      setLabel('');
    }
    setGiftHours('');
  }, [existingPricing, student?.user_id]);

  const handleSave = async () => {
    if (!student) return;

    await upsertPricing.mutateAsync({
      student_id: student.user_id,
      pricing_type: pricingType,
      discount_percent: pricingType === 'PERCENTAGE' ? parseFloat(discountPercent) || 0 : 0,
      custom_hourly_rate: pricingType === 'FIXED_RATE' ? parseFloat(customRate) || null : null,
      applies_to: appliesTo,
      label: label || null,
    });

    onClose();
  };

  const handleGift = async () => {
    if (!student || !giftHours) return;
    await addGiftedHours.mutateAsync({
      studentId: student.user_id,
      hours: parseFloat(giftHours),
    });
    setGiftHours('');
  };

  const handleReset = async () => {
    if (!student) return;
    await deletePricing.mutateAsync(student.user_id);
    onClose();
  };

  // Calculate preview
  const getPreviewRate = () => {
    if (pricingType === 'FIXED_RATE' && customRate) {
      return parseFloat(customRate);
    }
    if (pricingType === 'PERCENTAGE' && discountPercent) {
      const discount = hourlyRate * (parseFloat(discountPercent) / 100);
      return hourlyRate - discount;
    }
    return hourlyRate;
  };

  const previewRate = getPreviewRate();
  const savings = hourlyRate - previewRate;

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-0">
        {/* Header */}
        <div className="bg-foreground p-6 text-background">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">
              Custom Pricing
            </DialogTitle>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">
              {student.full_name || student.email}
            </p>
          </DialogHeader>
        </div>

        {pricingLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Pricing Type Tabs */}
            <Tabs value={pricingType} onValueChange={(v) => setPricingType(v as 'PERCENTAGE' | 'FIXED_RATE')}>
              <TabsList className="w-full grid grid-cols-2 h-12">
                <TabsTrigger value="PERCENTAGE" className="gap-2 text-xs font-bold">
                  <Percent className="h-4 w-4" />
                  Percentage Off
                </TabsTrigger>
                <TabsTrigger value="FIXED_RATE" className="gap-2 text-xs font-bold">
                  <PoundSterling className="h-4 w-4" />
                  Fixed Rate
                </TabsTrigger>
              </TabsList>

              <TabsContent value="PERCENTAGE" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="discount" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Discount Percentage
                  </Label>
                  <div className="relative">
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      placeholder="e.g., 10"
                      className="pr-10"
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="FIXED_RATE" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rate" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Custom Hourly Rate
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">£</span>
                    <Input
                      id="rate"
                      type="number"
                      min="1"
                      value={customRate}
                      onChange={(e) => setCustomRate(e.target.value)}
                      placeholder={hourlyRate.toString()}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Your default rate: £{hourlyRate}/hr
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Preview Card */}
            {(discountPercent || customRate) && (
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Effective Rate</p>
                  <p className="text-2xl font-black text-foreground">£{previewRate.toFixed(0)}/hr</p>
                </div>
                {savings > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Saves</p>
                    <p className="text-lg font-black text-green-600">£{savings.toFixed(0)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Applies To */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Apply Discount To
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'ALL', label: 'Everything' },
                  { value: 'SINGLE_ONLY', label: 'Singles' },
                  { value: 'BLOCKS_ONLY', label: 'Blocks' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAppliesTo(opt.value as typeof appliesTo)}
                    className={`p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                      appliesTo === opt.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="label" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Tag className="h-3 w-3" /> Label (optional)
              </Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Family, Friend, Staff"
              />
            </div>

            {/* Gift Hours Section */}
            <div className="border-t border-border pt-4 space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Gift className="h-3 w-3 text-pink-500" /> Gift Free Hours
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  value={giftHours}
                  onChange={(e) => setGiftHours(e.target.value)}
                  placeholder="Hours to gift"
                  className="flex-1"
                />
                <button
                  onClick={handleGift}
                  disabled={!giftHours || addGiftedHours.isPending}
                  className="px-4 py-2 bg-pink-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-pink-600 transition-all flex items-center gap-2"
                >
                  {addGiftedHours.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Gift
                </button>
              </div>
              {existingPricing?.gifted_hours ? (
                <p className="text-[10px] text-pink-600 font-bold">
                  {existingPricing.gifted_hours}h gifted (adds to credit balance)
                </p>
              ) : null}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {existingPricing && (
                <button
                  onClick={handleReset}
                  disabled={deletePricing.isPending}
                  className="px-4 py-3 border border-border rounded-xl font-bold text-xs text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-border rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={upsertPricing.isPending}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {upsertPricing.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentPricingModal;
