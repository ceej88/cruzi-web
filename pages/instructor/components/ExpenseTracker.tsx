import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Loader2, Trash2, Fuel, Shield, Wrench, Car, Phone,
  FileText, GraduationCap, Megaphone, Shirt, BookOpen, Calculator, MoreHorizontal
} from 'lucide-react';

// HMRC expense categories with labels and icons
const EXPENSE_CATEGORIES = [
  { value: 'vehicle_fuel', label: 'Fuel', icon: Fuel },
  { value: 'vehicle_insurance', label: 'Insurance', icon: Shield },
  { value: 'vehicle_maintenance', label: 'Maintenance & Repairs', icon: Wrench },
  { value: 'vehicle_tax_mot', label: 'Road Tax & MOT', icon: Car },
  { value: 'vehicle_lease_purchase', label: 'Vehicle Lease/Purchase', icon: Car },
  { value: 'dual_controls', label: 'Dual Controls', icon: Car },
  { value: 'phone_data', label: 'Phone & Data', icon: Phone },
  { value: 'office_admin', label: 'Office & Admin', icon: FileText },
  { value: 'training_cpd', label: 'Training & CPD', icon: GraduationCap },
  { value: 'advertising_marketing', label: 'Advertising', icon: Megaphone },
  { value: 'clothing_uniform', label: 'Clothing & Uniform', icon: Shirt },
  { value: 'professional_subscriptions', label: 'Subscriptions', icon: BookOpen },
  { value: 'accountancy_fees', label: 'Accountancy Fees', icon: Calculator },
  { value: 'other_business', label: 'Other Business', icon: MoreHorizontal },
] as const;

type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]['value'];

interface ExpenseRecord {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  expense_date: string;
  tax_year: string;
  tax_quarter: number;
  is_mileage: boolean;
  mileage_miles: number | null;
  created_at: string;
}

function getTaxPeriod(date: Date): { taxYear: string; taxQuarter: number } {
  const y = date.getFullYear();
  const m = date.getMonth() + 1; // 1-12
  
  let taxYear: string;
  if (m >= 4) {
    taxYear = `${y}-${String(y + 1).slice(2)}`;
  } else {
    taxYear = `${y - 1}-${String(y).slice(2)}`;
  }
  
  let taxQuarter: number;
  if (m >= 4 && m <= 6) taxQuarter = 1;
  else if (m >= 7 && m <= 9) taxQuarter = 2;
  else if (m >= 10 && m <= 12) taxQuarter = 3;
  else taxQuarter = 4;
  
  return { taxYear, taxQuarter };
}

function getCategoryIcon(category: string) {
  const cat = EXPENSE_CATEGORIES.find(c => c.value === category);
  if (!cat) return MoreHorizontal;
  return cat.icon;
}

function getCategoryLabel(category: string) {
  return EXPENSE_CATEGORIES.find(c => c.value === category)?.label || category;
}

const ExpenseTracker: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('vehicle_fuel');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user?.id) loadExpenses();
  }, [user?.id]);

  const loadExpenses = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('expense_records')
      .select('*')
      .eq('instructor_id', user.id)
      .order('expense_date', { ascending: false })
      .limit(50);

    if (!error && data) setExpenses(data as unknown as ExpenseRecord[]);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!user?.id || !amount || parseFloat(amount) <= 0) return;
    setSaving(true);

    const date = new Date(expenseDate);
    const { taxYear, taxQuarter } = getTaxPeriod(date);

    const { error } = await supabase.from('expense_records').insert({
      instructor_id: user.id,
      amount: parseFloat(amount),
      category,
      description: description || null,
      expense_date: expenseDate,
      tax_year: taxYear,
      tax_quarter: taxQuarter,
    } as any);

    if (error) {
      toast({ title: 'Error', description: 'Failed to add expense', variant: 'destructive' });
    } else {
      toast({ title: 'Expense added' });
      setShowAdd(false);
      setAmount('');
      setDescription('');
      setCategory('vehicle_fuel');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      loadExpenses();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('expense_records').delete().eq('id', id);
    if (!error) {
      setExpenses(prev => prev.filter(e => e.id !== id));
      toast({ title: 'Expense deleted' });
    }
    setDeletingId(null);
  };

  // Group expenses by month
  const grouped = expenses.reduce<Record<string, ExpenseRecord[]>>((acc, exp) => {
    const monthKey = exp.expense_date.slice(0, 7); // YYYY-MM
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(exp);
    return acc;
  }, {});

  const totalThisQuarter = (() => {
    const { taxYear, taxQuarter } = getTaxPeriod(new Date());
    return expenses
      .filter(e => e.tax_year === taxYear && e.tax_quarter === taxQuarter)
      .reduce((sum, e) => sum + e.amount, 0);
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 px-4 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground">Business Expenses</h2>
          <p className="text-xs text-muted-foreground">HMRC-categorised for MTD</p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {/* Quarter summary */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">This Quarter</p>
        <p className="text-2xl font-black text-foreground mt-1">
          £{totalThisQuarter.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Q{getTaxPeriod(new Date()).taxQuarter} • Tax Year {getTaxPeriod(new Date()).taxYear}
        </p>
      </div>

      {/* Expense list grouped by month */}
      {expenses.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <Calculator className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-bold text-foreground text-sm">No expenses yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Start logging fuel, insurance, and other business costs
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([monthKey, monthExpenses]) => {
          const monthDate = new Date(monthKey + '-01');
          const monthLabel = monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
          const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

          return (
            <div key={monthKey} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/50 flex items-center justify-between">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{monthLabel}</p>
                <p className="text-xs font-bold text-foreground">£{monthTotal.toFixed(2)}</p>
              </div>
              <div className="divide-y divide-border">
                {monthExpenses.map(exp => {
                  const Icon = getCategoryIcon(exp.category);
                  return (
                    <div key={exp.id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {getCategoryLabel(exp.category)}
                          </p>
                          {exp.description && (
                            <p className="text-xs text-muted-foreground truncate">{exp.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p className="font-bold text-red-500 text-sm">-£{exp.amount.toFixed(2)}</p>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          disabled={deletingId === exp.id}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          {deletingId === exp.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Add Expense Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Amount (£)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Category</label>
              <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Date</label>
              <Input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description (optional)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Shell petrol, 45 litres"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !amount}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseTracker;
