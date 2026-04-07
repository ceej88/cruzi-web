import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfileUpdate, useAvatarUpload } from '@/hooks/useProfileUpdate';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, CreditCard, Bell, Shield, LogOut, Camera, Loader2, Save, Trash2 } from 'lucide-react';
import BlockBookingSettings from '@/components/pricing/BlockBookingSettings';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
// Hook for instructor's own profile
function useInstructorOwnProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['instructor-own-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

const InstructorSettings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useInstructorOwnProfile();
  const updateProfile = useProfileUpdate();
  const uploadAvatar = useAvatarUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAllLessons = async () => {
    if (!user?.id) return;
    setIsClearing(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('instructor_id', user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['instructor-lessons'] });
      toast({ title: 'All lessons cleared', description: 'Your calendar is now empty.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsClearing(false);
    }
  };

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    bio: '',
    adi_number: '',
    hourly_rate: '',
    terms_of_business: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        bio: profile.bio || '',
        adi_number: profile.adi_number || '',
        hourly_rate: profile.hourly_rate?.toString() || '',
        terms_of_business: (profile as any).terms_of_business || '',
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate({
      full_name: formData.full_name || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      bio: formData.bio || undefined,
      adi_number: formData.adi_number || undefined,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
      terms_of_business: formData.terms_of_business || undefined,
    } as any, {
      onSuccess: () => setIsEditing(false),
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar.mutate(file);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20 px-4 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-foreground tracking-tighter">Settings</h1>
        <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">Manage your account</p>
      </div>

      <GlassCard className="p-8">
        <div className="flex items-center gap-6 mb-8">
          <button 
            onClick={handleAvatarClick}
            className="relative w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-black shadow-lg overflow-hidden group"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.email?.slice(0, 2).toUpperCase()
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadAvatar.isPending ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div>
            <h3 className="text-2xl font-black text-foreground">{profile?.full_name || user?.email?.split('@')[0]}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {profile?.adi_number && (
              <p className="text-xs text-primary font-bold mt-1">ADI: {profile.adi_number}</p>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Your phone number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adi_number">ADI Number</Label>
                <Input
                  id="adi_number"
                  value={formData.adi_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, adi_number: e.target.value }))}
                  placeholder="Your ADI number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate (£)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                  placeholder="40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Your address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell students about yourself..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms_of_business" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Terms of Business
              </Label>
              <Textarea
                id="terms_of_business"
                value={formData.terms_of_business}
                onChange={(e) => setFormData(prev => ({ ...prev, terms_of_business: e.target.value }))}
                placeholder="Enter your cancellation policy, payment terms, and any other conditions students must agree to..."
                rows={5}
              />
              <p className="text-[10px] text-muted-foreground">Students will see and accept these terms during onboarding</p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="flex-1 flex items-center justify-center gap-2 p-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {updateProfile.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 p-4 border border-border rounded-2xl font-bold hover:bg-muted transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-muted transition-all"
            >
              <User className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">Edit Profile</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-muted transition-all">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">Payment Settings</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-muted transition-all">
              <Bell className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">Notifications</span>
            </button>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-muted transition-all">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">Privacy & Security</span>
            </button>
          </div>
        )}
      </GlassCard>

      {/* Block Booking Settings */}
      <BlockBookingSettings />

      {/* Data Management */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-4">Data Management</h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl border border-destructive/30 hover:bg-destructive/10 transition-all">
              <Trash2 className="h-5 w-5 text-destructive" />
              <div className="text-left">
                <span className="font-bold text-foreground block">Clear All Lessons</span>
                <span className="text-[10px] text-muted-foreground">Remove all booked lessons from your calendar</span>
              </div>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete ALL lessons from your calendar. This action cannot be undone. Student credit balances will not be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearAllLessons}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isClearing}
              >
                {isClearing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Yes, delete all lessons
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </GlassCard>

      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-3 p-5 bg-destructive text-destructive-foreground rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-destructive/90 transition-all"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </button>
    </div>
  );
};

export default InstructorSettings;
