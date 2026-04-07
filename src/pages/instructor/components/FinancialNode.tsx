import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getConnectStatus, createConnectAccount } from '@/services/stripeService';
import { getPendingVerifications, verifyManualPayment, getTransactionLedger } from '@/services/financialService';
import { Transaction, PendingVerification } from '@/types/financial';
import { 
  Wallet, CheckCircle, XCircle, Clock, CreditCard, Building2, Coins, 
  ExternalLink, Loader2, RefreshCw, MessageSquare, Plus, AlertCircle,
  TrendingUp, Rocket, Send, Target, Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

// Types for outstanding balances
interface StudentOutstanding {
  id: string;
  name: string;
  initials: string;
  lessonsUnpaid: number;
  amountOwed: number;
}

// Group transactions by time period
function groupTransactionsByPeriod(transactions: Transaction[]) {
  const now = new Date();
  const today = now.toDateString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const groups: { today: Transaction[]; thisWeek: Transaction[]; earlier: Transaction[] } = {
    today: [],
    thisWeek: [],
    earlier: [],
  };
  
  transactions.forEach(t => {
    const date = new Date(t.timestamp);
    if (date.toDateString() === today) {
      groups.today.push(t);
    } else if (date >= weekAgo) {
      groups.thisWeek.push(t);
    } else {
      groups.earlier.push(t);
    }
  });
  
  return groups;
}

const FinancialNode: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<{
    connected: boolean;
    payoutsEnabled: boolean;
    dashboardUrl?: string;
  }>({ connected: false, payoutsEnabled: false });
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Verification dialog state
  const [verifyDialog, setVerifyDialog] = useState<{
    isOpen: boolean;
    verification: PendingVerification | null;
    action: 'confirm' | 'reject';
  }>({ isOpen: false, verification: null, action: 'confirm' });
  const [verifyNotes, setVerifyNotes] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [status, pending, ledger] = await Promise.all([
        getConnectStatus().catch(() => ({ connected: false, payoutsEnabled: false, status: 'not_connected' as const, onboardingComplete: false })),
        getPendingVerifications().catch(() => []),
        getTransactionLedger().catch(() => []),
      ]);
      
      setStripeStatus({
        connected: status.connected,
        payoutsEnabled: status.payoutsEnabled,
        dashboardUrl: 'dashboardUrl' in status ? status.dashboardUrl : undefined,
      });
      setPendingVerifications(pending);
      setTransactions(ledger);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    
    // Pre-open window synchronously to bypass mobile Safari popup blocker
    const popup = window.open('about:blank', '_blank');
    
    try {
      const { url } = await createConnectAccount();
      
      if (popup) {
        popup.location.href = url;
      } else {
        // Fallback if popup was blocked
        window.location.href = url;
      }
    } catch (error) {
      // Close the blank popup on error
      popup?.close();
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to connect Stripe',
        variant: 'destructive',
      });
    } finally {
      setIsConnectingStripe(false);
    }
  };

  const handleVerifyClick = (verification: PendingVerification, action: 'confirm' | 'reject') => {
    setVerifyDialog({ isOpen: true, verification, action });
    setVerifyNotes('');
  };

  const handleVerifySubmit = async () => {
    if (!verifyDialog.verification) return;
    
    setProcessingId(verifyDialog.verification.id);
    try {
      await verifyManualPayment(
        verifyDialog.verification.id,
        verifyDialog.action === 'confirm',
        verifyNotes || undefined
      );
      
      toast({
        title: verifyDialog.action === 'confirm' ? '✅ Payment Confirmed' : '❌ Payment Rejected',
        description: verifyDialog.action === 'confirm'
          ? `${verifyDialog.verification.hours} hours added to ${verifyDialog.verification.studentName}'s balance.`
          : `${verifyDialog.verification.studentName} has been notified.`,
      });
      
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process verification',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
      setVerifyDialog({ isOpen: false, verification: null, action: 'confirm' });
    }
  };

  // Calculate metrics
  const completedTransactions = transactions.filter(t => t.status === 'COMPLETED');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Weekly income calculation
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const thisWeekRevenue = completedTransactions
    .filter(t => new Date(t.timestamp) >= weekStart)
    .reduce((sum, t) => sum + t.amount, 0);
  const weeklyGoal = 800; // Could be made configurable
  const weeklyProgress = Math.min(100, (thisWeekRevenue / weeklyGoal) * 100);

  // Mock outstanding data (in real app, fetch from lessons without payment)
  const outstandingStudents: StudentOutstanding[] = [
    // This would come from comparing booked lessons to credit balances
  ];
  const totalOutstanding = outstandingStudents.reduce((sum, s) => sum + s.amountOwed, 0);

  // Group transactions
  const groupedTransactions = groupTransactionsByPeriod(completedTransactions);

  const getMethodIcon = (method: Transaction['method']) => {
    switch (method) {
      case 'STRIPE': return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'BANK_TRANSFER': return <Building2 className="h-4 w-4 text-purple-500" />;
      case 'CASH': return <Coins className="h-4 w-4 text-amber-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state - no Stripe and no transactions
  const hasNoActivity = transactions.length === 0 && !stripeStatus.connected;

  return (
    <div className="space-y-4 pb-24 px-4 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Money Hub</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Track income & outstanding payments</p>
        </div>
        <Button onClick={loadData} variant="ghost" size="icon" className="rounded-full">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Empty State */}
      {hasNoActivity ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-foreground">Start earning!</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Connect Stripe to accept card payments, or record cash lessons
          </p>
          
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Button 
              onClick={handleConnectStripe}
              disabled={isConnectingStripe}
              className="w-full gap-2"
            >
              {isConnectingStripe ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Connect Stripe Account
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <Coins className="h-4 w-4" />
              Record a Cash Lesson
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Stripe Connection Card */}
          {!stripeStatus.connected ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-blue-900 dark:text-blue-100">Accept Card Payments</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Let students pay with card. Funds go directly to your bank.
                  </p>
                </div>
                <Button 
                  onClick={handleConnectStripe}
                  disabled={isConnectingStripe}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                >
                  {isConnectingStripe ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Connect'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Stripe Connected</p>
                  <p className="text-xs text-muted-foreground">Accepting card payments</p>
                </div>
              </div>
              {stripeStatus.dashboardUrl && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => window.open(stripeStatus.dashboardUrl, '_blank')}
                >
                  Dashboard
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* Weekly Income Goal Tracker */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-foreground text-sm">This Week's Target</h3>
              </div>
              <span className="text-xl font-black text-foreground">
                £{thisWeekRevenue.toLocaleString()} 
                <span className="text-sm font-normal text-muted-foreground">/ £{weeklyGoal}</span>
              </span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(weeklyProgress)}% of weekly goal</span>
              <span>£{(weeklyGoal - thisWeekRevenue).toLocaleString()} to go</span>
            </div>
          </div>

          {/* Projected Income */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">This Month</span>
            </div>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">£{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Total revenue collected</p>
          </div>

          {/* Outstanding Payments Section */}
          {totalOutstanding > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <h3 className="text-amber-800 dark:text-amber-200 font-bold flex items-center gap-2 mb-1">
                <AlertCircle className="w-5 h-5" />
                £{totalOutstanding.toLocaleString()} Outstanding
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                {outstandingStudents.length} students owe money for lessons
              </p>
              
              <div className="space-y-2">
                {outstandingStudents.map(student => (
                  <div key={student.id} className="flex justify-between items-center bg-white dark:bg-background p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-bold text-sm text-foreground">
                        {student.initials}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.lessonsUnpaid} lessons unpaid</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 gap-2 text-white">
                      <Send className="h-3 w-3" />
                      Remind
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Verifications Queue */}
          {pendingVerifications.length > 0 && (
            <div className="bg-card border border-amber-500/30 rounded-2xl overflow-hidden">
              <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <h2 className="font-bold text-foreground text-sm">Awaiting Your Approval</h2>
                </div>
                <Badge className="bg-amber-500/20 text-amber-600 border-0 text-[10px]">
                  {pendingVerifications.length}
                </Badge>
              </div>
              <div className="divide-y divide-border">
                {pendingVerifications.map((v) => (
                  <div key={v.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {v.studentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground text-sm truncate">{v.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          £{v.amount} • {v.hours}h • Bank Transfer
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        onClick={() => handleVerifyClick(v, 'confirm')}
                        disabled={processingId === v.id}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                      >
                        {processingId === v.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => handleVerifyClick(v, 'reject')}
                        disabled={processingId === v.id}
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grouped Transaction History */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="border-b border-border px-4 py-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-foreground text-sm">Recent Payments</h2>
            </div>
            
            {completedTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <Wallet className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="font-bold text-foreground text-sm">Your first payment is coming soon!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Payments will appear here once students start paying
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {/* Today */}
                {groupedTransactions.today.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-muted/50">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Today</p>
                    </div>
                    {groupedTransactions.today.map((t) => (
                      <TransactionRow key={t.id} transaction={t} getMethodIcon={getMethodIcon} />
                    ))}
                  </>
                )}
                
                {/* This Week */}
                {groupedTransactions.thisWeek.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-muted/50">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">This Week</p>
                    </div>
                    {groupedTransactions.thisWeek.map((t) => (
                      <TransactionRow key={t.id} transaction={t} getMethodIcon={getMethodIcon} />
                    ))}
                  </>
                )}
                
                {/* Earlier */}
                {groupedTransactions.earlier.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-muted/50">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Earlier</p>
                    </div>
                    {groupedTransactions.earlier.slice(0, 5).map((t) => (
                      <TransactionRow key={t.id} transaction={t} getMethodIcon={getMethodIcon} />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Quick Actions FAB */}
      {!hasNoActivity && (
        <>
          <button 
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="fixed bottom-24 right-4 md:bottom-8 md:right-8 bg-foreground text-background w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-95 transition-transform"
          >
            <Plus className={`w-6 h-6 transition-transform ${showQuickActions ? 'rotate-45' : ''}`} />
          </button>
          
          {/* Quick Actions Menu */}
          {showQuickActions && (
            <div className="fixed bottom-40 right-4 md:bottom-24 md:right-8 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 w-56">
              <button 
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                onClick={() => setShowQuickActions(false)}
              >
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <Coins className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Record Cash</p>
                  <p className="text-xs text-muted-foreground">Log a cash payment</p>
                </div>
              </button>
              <button 
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left border-t border-border"
                onClick={() => setShowQuickActions(false)}
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Send Reminder</p>
                  <p className="text-xs text-muted-foreground">Nudge for payment</p>
                </div>
              </button>
              <button 
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left border-t border-border"
                onClick={() => setShowQuickActions(false)}
              >
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">View Outstanding</p>
                  <p className="text-xs text-muted-foreground">Who owes money</p>
                </div>
              </button>
            </div>
          )}
        </>
      )}

      {/* Verification Dialog */}
      <Dialog open={verifyDialog.isOpen} onOpenChange={(open) => !open && setVerifyDialog({ isOpen: false, verification: null, action: 'confirm' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verifyDialog.action === 'confirm' ? 'Confirm Payment' : 'Reject Payment'}
            </DialogTitle>
          </DialogHeader>
          
          {verifyDialog.verification && (
            <div className="space-y-4">
              <div className="bg-muted rounded-xl p-4">
                <p className="font-bold">{verifyDialog.verification.studentName}</p>
                <p className="text-muted-foreground text-sm">
                  £{verifyDialog.verification.amount} • {verifyDialog.verification.hours} hours
                </p>
                {verifyDialog.verification.studentNotes && (
                  <p className="text-sm mt-2 italic">Reference: "{verifyDialog.verification.studentNotes}"</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {verifyDialog.action === 'confirm' ? 'Add a note (optional)' : 'Reason for rejection (optional)'}
                </label>
                <Textarea
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder={verifyDialog.action === 'confirm' 
                    ? 'e.g., Verified via bank app on 15/01'
                    : 'e.g., No matching transfer found in bank account'}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialog({ isOpen: false, verification: null, action: 'confirm' })}>
              Cancel
            </Button>
            <Button
              onClick={handleVerifySubmit}
              disabled={processingId !== null}
              className={verifyDialog.action === 'confirm' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={verifyDialog.action === 'reject' ? 'destructive' : 'default'}
            >
              {processingId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {verifyDialog.action === 'confirm' ? 'Confirm & Add Credits' : 'Reject Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Transaction Row Component
const TransactionRow: React.FC<{
  transaction: Transaction;
  getMethodIcon: (method: Transaction['method']) => React.ReactNode;
}> = ({ transaction, getMethodIcon }) => {
  return (
    <div className="px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {getMethodIcon(transaction.method)}
        <div className="min-w-0">
          <p className="font-medium text-foreground text-sm truncate">{transaction.pupilName}</p>
          <p className="text-xs text-muted-foreground">
            {transaction.method === 'CASH' ? 'Cash' : transaction.method === 'STRIPE' ? 'Card' : 'Bank'}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-green-600 dark:text-green-400 text-sm">+£{transaction.amount}</p>
        <p className="text-[10px] text-muted-foreground">{transaction.hours}h</p>
      </div>
    </div>
  );
};

export default FinancialNode;
