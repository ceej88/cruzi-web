import React, { useState } from 'react';
import { 
  User, 
  Car, 
  AlertTriangle, 
  FileCheck, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  Heart,
  GraduationCap,
  Clock,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StudentOnboardingWizardProps {
  instructorTerms: string;
  studentEmail: string;
  onComplete: (data: StudentOnboardingData) => Promise<void>;
  onCancel: () => void;
}

export interface StudentOnboardingData {
  full_name: string;
  phone: string;
  address: string;
  parent_email?: string;
  // License details
  has_provisional: boolean;
  provisional_no?: string;
  has_theory: boolean;
  theory_cert_no?: string;
  // Medical
  vision_required: boolean;
  medical_details?: string;
  // Experience
  previous_experience?: string;
  learning_style?: string;
  // Emergency
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  // Preferences
  pref_duration?: string;
  pref_days?: string[];
  pref_payment?: string;
  // Terms
  accepted_terms: boolean;
}

const STEPS = [
  { id: 'personal', title: 'Personal Info', icon: User },
  { id: 'license', title: 'License Details', icon: Car },
  { id: 'medical', title: 'Medical & Safety', icon: Heart },
  { id: 'preferences', title: 'Preferences', icon: Clock },
  { id: 'terms', title: 'Terms & Confirm', icon: FileCheck },
];

const StudentOnboardingWizard: React.FC<StudentOnboardingWizardProps> = ({
  instructorTerms,
  studentEmail,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<StudentOnboardingData>({
    full_name: '',
    phone: '',
    address: '',
    parent_email: '',
    has_provisional: false,
    provisional_no: '',
    has_theory: false,
    theory_cert_no: '',
    vision_required: false,
    medical_details: '',
    previous_experience: '',
    learning_style: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    pref_duration: '2',
    pref_days: [],
    pref_payment: 'card',
    accepted_terms: false,
  });

  const updateField = <K extends keyof StudentOnboardingData>(field: K, value: StudentOnboardingData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day: string) => {
    const currentDays = formData.pref_days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    updateField('pref_days', newDays);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Personal
        return formData.full_name.trim().length >= 2 && formData.phone.trim().length >= 10 && formData.address.trim().length >= 5;
      case 1: // License
        return true; // Optional
      case 2: // Medical
        return (formData.emergency_contact_name?.trim() || '').length >= 2 && 
               (formData.emergency_contact_phone?.trim() || '').length >= 10;
      case 3: // Preferences
        return true; // Optional
      case 4: // Terms
        return formData.accepted_terms;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setIsSubmitting(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepIcon = STEPS[currentStep].icon;

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-br from-background via-card to-background flex items-center justify-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-4 animate-in zoom-in-95 fade-in duration-500">
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black text-foreground tracking-tighter">Complete Your Profile</h1>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="flex gap-1">
            {STEPS.map((step, idx) => (
              <div
                key={step.id}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  idx <= currentStep ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
          {/* Step Header */}
          <div className="bg-foreground text-background p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <StepIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black">{STEPS[currentStep].title}</h2>
              <p className="text-xs text-muted-foreground">
                {currentStep === 0 && 'Tell us about yourself'}
                {currentStep === 1 && 'Your driving license status'}
                {currentStep === 2 && 'Health and emergency information'}
                {currentStep === 3 && 'Your learning preferences'}
                {currentStep === 4 && 'Review and accept terms'}
              </p>
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
            {/* Step 0: Personal Info */}
            {currentStep === 0 && (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <User className="h-3 w-3" /> Full Name *
                  </Label>
                  <Input
                    value={formData.full_name}
                    onChange={e => updateField('full_name', e.target.value)}
                    placeholder="Enter your full name"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <Phone className="h-3 w-3" /> Phone Number *
                  </Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    placeholder="07XXX XXX XXX"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Pick Up Address *
                  </Label>
                  <Textarea
                    value={formData.address}
                    onChange={e => updateField('address', e.target.value)}
                    placeholder="Enter your full pick up address including:&#10;House number and street&#10;Town/City&#10;Postcode"
                    className="min-h-[100px] resize-none"
                  />
                  <p className="text-[10px] text-foreground/70 ml-1">This is where your instructor will collect you for lessons</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <Mail className="h-3 w-3" /> Parent/Guardian Email (for updates)
                  </Label>
                  <Input
                    type="email"
                    value={formData.parent_email}
                    onChange={e => updateField('parent_email', e.target.value)}
                    placeholder="parent@email.com"
                    className="h-12"
                  />
                  <p className="text-[10px] text-foreground/70 ml-1">We'll send lesson progress updates to this email</p>
                </div>
              </div>
            )}

            {/* Step 1: License Details */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-xl border border-border">
                  <Checkbox
                    id="has_provisional"
                    checked={formData.has_provisional}
                    onCheckedChange={checked => updateField('has_provisional', !!checked)}
                  />
                  <Label htmlFor="has_provisional" className="flex-1 cursor-pointer">
                    <p className="font-bold text-foreground">I have a provisional driving license</p>
                    <p className="text-xs text-foreground/70">Required before your first lesson</p>
                  </Label>
                </div>
                {formData.has_provisional && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
                      Provisional License Number
                    </Label>
                    <Input
                      value={formData.provisional_no}
                      onChange={e => updateField('provisional_no', e.target.value)}
                      placeholder="MORGA753116SM9IJ"
                      className="h-12 font-mono"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 p-4 bg-muted rounded-xl border border-border">
                  <Checkbox
                    id="has_theory"
                    checked={formData.has_theory}
                    onCheckedChange={checked => updateField('has_theory', !!checked)}
                  />
                  <Label htmlFor="has_theory" className="flex-1 cursor-pointer">
                    <p className="font-bold text-foreground">I have passed my theory test</p>
                    <p className="text-xs text-foreground/70">Required before booking your practical test</p>
                  </Label>
                </div>
                {formData.has_theory && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
                      Theory Certificate Number
                    </Label>
                    <Input
                      value={formData.theory_cert_no}
                      onChange={e => updateField('theory_cert_no', e.target.value)}
                      placeholder="Certificate number"
                      className="h-12"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Medical & Safety */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-xl border border-border">
                  <Checkbox
                    id="vision_required"
                    checked={formData.vision_required}
                    onCheckedChange={checked => updateField('vision_required', !!checked)}
                  />
                  <Label htmlFor="vision_required" className="flex-1 cursor-pointer">
                    <p className="font-bold text-foreground flex items-center gap-2">
                      <Eye className="h-4 w-4" /> I require glasses/contacts for driving
                    </p>
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <Heart className="h-3 w-3" /> Medical Conditions (if any)
                  </Label>
                  <Textarea
                    value={formData.medical_details}
                    onChange={e => updateField('medical_details', e.target.value)}
                    placeholder="Any conditions your instructor should be aware of..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Emergency Contact *
                  </h4>
                  <p className="text-[10px] text-foreground/70 mb-3">Required for your safety during lessons</p>
                  <div className="grid gap-3">
                    <Input
                      value={formData.emergency_contact_name}
                      onChange={e => updateField('emergency_contact_name', e.target.value)}
                      placeholder="Contact name"
                      className="h-10"
                    />
                    <Input
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={e => updateField('emergency_contact_phone', e.target.value)}
                      placeholder="Contact phone"
                      className="h-10"
                    />
                    <Input
                      value={formData.emergency_contact_relation}
                      onChange={e => updateField('emergency_contact_relation', e.target.value)}
                      placeholder="Relationship (e.g., Parent, Partner)"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <GraduationCap className="h-3 w-3" /> Previous Driving Experience
                  </Label>
                  <Select value={formData.previous_experience} onValueChange={v => updateField('previous_experience', v)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Complete beginner</SelectItem>
                      <SelectItem value="few_lessons">A few lessons before</SelectItem>
                      <SelectItem value="some_experience">Some private practice</SelectItem>
                      <SelectItem value="significant">Significant experience</SelectItem>
                      <SelectItem value="foreign_license">Hold a foreign license</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" /> Preferred Lesson Duration
                  </Label>
                  <Select value={formData.pref_duration} onValueChange={v => updateField('pref_duration', v)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="1.5">1.5 hours</SelectItem>
                      <SelectItem value="2">2 hours (recommended)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> Preferred Days
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                          formData.pref_days?.includes(day)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <CreditCard className="h-3 w-3" /> Preferred Payment Method
                  </Label>
                  <Select value={formData.pref_payment} onValueChange={v => updateField('pref_payment', v)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Card Payment</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 4: Terms & Confirm */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-muted border border-border rounded-xl p-4 max-h-48 overflow-y-auto custom-scrollbar">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">
                    Instructor Terms of Business
                  </h4>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {instructorTerms || 'Standard driving school terms apply. Your instructor will share specific terms during your first lesson.'}
                  </p>
                </div>

                <div className="flex items-start gap-4 p-4 bg-primary/10 border border-primary/30 rounded-xl">
                  <Checkbox
                    id="accepted_terms"
                    checked={formData.accepted_terms}
                    onCheckedChange={checked => updateField('accepted_terms', !!checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="accepted_terms" className="flex-1 cursor-pointer">
                    <p className="font-bold text-foreground">I accept the terms and conditions</p>
                    <p className="text-xs text-foreground/70 mt-1">
                      By checking this box, I confirm I have read and agree to the instructor's terms of business and understand the cancellation policy.
                    </p>
                  </Label>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2 flex items-center gap-2">
                    <Check className="h-4 w-4" /> Ready to Start
                  </h4>
                  <p className="text-sm text-foreground">
                    Once you complete onboarding, your instructor will be notified and you'll have full access to the student portal.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="p-6 border-t border-border bg-muted/50 flex justify-between gap-4">
            {currentStep === 0 ? (
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            ) : (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Complete Onboarding
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOnboardingWizard;
