import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useInstructorData } from '@/hooks/useInstructorData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, Shield, Key, Eye, EyeOff, Clock, Users, CheckCircle2, XCircle, AlertTriangle, Copy, Settings2, UserCheck, CalendarCheck, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// XOR cipher key matching the mobile app
const XOR_KEY = 'cRuZi_V4uLt_2026!';

function xorEncode(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
  }
  const timestamp = Date.now().toString();
  return btoa(`${result}|${timestamp}`);
}

function xorDecode(encoded: string): string {
  try {
    const decoded = atob(encoded);
    const parts = decoded.split('|');
    const xored = parts[0];
    let result = '';
    for (let i = 0; i < xored.length; i++) {
      result += String.fromCharCode(xored.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
    }
    return result;
  } catch {
    return '';
  }
}

function maskPrn(prn: string): string {
  if (prn.length <= 4) return '****';
  return prn.slice(0, 2) + '*'.repeat(prn.length - 4) + prn.slice(-2);
}

interface BookingPass {
  id: string;
  student_id: string;
  student_name: string;
  status: 'requested' | 'approved' | 'declined' | 'expired' | 'used';
  requested_at: string;
  approved_at: string | null;
  expires_at: string | null;
  declined_at: string | null;
  decline_reason: string | null;
  max_uses: number;
  use_count: number;
  selected_date: string | null;
}

interface TestBooking {
  id: string;
  student_id: string;
  student_name: string;
  test_date: string;
  test_time: string;
  test_centre: string;
  reference: string | null;
  status: 'confirmed' | 'cancelled';
  booked_at: string;
  cancelled_at: string | null;
}

interface TestManagerData {
  prn_encrypted: string | null;
  prn_updated_at: string | null;
  booking_passes: BookingPass[];
  test_bookings: TestBooking[];
  test_ready: Record<string, { enabled: boolean; dates: string[]; updated_at: string }>;
  settings: { default_expiry_hours: number };
}

const DEFAULT_TEST_MANAGER: TestManagerData = {
  prn_encrypted: null,
  prn_updated_at: null,
  booking_passes: [],
  test_bookings: [],
  test_ready: {},
  settings: { default_expiry_hours: 48 },
};

const TestManager: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { students } = useInstructorData();

  const [testManager, setTestManager] = useState<TestManagerData>(DEFAULT_TEST_MANAGER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // PRN state
  const [prnInput, setPrnInput] = useState('');
  const [showPrn, setShowPrn] = useState(false);
  const [editingPrn, setEditingPrn] = useState(false);
  
  // Section collapse state
  const [expandedSection, setExpandedSection] = useState<string>('vault');

  // Load test_manager from profile
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('test_manager')
        .eq('user_id', user.id)
        .single();
      
      if (!error && data?.test_manager) {
        const tm = data.test_manager as unknown as TestManagerData;
        // Auto-expire passes
        const now = new Date();
        const updated = {
          ...DEFAULT_TEST_MANAGER,
          ...tm,
          booking_passes: (tm.booking_passes || []).map(p => {
            if (p.status === 'approved' && p.expires_at && new Date(p.expires_at) < now) {
              return { ...p, status: 'expired' as const };
            }
            return p;
          }),
        };
        setTestManager(updated);
      }
      setLoading(false);
    };
    load();
  }, [user?.id]);

  // Save test_manager to profile
  const saveTestManager = async (newData: TestManagerData) => {
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ test_manager: newData as any })
      .eq('user_id', user.id);
    
    setSaving(false);
    if (error) {
      toast({ title: 'Failed to save', description: error.message, variant: 'destructive' });
      return false;
    }
    setTestManager(newData);
    return true;
  };

  // PRN handlers
  const handleSavePrn = async () => {
    if (!prnInput.trim()) return;
    const encoded = xorEncode(prnInput.trim());
    const newData = { ...testManager, prn_encrypted: encoded, prn_updated_at: new Date().toISOString() };
    const saved = await saveTestManager(newData);
    if (saved) {
      setPrnInput('');
      setEditingPrn(false);
      toast({ title: 'PRN saved securely' });
    }
  };

  const handleRemovePrn = async () => {
    const newData = { ...testManager, prn_encrypted: null, prn_updated_at: null };
    const saved = await saveTestManager(newData);
    if (saved) {
      toast({ title: 'PRN removed' });
    }
  };

  const decodedPrn = useMemo(() => {
    if (!testManager.prn_encrypted) return '';
    return xorDecode(testManager.prn_encrypted);
  }, [testManager.prn_encrypted]);

  // Test ready toggle
  const handleTestReadyToggle = async (studentId: string, studentName: string, enabled: boolean) => {
    const newTestReady = {
      ...testManager.test_ready,
      [studentId]: { enabled, dates: [], updated_at: new Date().toISOString() },
    };
    const newData = { ...testManager, test_ready: newTestReady };
    const saved = await saveTestManager(newData);
    if (saved && enabled) {
      // Send notification to student
      await supabase.from('notifications').insert({
        user_id: studentId,
        type: 'test_dates_available',
        title: 'You\'re Test Ready! 🎉',
        message: 'Your instructor has marked you as test ready. Check available test slots now!',
        target_tab: 'TestBooking',
      });
      toast({ title: `${studentName} marked as test ready` });
    }
  };

  // Booking pass actions
  const handleApprovePass = async (passId: string) => {
    const expiryHours = testManager.settings.default_expiry_hours;
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();
    const newPasses = testManager.booking_passes.map(p =>
      p.id === passId ? { ...p, status: 'approved' as const, approved_at: new Date().toISOString(), expires_at: expiresAt, max_uses: 2 } : p
    );
    const newData = { ...testManager, booking_passes: newPasses };
    await saveTestManager(newData);
    toast({ title: 'Pass approved' });
  };

  const handleDeclinePass = async (passId: string, reason?: string) => {
    const newPasses = testManager.booking_passes.map(p =>
      p.id === passId ? { ...p, status: 'declined' as const, declined_at: new Date().toISOString(), decline_reason: reason || null } : p
    );
    const newData = { ...testManager, booking_passes: newPasses };
    await saveTestManager(newData);
    toast({ title: 'Pass declined' });
  };

  const handleExpiryChange = async (hours: number) => {
    const newData = { ...testManager, settings: { ...testManager.settings, default_expiry_hours: hours } };
    await saveTestManager(newData);
    toast({ title: `Default expiry set to ${hours} hours` });
  };

  // Derived data
  const pendingPasses = testManager.booking_passes.filter(p => p.status === 'requested');
  const activePasses = testManager.booking_passes.filter(p => p.status === 'approved');
  const confirmedBookings = testManager.test_bookings.filter(b => b.status === 'confirmed');
  const testReadyStudents = students.filter(s => testManager.test_ready[s.user_id]?.enabled);
  const activeStudents = students.filter(s => s.status === 'ACTIVE');

  // Stats
  const stats = [
    { label: 'Test Ready', value: testReadyStudents.length, icon: UserCheck, color: 'text-emerald-500' },
    { label: 'Pending Passes', value: pendingPasses.length, icon: Clock, color: 'text-amber-500' },
    { label: 'Active Passes', value: activePasses.length, icon: CheckCircle2, color: 'text-primary' },
    { label: 'Upcoming Tests', value: confirmedBookings.length, icon: CalendarCheck, color: 'text-cruzi-cyan' },
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? '' : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3 max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-black tracking-tight">Test Manager</h1>
            <p className="text-xs text-muted-foreground">PRN Vault & Booking Passes</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(stat => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-4 border border-border"
            >
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* PRN Vault Section */}
        <SectionCard
          id="vault"
          title="PRN Vault"
          subtitle="Your encrypted Personal Reference Number"
          icon={Key}
          iconColor="text-primary"
          expanded={expandedSection === 'vault'}
          onToggle={() => toggleSection('vault')}
          badge={testManager.prn_encrypted ? 'Stored' : 'Not Set'}
          badgeVariant={testManager.prn_encrypted ? 'default' : 'secondary'}
        >
          {testManager.prn_encrypted && !editingPrn ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4 border border-border">
                <Key className="h-5 w-5 text-primary shrink-0" />
                <span className="font-mono text-lg font-bold tracking-widest flex-1">
                  {showPrn ? decodedPrn : maskPrn(decodedPrn)}
                </span>
                <button onClick={() => setShowPrn(!showPrn)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  {showPrn ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
              {testManager.prn_updated_at && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(testManager.prn_updated_at).toLocaleDateString()}
                </p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingPrn(true)}>
                  Update PRN
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleRemovePrn}>
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your DVSA Personal Reference Number. It will be encrypted and never shown to students.
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter your PRN"
                  value={prnInput}
                  onChange={(e) => setPrnInput(e.target.value)}
                  className="font-mono tracking-widest"
                  maxLength={20}
                />
                <Button onClick={handleSavePrn} disabled={!prnInput.trim() || saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
              {editingPrn && (
                <Button variant="ghost" size="sm" onClick={() => { setEditingPrn(false); setPrnInput(''); }}>
                  Cancel
                </Button>
              )}
            </div>
          )}
        </SectionCard>

        {/* Pass Duration Settings */}
        <SectionCard
          id="settings"
          title="Pass Settings"
          subtitle="Configure default booking pass duration"
          icon={Settings2}
          iconColor="text-muted-foreground"
          expanded={expandedSection === 'settings'}
          onToggle={() => toggleSection('settings')}
        >
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Default pass expiry</label>
            <Select
              value={String(testManager.settings.default_expiry_hours)}
              onValueChange={(v) => handleExpiryChange(Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="12">12 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="48">48 hours (default)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Students must use the pass within this time window after approval.
            </p>
          </div>
        </SectionCard>

        {/* Pending Pass Requests */}
        {pendingPasses.length > 0 && (
          <SectionCard
            id="pending"
            title="Pending Requests"
            subtitle={`${pendingPasses.length} pass request${pendingPasses.length > 1 ? 's' : ''} waiting`}
            icon={AlertTriangle}
            iconColor="text-amber-500"
            expanded={expandedSection === 'pending'}
            onToggle={() => toggleSection('pending')}
            badge={String(pendingPasses.length)}
            badgeVariant="destructive"
          >
            <div className="space-y-3">
              {pendingPasses.map(pass => (
                <div key={pass.id} className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{pass.student_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Requested {new Date(pass.requested_at).toLocaleDateString()} at {new Date(pass.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {pass.selected_date && (
                        <p className="text-xs text-primary font-semibold mt-1">Preferred date: {pass.selected_date}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprovePass(pass.id)} className="flex-1">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeclinePass(pass.id)} className="flex-1">
                      <XCircle className="h-4 w-4 mr-1" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Active Passes */}
        {activePasses.length > 0 && (
          <SectionCard
            id="active"
            title="Active Passes"
            subtitle="Currently approved booking passes"
            icon={CheckCircle2}
            iconColor="text-primary"
            expanded={expandedSection === 'active'}
            onToggle={() => toggleSection('active')}
          >
            <div className="space-y-3">
              {activePasses.map(pass => {
                const expiresAt = pass.expires_at ? new Date(pass.expires_at) : null;
                const timeLeft = expiresAt ? Math.max(0, expiresAt.getTime() - Date.now()) : 0;
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                const minsLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                
                return (
                  <div key={pass.id} className="bg-card rounded-xl p-4 border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-foreground">{pass.student_name}</p>
                      <Badge variant="outline" className="text-xs">
                        {pass.use_count}/{pass.max_uses} uses
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {timeLeft > 0 ? (
                        <span className="text-primary font-semibold">{hoursLeft}h {minsLeft}m remaining</span>
                      ) : (
                        <span className="text-destructive font-semibold">Expired</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Test Ready Students */}
        <SectionCard
          id="test-ready"
          title="Test Ready Students"
          subtitle="Toggle which students can request booking passes"
          icon={UserCheck}
          iconColor="text-emerald-500"
          expanded={expandedSection === 'test-ready'}
          onToggle={() => toggleSection('test-ready')}
        >
          {activeStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No active students found.</p>
          ) : (
            <div className="space-y-2">
              {activeStudents.map(student => {
                const isReady = testManager.test_ready[student.user_id]?.enabled || false;
                return (
                  <div key={student.user_id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {(student.full_name || student.email)?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{student.full_name || student.email}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {student.level || 'Beginner'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isReady}
                      onCheckedChange={(checked) => handleTestReadyToggle(student.user_id, student.full_name || student.email, checked)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Upcoming Test Bookings */}
        <SectionCard
          id="bookings"
          title="Upcoming Tests"
          subtitle="Confirmed test bookings from students"
          icon={CalendarCheck}
          iconColor="text-cruzi-cyan"
          expanded={expandedSection === 'bookings'}
          onToggle={() => toggleSection('bookings')}
        >
          {confirmedBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No upcoming test bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {confirmedBookings.map(booking => (
                <div key={booking.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-foreground">{booking.student_name}</p>
                    <Badge variant="secondary">{booking.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div><span className="font-semibold">Date:</span> {booking.test_date}</div>
                    <div><span className="font-semibold">Time:</span> {booking.test_time}</div>
                    <div className="col-span-2"><span className="font-semibold">Centre:</span> {booking.test_centre}</div>
                    {booking.reference && (
                      <div className="col-span-2"><span className="font-semibold">Ref:</span> {booking.reference}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

// Reusable collapsible section card
interface SectionCardProps {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  id, title, subtitle, icon: Icon, iconColor, expanded, onToggle, badge, badgeVariant = 'secondary', children
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card rounded-2xl border border-border overflow-hidden"
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-foreground text-sm">{title}</h3>
          {badge && <Badge variant={badgeVariant} className="text-[10px]">{badge}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
    </button>
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4 pt-1 border-t border-border">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default TestManager;
