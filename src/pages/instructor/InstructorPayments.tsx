import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Download, Receipt, TrendingUp, Loader2 } from 'lucide-react';

interface Props { userId: string; }

const EXPENSE_CATEGORIES = [
  { value: 'fuel', label: 'Fuel' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'dual_controls', label: 'Dual Controls' },
  { value: 'phone', label: 'Phone' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' },
];

function getTaxQuarter(date: Date): { quarter: number; year: string } {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  if (month >= 4 && month <= 6) return { quarter: 1, year: `${year}/${year + 1}` };
  if (month >= 7 && month <= 9) return { quarter: 2, year: `${year}/${year + 1}` };
  if (month >= 10 && month <= 12) return { quarter: 3, year: `${year}/${year + 1}` };
  return { quarter: 4, year: `${year - 1}/${year}` };
}

function getTaxYear(date: Date): string {
  const { year } = getTaxQuarter(date);
  return year;
}

const QUARTER_LABELS: Record<number, string> = {
  1: 'Q1 (Apr–Jun)',
  2: 'Q2 (Jul–Sep)',
  3: 'Q3 (Oct–Dec)',
  4: 'Q4 (Jan–Mar)',
};

function useExpenses(userId: string) {
  return useQuery({
    queryKey: ['expenses', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_records')
        .select('*')
        .eq('instructor_id', userId)
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useIncome(userId: string) {
  return useQuery({
    queryKey: ['income', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('instructor_earnings, amount_paid, created_at, transaction_type, status')
        .eq('instructor_id', userId)
        .eq('status', 'completed');
      if (error) throw error;
      return data ?? [];
    },
  });
}

const ExpenseForm: React.FC<{ userId: string }> = ({ userId }) => {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    category: 'fuel',
    amount: '',
    expense_date: new Date().toISOString().slice(0, 10),
    description: '',
    is_mileage: false,
    mileage_miles: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!form.amount || !form.expense_date) return;
    setSaving(true);
    const date = new Date(form.expense_date);
    const { quarter, year } = getTaxQuarter(date);
    await supabase.from('expense_records').insert({
      instructor_id: userId,
      category: form.category,
      amount: parseFloat(form.amount),
      expense_date: form.expense_date,
      description: form.description || null,
      is_mileage: form.is_mileage,
      mileage_miles: form.is_mileage && form.mileage_miles ? parseFloat(form.mileage_miles) : null,
      tax_year: year,
      tax_quarter: quarter,
    });
    await qc.invalidateQueries({ queryKey: ['expenses', userId] });
    setSaving(false);
    setSaved(true);
    setForm({ category: 'fuel', amount: '', expense_date: new Date().toISOString().slice(0, 10), description: '', is_mileage: false, mileage_miles: '' });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h3 className="font-bold text-gray-900 flex items-center gap-2"><Receipt className="w-4 h-4 text-[#7c3aed]" /> Log Expense</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7c3aed] bg-white"
          >
            {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (£)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7c3aed]"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
        <input
          type="date"
          value={form.expense_date}
          onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7c3aed]"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optional)</label>
        <input
          type="text"
          placeholder="e.g. Petrol fill-up, Halfords service"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7c3aed]"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setForm(f => ({ ...f, is_mileage: !f.is_mileage }))}
          className={`w-10 h-5.5 rounded-full transition-colors relative flex-shrink-0 ${form.is_mileage ? 'bg-[#7c3aed]' : 'bg-gray-200'}`}
          style={{ width: 40, height: 22 }}
        >
          <span className={`absolute top-0.5 w-4.5 h-4 bg-white rounded-full shadow transition-transform ${form.is_mileage ? 'translate-x-[18px]' : 'translate-x-0.5'}`}
            style={{ width: 18, height: 18 }} />
        </button>
        <label className="text-sm text-gray-600">Mileage expense</label>
      </div>
      {form.is_mileage && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Miles driven</label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={form.mileage_miles}
            onChange={e => setForm(f => ({ ...f, mileage_miles: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7c3aed]"
          />
        </div>
      )}
      <button
        onClick={handleSave}
        disabled={saving || !form.amount}
        className="w-full flex items-center justify-center gap-2 bg-[#7c3aed] text-white rounded-xl py-3 font-semibold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Add Expense'}
      </button>
    </div>
  );
};

const TaxSummary: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: expenses = [] } = useExpenses(userId);
  const { data: income = [] } = useIncome(userId);

  type QuarterKey = string;
  const quarters: Record<QuarterKey, { income: number; expenses: number; q: number; year: string }> = {};

  income.forEach((tx: any) => {
    const date = new Date(tx.created_at);
    const { quarter, year } = getTaxQuarter(date);
    const key = `${year}-Q${quarter}`;
    if (!quarters[key]) quarters[key] = { income: 0, expenses: 0, q: quarter, year };
    quarters[key].income += Number(tx.instructor_earnings ?? tx.amount_paid ?? 0);
  });

  expenses.forEach((ex: any) => {
    const date = new Date(ex.expense_date);
    const { quarter, year } = getTaxQuarter(date);
    const key = `${year}-Q${quarter}`;
    if (!quarters[key]) quarters[key] = { income: 0, expenses: 0, q: quarter, year };
    quarters[key].expenses += Number(ex.amount ?? 0);
  });

  const sorted = Object.entries(quarters).sort(([a], [b]) => b.localeCompare(a));
  const totalIncome = sorted.reduce((s, [, v]) => s + v.income, 0);
  const totalExpenses = sorted.reduce((s, [, v]) => s + v.expenses, 0);
  const totalProfit = totalIncome - totalExpenses;

  const exportCSV = () => {
    const rows = [
      ['Tax Year', 'Quarter', 'Income', 'Expenses', 'Profit'],
      ...sorted.map(([, v]) => [v.year, QUARTER_LABELS[v.q], v.income.toFixed(2), v.expenses.toFixed(2), (v.income - v.expenses).toFixed(2)]),
      ['TOTAL', '', totalIncome.toFixed(2), totalExpenses.toFixed(2), totalProfit.toFixed(2)],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cruzi-tax-summary-${new Date().getFullYear()}.csv`;
    a.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#7c3aed]" /> Tax Summary</h3>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#7c3aed] hover:text-purple-700 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>
      {sorted.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No data yet. Log expenses and record income to see your summary.</div>
      ) : (
        <>
          <div className="divide-y divide-gray-50">
            {sorted.map(([key, v]) => {
              const profit = v.income - v.expenses;
              return (
                <div key={key} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 text-sm">{v.year} — {QUARTER_LABELS[v.q]}</p>
                    <span className={`text-sm font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      £{profit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Income: <span className="text-green-600 font-semibold">£{v.income.toFixed(2)}</span></span>
                    <span>Expenses: <span className="text-red-500 font-semibold">£{v.expenses.toFixed(2)}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-gray-50 p-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900">Annual Total</p>
              <span className={`font-black text-lg ${totalProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                £{totalProfit.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-4 text-xs text-gray-500 mt-1">
              <span>Income: <span className="font-semibold text-green-600">£{totalIncome.toFixed(2)}</span></span>
              <span>Expenses: <span className="font-semibold text-red-500">£{totalExpenses.toFixed(2)}</span></span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const RecentExpenses: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: expenses = [], isLoading } = useExpenses(userId);
  const recent = expenses.slice(0, 10);

  if (isLoading) return <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />;
  if (recent.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <h3 className="font-bold text-gray-900 p-4 border-b border-gray-100 text-sm">Recent Expenses</h3>
      <div className="divide-y divide-gray-50">
        {recent.map((ex: any) => (
          <div key={ex.id} className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 capitalize">{ex.category?.replace('_', ' ')}</p>
              <p className="text-xs text-gray-400">{new Date(ex.expense_date).toLocaleDateString('en-GB')} {ex.description && `· ${ex.description}`}</p>
            </div>
            <p className="text-sm font-bold text-red-500">-£{Number(ex.amount).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const InstructorPayments: React.FC<Props> = ({ userId }) => {
  return (
    <div className="space-y-5">
      <ExpenseForm userId={userId} />
      <TaxSummary userId={userId} />
      <RecentExpenses userId={userId} />
    </div>
  );
};

export default InstructorPayments;
