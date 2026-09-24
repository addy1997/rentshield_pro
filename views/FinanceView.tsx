import React, { useState } from 'react';
import { ChevronLeft, FileText, MapPin, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { NeuButton, SoftCard } from '../components/ui';
import { AppTab, Bill } from '../types';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { benchmarkRent } from '../services/geminiService';
import { LondonGallery } from '../components/LondonGallery';

export default function FinanceView() {
  const { state, dispatch } = useAppContext();
  const bills = state.data.bills;

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', dueDate: '', splitWith: '' });

  const [benchmarkForm, setBenchmarkForm] = useState({ postcode: '', rent: '' });
  const [benchmarkResult, setBenchmarkResult] = useState<{ averageRent: number; isOvercharging: boolean; summary: string } | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  const onBack = () => dispatch({ type: 'SET_ACTIVE_TAB', payload: AppTab.OVERVIEW });

  const submitBill = () => {
    if (!form.title || !form.amount) return;
    const newBill: Bill = {
      id: Date.now().toString(),
      title: form.title,
      amount: Number(form.amount),
      dueDate: new Date(form.dueDate).getTime() || Date.now(),
      paidBy: 'Me',
      splitWith: form.splitWith.split(',').map(s => s.trim()).filter(Boolean),
      status: 'Pending'
    };
    dispatch({ type: 'ADD_BILL', payload: newBill });
    setAdding(false);
    setForm({ title: '', amount: '', dueDate: '', splitWith: '' });
  };

  const runBenchmark = async () => {
    if (!benchmarkForm.postcode || !benchmarkForm.rent) return;
    setIsBenchmarking(true);
    const res = await benchmarkRent(benchmarkForm.postcode, Number(benchmarkForm.rent));
    setBenchmarkResult(res);
    setIsBenchmarking(false);
  };

  const totalPending = bills.filter(b => b.status === 'Pending').reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h2 className="text-2xl font-display font-bold">Rent & Bills</h2>
        </div>
        <NeuButton className="h-10 px-4 text-xs bg-neone-blue" onClick={() => setAdding(true)}>+ Add Bill</NeuButton>
      </div>

      <SoftCard className="bg-gradient-to-br from-gray-900 to-black text-white border-none">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Pending</p>
        <p className="text-4xl font-display font-bold">£{totalPending.toFixed(2)}</p>
        <div className="mt-4 flex gap-2">
          <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-400">My Share</p>
            <p className="font-bold">£{(totalPending / 2).toFixed(2)}</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-400">Flatmate</p>
            <p className="font-bold">£{(totalPending / 2).toFixed(2)}</p>
          </div>
        </div>
      </SoftCard>

      {adding && (
        <SoftCard className="space-y-4">
          <h3 className="font-bold text-sm">New Bill</h3>
          <div className="space-y-3">
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Bill Title (e.g. Internet)" className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-neone-blue" />
            <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="Total Amount (£)" className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-neone-blue" />
            <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-neone-blue" />
            <input type="text" value={form.splitWith} onChange={e => setForm({...form, splitWith: e.target.value})} placeholder="Split with (comma separated names)" className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-neone-blue" />
          </div>
          <div className="flex gap-2 pt-2">
            <NeuButton variant="secondary" className="flex-1" onClick={() => setAdding(false)}>Cancel</NeuButton>
            <NeuButton className="flex-1 bg-neone-blue" onClick={submitBill}>Save Bill</NeuButton>
          </div>
        </SoftCard>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-bold px-1">Local Rent Benchmark</h3>
        <SoftCard className="p-4 space-y-4">
          <p className="text-xs text-gray-500">Compare your rent against the local market average for your postcode.</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={benchmarkForm.postcode} onChange={e => setBenchmarkForm({...benchmarkForm, postcode: e.target.value})} placeholder="Postcode (e.g. E8 1DN)" className="w-full pl-9 pr-3 py-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-neone-blue" />
            </div>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">£</span>
              <input type="number" value={benchmarkForm.rent} onChange={e => setBenchmarkForm({...benchmarkForm, rent: e.target.value})} placeholder="Monthly Rent" className="w-full pl-8 pr-3 py-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-neone-blue" />
            </div>
          </div>
          <NeuButton className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5" onClick={runBenchmark} disabled={isBenchmarking}>
            {isBenchmarking ? <Loader2 size={16} className="animate-spin mr-2" /> : 'Analyze Fair Rent'}
          </NeuButton>

          {benchmarkResult && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2">
              <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4 shadow-md">
                <LondonGallery />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold">Market Average</p>
                  <p className="text-lg font-display font-bold">£{benchmarkResult.averageRent}</p>
                </div>
                <div className={`p-3 rounded-xl flex gap-3 ${benchmarkResult.isOvercharging ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'}`}>
                  <div className="mt-0.5">
                    {benchmarkResult.isOvercharging ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm mb-1">{benchmarkResult.isOvercharging ? 'You might be overpaying' : 'Fair Market Rate'}</p>
                    <p className="text-xs opacity-90 leading-relaxed">{benchmarkResult.summary}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SoftCard>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold px-1">Recent Bills</h3>
        {bills.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
             <p className="text-xs text-gray-400">No bills added yet.</p>
          </div>
        ) : (
          bills.map(bill => (
            <SoftCard key={bill.id} className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-yellow-100 text-yellow-600'}`}>
                     <FileText size={16} />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-black dark:text-white">{bill.title}</p>
                     <p className="text-[10px] text-gray-500">Due {format(bill.dueDate, 'MMM dd')} • Split with {bill.splitWith.join(', ') || 'None'}</p>
                  </div>
               </div>
               <div className="text-right">
                 <p className="font-bold text-sm">£{bill.amount.toFixed(2)}</p>
                 {bill.status === 'Pending' ? (
                   <button onClick={() => dispatch({ type: 'PAY_BILL', payload: bill.id })} className="text-[10px] font-bold text-neone-blue uppercase mt-1">Mark Paid</button>
                 ) : (
                   <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1">Paid</p>
                 )}
               </div>
            </SoftCard>
          ))
        )}
      </div>
    </div>
  );
}
