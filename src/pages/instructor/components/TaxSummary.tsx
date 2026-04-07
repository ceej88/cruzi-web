import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Loader2, Download, TrendingUp, TrendingDown, FileSpreadsheet,
  CheckCircle2, Clock, AlertTriangle
} from 'lucide-react';

interface QuarterData {
  quarter: number;
  label: string;
  months: string;
  income: number;
  expenses: number;
  profit: number;
  expensesByCategory: Record<string, number>;
  status: 'complete' | 'current' | 'future';
}

const QUARTER_LABELS: Record<number, { label: string; months: string }> = {
  1: { label: 'Q1', months: 'Apr – Jun' },
  2: { label: 'Q2', months: 'Jul – Sep' },
  3: { label: 'Q3', months: 'Oct – Dec' },
  4: { label: 'Q4', months: 'Jan – Mar' },
};

const CATEGORY_LABELS: Record<string, string> = {
  vehicle_fuel: 'Fuel',
  vehicle_insurance: 'Insurance',
  vehicle_maintenance: 'Maintenance & Repairs',
  vehicle_tax_mot: 'Road Tax & MOT',
  vehicle_lease_purchase: 'Vehicle Lease/Purchase',
  dual_controls: 'Dual Controls',
  phone_data: 'Phone & Data',
  office_admin: 'Office & Admin',
  training_cpd: 'Training & CPD',
  advertising_marketing: 'Advertising',
  clothing_uniform: 'Clothing & Uniform',
  professional_subscriptions: 'Subscriptions',
  accountancy_fees: 'Accountancy Fees',
  other_business: 'Other Business',
};

function getCurrentTaxYear(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  if (m >= 4) return `${y}-${String(y + 1).slice(2)}`;
  return `${y - 1}-${String(y).slice(2)}`;
}

function getCurrentQuarter(): number {
  const m = new Date().getMonth() + 1;
  if (m >= 4 && m <= 6) return 1;
  if (m >= 7 && m <= 9) return 2;
  if (m >= 10 && m <= 12) return 3;
  return 4;
}

const TaxSummary: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [taxYear, setTaxYear] = useState(getCurrentTaxYear());
  const [incomeData, setIncomeData] = useState<Record<number, number>>({});
  const [expenseData, setExpenseData] = useState<{ quarter: number; category: string; total: number }[]>([]);

  // Available tax years
  const taxYears = useMemo(() => {
    const current = getCurrentTaxYear();
    const [startYear] = current.split('-').map(Number);
    return [
      `${startYear}-${String(startYear + 1).slice(2)}`,
      `${startYear - 1}-${String(startYear).slice(2)}`,
    ];
  }, []);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id, taxYear]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);

    // Map tax year to date ranges for income
    const [startYearStr] = taxYear.split('-');
    const startYear = parseInt(startYearStr);
    const yearStart = `${startYear}-04-01`;
    const yearEnd = `${startYear + 1}-03-31`;

    const [transRes, expRes] = await Promise.all([
      supabase
        .from('credit_transactions')
        .select('amount_paid, created_at, status')
        .eq('instructor_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', yearStart)
        .lte('created_at', yearEnd + 'T23:59:59'),
      supabase
        .from('expense_records')
        .select('amount, category, tax_quarter')
        .eq('instructor_id', user.id)
        .eq('tax_year', taxYear) as any,
    ]);

    // Group income by quarter
    const qIncome: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    (transRes.data || []).forEach((t: any) => {
      const m = new Date(t.created_at).getMonth() + 1;
      let q: number;
      if (m >= 4 && m <= 6) q = 1;
      else if (m >= 7 && m <= 9) q = 2;
      else if (m >= 10 && m <= 12) q = 3;
      else q = 4;
      qIncome[q] += t.amount_paid || 0;
    });
    setIncomeData(qIncome);

    // Expense data by quarter and category
    const expenseRows = (expRes.data || []).map((e: any) => ({
      quarter: e.tax_quarter,
      category: e.category,
      total: e.amount,
    }));
    setExpenseData(expenseRows);
    setLoading(false);
  };

  const currentQ = getCurrentQuarter();
  const isCurrentYear = taxYear === getCurrentTaxYear();

  const quarters: QuarterData[] = [1, 2, 3, 4].map(q => {
    const income = incomeData[q] || 0;
    const qExpenses = expenseData.filter(e => e.quarter === q);
    const totalExpenses = qExpenses.reduce((sum, e) => sum + e.total, 0);
    const expensesByCategory: Record<string, number> = {};
    qExpenses.forEach(e => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.total;
    });

    let status: QuarterData['status'] = 'future';
    if (isCurrentYear) {
      if (q < currentQ) status = 'complete';
      else if (q === currentQ) status = 'current';
    } else {
      status = 'complete';
    }

    return {
      quarter: q,
      ...QUARTER_LABELS[q],
      income,
      expenses: totalExpenses,
      profit: income - totalExpenses,
      expensesByCategory,
      status,
    };
  });

  const annualIncome = quarters.reduce((s, q) => s + q.income, 0);
  const annualExpenses = quarters.reduce((s, q) => s + q.expenses, 0);
  const annualProfit = annualIncome - annualExpenses;

  const handleExportCSV = () => {
    const rows = [
      ['Tax Year', taxYear],
      [''],
      ['Quarter', 'Period', 'Income (£)', 'Expenses (£)', 'Profit (£)'],
      ...quarters.map(q => [q.label, q.months, q.income.toFixed(2), q.expenses.toFixed(2), q.profit.toFixed(2)]),
      [''],
      ['ANNUAL TOTAL', '', annualIncome.toFixed(2), annualExpenses.toFixed(2), annualProfit.toFixed(2)],
      [''],
      [''],
      ['EXPENSE BREAKDOWN'],
      ['Quarter', 'Category', 'Amount (£)'],
    ];

    quarters.forEach(q => {
      Object.entries(q.expensesByCategory).forEach(([cat, amount]) => {
        rows.push([q.label, CATEGORY_LABELS[cat] || cat, amount.toFixed(2)]);
      });
    });

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cruzi-tax-summary-${taxYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exported', description: `Tax summary for ${taxYear} downloaded` });
  };

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
          <h2 className="text-lg font-black text-foreground">Tax Summary</h2>
          <p className="text-xs text-muted-foreground">MTD-ready quarterly overview</p>
        </div>
        <div className="flex gap-2">
          <Select value={taxYear} onValueChange={setTaxYear}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {taxYears.map(ty => (
                <SelectItem key={ty} value={ty}>{ty}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExportCSV} size="sm" variant="outline" className="gap-1">
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
        </div>
      </div>

      {/* Annual totals */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <TrendingUp className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-black text-foreground">£{annualIncome.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Income</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <TrendingDown className="h-4 w-4 text-red-500 mx-auto mb-1" />
          <p className="text-lg font-black text-foreground">£{annualExpenses.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Expenses</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <FileSpreadsheet className="h-4 w-4 text-primary mx-auto mb-1" />
          <p className={`text-lg font-black ${annualProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            £{annualProfit.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium">Profit</p>
        </div>
      </div>

      {/* Quarterly cards */}
      {quarters.map(q => (
        <div key={q.quarter} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <span className="font-black text-foreground">{q.label}</span>
              <span className="text-xs text-muted-foreground">{q.months}</span>
            </div>
            <Badge
              variant={q.status === 'complete' ? 'default' : q.status === 'current' ? 'secondary' : 'outline'}
              className="text-[10px]"
            >
              {q.status === 'complete' && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {q.status === 'current' && <Clock className="h-3 w-3 mr-1" />}
              {q.status === 'future' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {q.status === 'complete' ? 'Complete' : q.status === 'current' ? 'In Progress' : 'Upcoming'}
            </Badge>
          </div>
          
          <div className="p-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-sm font-bold text-emerald-600">£{q.income.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">Income</p>
            </div>
            <div>
              <p className="text-sm font-bold text-red-500">£{q.expenses.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">Expenses</p>
            </div>
            <div>
              <p className={`text-sm font-bold ${q.profit >= 0 ? 'text-foreground' : 'text-red-600'}`}>
                £{q.profit.toFixed(2)}
              </p>
              <p className="text-[10px] text-muted-foreground">Profit</p>
            </div>
          </div>

          {/* Category breakdown if has expenses */}
          {Object.keys(q.expensesByCategory).length > 0 && (
            <div className="px-4 pb-3 space-y-1.5">
              {Object.entries(q.expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{CATEGORY_LABELS[cat] || cat}</span>
                    <span className="font-medium text-foreground">£{amount.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}

      {/* MTD info banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
        <h3 className="font-bold text-foreground text-sm mb-1">📋 MTD-Ready Export</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Export your quarterly CSV and upload it to your MTD software (Xero, FreeAgent, QuickBooks) 
          or send it to your accountant. Income is auto-tracked from lesson payments. 
          Just keep logging expenses and you're covered.
        </p>
      </div>
    </div>
  );
};

export default TaxSummary;
