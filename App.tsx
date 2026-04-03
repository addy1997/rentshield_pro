import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Shield, Scan, AlertTriangle, FileText, MapPin, Camera, Upload, CheckCircle, XCircle, Siren, Send, Clock, Home as HomeIcon, Loader2, Fingerprint, ChevronLeft, Lock, Thermometer, ExternalLink, Calculator, User, Settings, LogOut, Bell, Info, RefreshCw, Moon, Sun, Star, History, ThumbsUp, TrendingUp, MessageSquare, ArrowRight, Link as LinkIcon, Calendar, Trash2, Save, Eye, EyeOff, Smartphone, Ghost, Activity, FileLock, ChevronRight, AlertCircle, Sparkles, Download, FileCheck, Accessibility, HelpCircle, ShieldCheck, Book, Type as TypeIcon, Mail, MessageSquareQuote, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeContract, analyzeHazard, detectBiddingWar, generateResponse, analyzeEPC, analyzeRentIncrease, translateLandlordSpeak, identifyLocation, generateDisputeLetter } from './services/geminiService';
import { NeuButton, SoftCard, NeuAlert, TooltipIcon } from './components/ui';
import { AppTab, Hazard, Tone, ScanHistoryItem, Bill, InventoryItem, VaultDocument } from './types';
import { format, addDays, differenceInDays, formatDistanceToNow } from 'date-fns';

// --- Types ---

interface UserProfile {
  firstName: string;
  lastName: string;
  age: string;
  mobile: string;
  avatar?: string;
}

// --- Shared Components ---

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex-shrink-0 ${checked ? 'bg-neone-green' : 'bg-gray-200 dark:bg-gray-700'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const AnimatedLogo = ({ location }: { location?: string }) => (
  <motion.div 
    className="flex items-center gap-2 cursor-pointer group select-none"
    whileHover={{ scale: 1.02 }}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    <motion.div 
      className="w-9 h-9 bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/5 dark:shadow-white/5"
      whileHover={{ rotate: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Shield className="w-5 h-5 text-white dark:text-black" />
    </motion.div>
    <div className="flex flex-col">
      <h1 className="font-display text-xl font-bold text-black dark:text-white tracking-tight leading-none">
        Rent<span className="text-neone-blue">Shield</span>
      </h1>
      {location && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest"
        >
          <MapPin size={10} className="text-neone-blue" />
          {location}
        </motion.div>
      )}
    </div>
  </motion.div>
);

// --- Registration View ---

const RegisterView = ({ onRegister }: { onRegister: (user: UserProfile) => void }) => {
  const [formData, setFormData] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    age: '',
    mobile: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName && formData.age && formData.mobile) {
      onRegister(formData);
    }
  };

  return (
    <div className="h-full bg-white dark:bg-black flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,209,255,0.1),transparent_50%)]" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xs w-full space-y-8 relative z-10"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-black dark:bg-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-neone-blue/20 mb-2">
            <Shield size={40} className="text-white dark:text-black" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold tracking-tight">Create Profile</h1>
            <p className="text-gray-500 text-sm font-medium">Your Tenant Protection Shield</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="First Name"
              required
              value={formData.firstName}
              onChange={e => setFormData({...formData, firstName: e.target.value})}
              className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-neone-blue outline-none transition-all placeholder:text-gray-400 font-medium text-sm"
            />
            <input 
              type="text" 
              placeholder="Last Name"
              required
              value={formData.lastName}
              onChange={e => setFormData({...formData, lastName: e.target.value})}
              className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-neone-blue outline-none transition-all placeholder:text-gray-400 font-medium text-sm"
            />
          </div>
          <input 
            type="number" 
            placeholder="Age"
            required
            min="18"
            max="120"
            value={formData.age}
            onChange={e => setFormData({...formData, age: e.target.value})}
            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-neone-blue outline-none transition-all placeholder:text-gray-400 font-medium text-sm"
          />
          <input 
            type="tel" 
            placeholder="Mobile Number"
            required
            value={formData.mobile}
            onChange={e => setFormData({...formData, mobile: e.target.value})}
            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-neone-blue outline-none transition-all placeholder:text-gray-400 font-medium text-sm"
          />
          
          <div className="pt-2">
            <NeuButton type="submit" className="w-full py-3.5 text-base">Secure My Account</NeuButton>
          </div>
        </form>

        <div className="flex items-center justify-center gap-2 text-gray-400">
           <Lock size={12} />
           <p className="text-[10px] font-bold uppercase tracking-widest">Encrypted Local Storage</p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Home View ---

const HomeView = ({ location, setTab, hazards }: { location: string, setTab: (t: AppTab) => void, hazards: Hazard[] }) => (
  <div className="space-y-6 pb-4">
    <header className="flex justify-between items-center pt-2">
      <AnimatedLogo location={location} />
    </header>

    <NeuAlert type="success" title="You are Protected">
      The Renters' Rights Act 2026 is active. Your legal shield is active in {location.split(',')[0]}.
    </NeuAlert>

    {hazards.length > 0 && (
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider px-1">Legal Deadlines</h3>
        {hazards.map(h => {
          const daysElapsed = differenceInDays(new Date(), new Date(h.dateReported));
          const daysLeft = Math.max(0, 14 - daysElapsed);
          return (
            <SoftCard key={h.id} className="border-l-4 border-l-neone-red py-4">
               <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{h.type}</p>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">Timer started {format(h.dateReported, 'MMM dd')}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-display font-bold ${daysLeft <= 3 ? 'text-neone-red' : 'text-neone-yellow'}`}>
                      {daysLeft}d
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Left</p>
                  </div>
               </div>
            </SoftCard>
          );
        })}
      </div>
    )}

    <div className="grid grid-cols-2 gap-4">
      <SoftCard onClick={() => setTab(AppTab.SCAN)} className="p-5 cursor-pointer hover:ring-2 hover:ring-neone-blue/50 transition-all group h-44 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-neone-blue/5 rounded-full" />
        <Scan size={32} className="text-neone-blue group-hover:scale-110 transition-transform duration-300" />
        <div>
          <div className="font-bold text-base mb-1 leading-tight flex items-center gap-1">
            Contract & Rights Check
            <TooltipIcon text="Compliance Pulse: Analyze your contracts, EPCs, and bidding wars." />
          </div>
          <p className="text-xs text-gray-500 leading-snug">Analyze Contracts, Bidding Wars & EPCs</p>
        </div>
      </SoftCard>
      <SoftCard onClick={() => setTab(AppTab.TRACKER)} className="p-5 cursor-pointer hover:ring-2 hover:ring-neone-red/50 transition-all group h-44 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-neone-red/5 rounded-full" />
        <AlertTriangle size={32} className="text-neone-red group-hover:scale-110 transition-transform duration-300" />
        <div>
          <div className="font-bold text-base mb-1 leading-tight flex items-center gap-1">
            Report a Housing Problem
            <TooltipIcon text="Log a Housing Problem: Track hazards and inventory issues under Awaab's Law." />
          </div>
          <p className="text-xs text-gray-500 leading-snug">Hazards & Inventory Tracker</p>
        </div>
      </SoftCard>
      <SoftCard onClick={() => setTab(AppTab.FINANCE)} className="col-span-2 p-5 cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all group flex items-center justify-between relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full" />
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="font-bold text-lg mb-0.5">Rent & Bills</p>
            <p className="text-xs text-gray-500">Split costs with flatmates</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
      </SoftCard>
    </div>
  </div>
);

// --- Finance View ---

const FinanceView = ({ bills, onAddBill, onPayBill, onBack }: { bills: Bill[], onAddBill: (b: Bill) => void, onPayBill: (id: string) => void, onBack: () => void }) => {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', dueDate: '', splitWith: '' });

  const submitBill = () => {
    if (!form.title || !form.amount) return;
    onAddBill({
      id: Date.now().toString(),
      title: form.title,
      amount: Number(form.amount),
      dueDate: new Date(form.dueDate).getTime() || Date.now(),
      paidBy: 'Me',
      splitWith: form.splitWith.split(',').map(s => s.trim()).filter(Boolean),
      status: 'Pending'
    });
    setAdding(false);
    setForm({ title: '', amount: '', dueDate: '', splitWith: '' });
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
                   <button onClick={() => onPayBill(bill.id)} className="text-[10px] font-bold text-neone-blue uppercase mt-1">Mark Paid</button>
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
};

// --- Scanner View ---

const ScannerView = ({ onSaveHistory, history }: { onSaveHistory: (item: ScanHistoryItem) => void, history: ScanHistoryItem[] }) => {
  const [mode, setMode] = useState<'contract' | 'bidding' | 'epc'>('contract');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setPendingFile(file);
        e.target.value = ''; // Reset input to allow re-selection of same file
    }
  };

  const confirmUpload = async () => {
    if (!pendingFile) return;
    setScanning(true);
    setResult(null);
    const file = pendingFile;
    setPendingFile(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const mimeType = file.type || 'application/octet-stream';
      let res;
      if (mode === 'contract') res = await analyzeContract(base64, mimeType);
      else if (mode === 'bidding') res = await detectBiddingWar(base64, mimeType);
      else res = await analyzeEPC(base64, mimeType);
      
      setResult(res);
      setScanning(false);
      onSaveHistory({ 
        id: Date.now().toString(), 
        date: Date.now(), 
        type: mode, 
        summary: res.summary || res.evidence || "Analysis complete", 
        status: (res.isSafe || !res.isIllegal || res.compliance) ? 'safe' : 'risk' 
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">Compliance Pulse</h2>
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Activity size={16} />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
        {(['contract', 'bidding', 'epc'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setResult(null); setPendingFile(null); }} className={`py-2.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center ${mode === m ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
            {m}
          </button>
        ))}
      </div>

      <div className="min-h-[360px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-8 bg-gray-50/50 dark:bg-gray-900/50 relative overflow-hidden transition-colors hover:bg-gray-50 dark:hover:bg-gray-900">
        {scanning ? (
          <div className="text-center z-10">
            <Loader2 className="w-12 h-12 text-neone-blue animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold animate-pulse">Analyzing Document...</p>
          </div>
        ) : result ? (
          <div className="w-full space-y-5 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className={`p-4 rounded-xl flex items-center gap-4 ${ (result.isSafe || !result.isIllegal || result.compliance) ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                { (result.isSafe || !result.isIllegal || result.compliance) ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide">{(result.isSafe || !result.isIllegal || result.compliance) ? 'Compliant' : 'Risk Detected'}</h3>
                  <p className="text-xs opacity-80 mt-0.5">Confidence: High</p>
                </div>
             </div>
             <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <p className="text-sm leading-relaxed">{result.summary || result.evidence}</p>
             </div>
             {result.issues && result.issues.length > 0 && (
               <div className="space-y-2">
                 <p className="text-xs font-bold uppercase text-gray-400">Issues Found</p>
                 {result.issues.map((issue: string, i: number) => (
                   <div key={i} className="flex gap-2 items-start text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                     <XCircle size={14} className="mt-0.5 flex-shrink-0" />
                     <span>{issue}</span>
                   </div>
                 ))}
               </div>
             )}
             <NeuButton className="w-full" onClick={() => setResult(null)}>Scan Another Document</NeuButton>
          </div>
        ) : pendingFile ? (
          <div className="text-center z-10 space-y-4 animate-in fade-in zoom-in duration-300 p-6 w-full">
              <div className="w-16 h-16 bg-neone-blue/10 rounded-full flex items-center justify-center mx-auto mb-2">
                 <FileCheck size={32} className="text-neone-blue" />
              </div>
              <h3 className="font-bold text-lg">Confirm Analysis</h3>
              <p className="text-sm text-gray-500">Are you sure you want to scan this document?</p>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 max-w-[200px] mx-auto">
                 <p className="text-xs font-medium truncate">{pendingFile.name}</p>
                 <p className="text-[10px] text-gray-400">{(pendingFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div className="flex gap-3 justify-center pt-2">
                 <NeuButton variant="ghost" onClick={() => setPendingFile(null)} className="h-10 px-4">Cancel</NeuButton>
                 <NeuButton onClick={confirmUpload} className="h-10 px-4">Yes, Scan</NeuButton>
              </div>
          </div>
        ) : (
          <div className="text-center z-10">
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg mb-6 mx-auto">
              <Camera size={32} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-8 max-w-[220px] mx-auto leading-relaxed">
              Upload a clear photo or PDF of your {mode} to analyze your rights instantly.
            </p>
            <NeuButton onClick={() => fileInputRef.current?.click()}><Upload className="mr-2" size={18} /> Upload Document</NeuButton>
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileSelect} />
          </div>
        )}
      </div>
    </div>
  );
};

// --- Tracker View ---

const TrackerView = ({ hazards, onAddHazard, inventory, onAddInventory }: { hazards: Hazard[], onAddHazard: (h: Hazard) => void, inventory: InventoryItem[], onAddInventory: (i: InventoryItem) => void }) => {
  const [activeTab, setActiveTab] = useState<'hazards' | 'inventory'>('hazards');
  const [analyzing, setAnalyzing] = useState(false);
  const [addingInventory, setAddingInventory] = useState(false);
  const [invForm, setInvForm] = useState({ room: '', item: '', condition: 'Good', notes: '', photo: '' });
  const fileRef = useRef<HTMLInputElement>(null);
  const invFileRef = useRef<HTMLInputElement>(null);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);

  const handleCaptureHazard = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const res = await analyzeHazard(base64);
      onAddHazard({
        id: Date.now().toString(),
        type: res.type,
        description: res.description,
        severity: res.severity as any,
        dateReported: Date.now(),
        status: 'Reported'
      });
      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCaptureInventory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setInvForm({ ...invForm, photo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const submitInventory = () => {
    if (!invForm.room || !invForm.item) return;
    onAddInventory({
      id: Date.now().toString(),
      room: invForm.room,
      item: invForm.item,
      condition: invForm.condition,
      notes: invForm.notes,
      photos: invForm.photo ? [invForm.photo] : [],
      dateAdded: Date.now()
    });
    setAddingInventory(false);
    setInvForm({ room: '', item: '', condition: 'Good', notes: '', photo: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Property Tracker</h2>
        {activeTab === 'hazards' ? (
          <NeuButton variant="danger" className="h-10 px-4 text-xs" onClick={() => fileRef.current?.click()}>+ Log Hazard</NeuButton>
        ) : (
          <NeuButton className="h-10 px-4 text-xs bg-neone-blue" onClick={() => setAddingInventory(true)}>+ Add Item</NeuButton>
        )}
        <input ref={fileRef} type="file" className="hidden" onChange={handleCaptureHazard} />
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
        <button onClick={() => setActiveTab('hazards')} className={`py-2.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'hazards' ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white' : 'text-gray-400'}`}>
          <AlertTriangle size={14} /> Hazards
        </button>
        <button onClick={() => setActiveTab('inventory')} className={`py-2.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'inventory' ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white' : 'text-gray-400'}`}>
          <Camera size={14} /> Inventory
        </button>
      </div>

      {activeTab === 'hazards' ? (
        <>
          <NeuAlert type="info" title="Awaab's Law Tracking">
            Reported issues trigger a legal 14-day mandatory fix window for landlords.
          </NeuAlert>

          {analyzing && (
            <SoftCard className="flex flex-col items-center gap-3 py-12 justify-center border-neone-red/20 border-2 border-dashed">
               <Loader2 className="animate-spin text-neone-red w-8 h-8" />
               <p className="text-sm font-bold text-gray-600">Analyzing Hazard Severity...</p>
            </SoftCard>
          )}

          <div className="space-y-4">
            {hazards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center opacity-60">
                 <ShieldCheck size={48} className="text-gray-300 mb-4" />
                 <p className="text-sm font-bold text-gray-500">No active hazards.</p>
                 <p className="text-xs text-gray-400 mt-1">Your home environment is safe.</p>
              </div>
            ) : hazards.map(h => (
              <SoftCard key={h.id}>
                 <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${h.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>{h.severity}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Clock size={10} /> {format(h.dateReported, 'dd MMM')}</span>
                 </div>
                 <h3 className="font-bold text-lg mb-2">{h.type}</h3>
                 <p className="text-xs text-gray-500 mb-5 leading-relaxed bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{h.description}</p>
                 <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                       <span>Progress</span>
                       <span>40%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} className="h-full bg-neone-red" />
                    </div>
                 </div>
                 <NeuButton variant="secondary" className="w-full py-2.5 text-xs h-auto" onClick={() => setSelectedHazard(h)}>View Legal Timeline</NeuButton>
              </SoftCard>
            ))}
          </div>

          {typeof document !== 'undefined' && createPortal(
            <AnimatePresence>
              {selectedHazard && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                  onClick={() => setSelectedHazard(null)}
                >
                  <motion.div 
                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[80vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display font-bold text-xl">Legal Timeline</h3>
                      <button onClick={() => setSelectedHazard(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-700 before:to-transparent">
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-gray-900 bg-neone-blue text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <Clock size={16} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-sm text-gray-900 dark:text-white">Hazard Reported</div>
                            <time className="text-[10px] font-medium text-neone-blue">{format(selectedHazard.dateReported, 'dd MMM yyyy')}</time>
                          </div>
                          <div className="text-xs text-gray-500">You logged the hazard: {selectedHazard.type}.</div>
                        </div>
                      </div>
                      
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <AlertTriangle size={16} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm opacity-60">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-sm text-gray-900 dark:text-white">Landlord Response Required</div>
                            <time className="text-[10px] font-medium text-gray-400">Within 14 Days</time>
                          </div>
                          <div className="text-xs text-gray-500">Under Awaab's Law, the landlord must investigate within 14 days.</div>
                        </div>
                      </div>

                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <ShieldCheck size={16} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm opacity-60">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-sm text-gray-900 dark:text-white">Repairs Completed</div>
                            <time className="text-[10px] font-medium text-gray-400">Pending</time>
                          </div>
                          <div className="text-xs text-gray-500">The hazard must be fixed within a reasonable timeframe.</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <NeuButton className="w-full bg-black dark:bg-white text-white dark:text-black" onClick={() => setSelectedHazard(null)}>Close</NeuButton>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </>
      ) : (
        <>
          {addingInventory ? (
            <SoftCard className="space-y-4">
              <h3 className="font-bold text-sm">Add Inventory Item</h3>
              <div className="space-y-3">
                <input type="text" value={invForm.room} onChange={e => setInvForm({...invForm, room: e.target.value})} placeholder="Room (e.g. Kitchen)" className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-neone-blue" />
                <input type="text" value={invForm.item} onChange={e => setInvForm({...invForm, item: e.target.value})} placeholder="Item (e.g. Oven)" className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-neone-blue" />
                <select value={invForm.condition} onChange={e => setInvForm({...invForm, condition: e.target.value})} className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-neone-blue">
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Poor</option>
                  <option>Damaged</option>
                </select>
                <textarea value={invForm.notes} onChange={e => setInvForm({...invForm, notes: e.target.value})} placeholder="Notes (e.g. Scratch on left side)" className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl h-20 focus:ring-2 focus:ring-neone-blue resize-none" />
                
                <div className="flex items-center gap-2">
                  <button onClick={() => invFileRef.current?.click()} className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                    <Camera size={16} /> {invForm.photo ? 'Change Photo' : 'Take Photo'}
                  </button>
                  <input ref={invFileRef} type="file" accept="image/*" className="hidden" onChange={handleCaptureInventory} />
                </div>
                {invForm.photo && (
                  <div className="w-full h-32 rounded-xl overflow-hidden">
                    <img src={invForm.photo} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <NeuButton variant="secondary" className="flex-1" onClick={() => setAddingInventory(false)}>Cancel</NeuButton>
                <NeuButton className="flex-1 bg-neone-blue" onClick={submitInventory}>Save Item</NeuButton>
              </div>
            </SoftCard>
          ) : (
            <div className="space-y-4">
              <NeuAlert type="success" title="Deposit Protection">
                Documenting condition on move-in prevents unfair deductions later.
              </NeuAlert>
              {inventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center opacity-60">
                   <Camera size={48} className="text-gray-300 mb-4" />
                   <p className="text-sm font-bold text-gray-500">No inventory items.</p>
                   <p className="text-xs text-gray-400 mt-1">Start documenting your property.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {inventory.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                      {item.photos[0] ? (
                        <div className="h-24 w-full bg-gray-200 dark:bg-gray-700">
                          <img src={item.photos[0]} alt={item.item} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-24 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Camera size={24} className="text-gray-300" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-[10px] font-bold text-neone-blue uppercase">{item.room}</p>
                        <p className="text-sm font-bold truncate">{item.item}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">{item.condition}</span>
                          <span className="text-[10px] text-gray-400">{format(item.dateAdded, 'MMM dd')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// --- Rights View ---

const RightsView = ({ location }: { location: string }) => {
  const [activeTool, setActiveTool] = useState<'translator' | 'response' | 'dispute' | 'rent'>('translator');
  const [input, setInput] = useState('');
  const [evidence, setEvidence] = useState('');
  const [amount, setAmount] = useState('');
  const [currentRent, setCurrentRent] = useState('');
  const [newRent, setNewRent] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.DIPLOMATIC);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRun = async () => {
    setLoading(true);
    if (activeTool === 'translator') {
      if (!input) { setLoading(false); return; }
      const res = await translateLandlordSpeak(input);
      setResult(res);
    } else if (activeTool === 'response') {
      if (!input) { setLoading(false); return; }
      const res = await generateResponse(tone, input);
      setResult(res);
    } else if (activeTool === 'dispute') {
      if (!input || !amount) { setLoading(false); return; }
      const res = await generateDisputeLetter(input, evidence, Number(amount));
      setResult(res);
    } else if (activeTool === 'rent') {
      if (!currentRent || !newRent) { setLoading(false); return; }
      const res = await analyzeRentIncrease(Number(currentRent), Number(newRent), location);
      setResult(res);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Rights Lab</h2>
      <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-x-auto no-scrollbar">
        <button onClick={() => { setActiveTool('translator'); setResult(null); }} className={`py-2 px-1 text-[9px] font-bold rounded-lg uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 min-w-[70px] ${activeTool === 'translator' ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white' : 'text-gray-400'}`}>
          <MessageSquareQuote size={14} /> Translate
        </button>
        <button onClick={() => { setActiveTool('response'); setResult(null); }} className={`py-2 px-1 text-[9px] font-bold rounded-lg uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 min-w-[70px] ${activeTool === 'response' ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white' : 'text-gray-400'}`}>
          <Send size={14} /> Reply
        </button>
        <button onClick={() => { setActiveTool('dispute'); setResult(null); }} className={`py-2 px-1 text-[9px] font-bold rounded-lg uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 min-w-[70px] ${activeTool === 'dispute' ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white' : 'text-gray-400'}`}>
          <Shield size={14} /> Dispute
        </button>
        <button onClick={() => { setActiveTool('rent'); setResult(null); }} className={`py-2 px-1 text-[9px] font-bold rounded-lg uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 min-w-[70px] ${activeTool === 'rent' ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white' : 'text-gray-400'}`}>
          <TrendingUp size={14} /> Rent
        </button>
      </div>

      <SoftCard>
        {activeTool === 'translator' ? (
          <div className="space-y-5">
             <div className="flex items-center gap-2 text-neone-blue mb-2">
                <MessageSquareQuote size={20} />
                <h3 className="font-bold text-sm text-black dark:text-white">Decode Landlord Speak</h3>
             </div>
             <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder='Paste landlord text here (e.g. "We need to adjust rent due to market forces")' className="w-full p-4 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl h-32 focus:ring-2 focus:ring-neone-blue resize-none placeholder:text-gray-400" />
             <NeuButton className="w-full" onClick={handleRun} isLoading={loading}>Analyze Meaning</NeuButton>
             
             {result && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs space-y-1 border border-blue-100 dark:border-blue-900/30">
                    <p className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2"><Sparkles size={12} /> Real Meaning</p>
                    <p className="text-blue-900 dark:text-blue-100 leading-relaxed">{result.translation}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-xs space-y-1 border border-emerald-100 dark:border-emerald-900/30">
                    <p className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2"><Book size={12} /> Legal Standing</p>
                    <p className="text-emerald-900 dark:text-emerald-100 leading-relaxed">{result.legalStanding}</p>
                  </div>
               </motion.div>
             )}
          </div>
        ) : activeTool === 'response' ? (
          <div className="space-y-5">
             <div className="flex items-center gap-2 text-neone-green mb-2">
                <Send size={20} />
                <h3 className="font-bold text-sm text-black dark:text-white">Draft Professional Reply</h3>
             </div>
             <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe the issue briefly (e.g. 'Boiler broken for 3 days, landlord ignoring calls')" className="w-full p-4 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl h-32 focus:ring-2 focus:ring-neone-green resize-none placeholder:text-gray-400" />
             
             <div>
               <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Select Tone</p>
               <div className="flex gap-2">
                  {([Tone.DIPLOMATIC, Tone.FIRM, Tone.STRICTLY_LEGAL]).map(t => (
                    <button key={t} onClick={() => setTone(t)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all border ${tone === t ? 'bg-black text-white border-black dark:bg-white dark:text-black' : 'bg-transparent border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{t}</button>
                  ))}
               </div>
             </div>

             <NeuButton className="w-full" onClick={handleRun} isLoading={loading}>Generate Draft</NeuButton>
             
             {result && typeof result === 'string' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs leading-relaxed border border-gray-200 dark:border-gray-700 mt-4 relative font-mono text-gray-700 dark:text-gray-300">
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={() => navigator.clipboard.writeText(result)} className="p-1.5 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:scale-105 transition-transform"><Save size={14}/></button>
                  </div>
                  {result}
               </motion.div>
             )}
          </div>
        ) : activeTool === 'dispute' ? (
          <div className="space-y-5">
             <div className="flex items-center gap-2 text-neone-red mb-2">
                <Shield size={20} />
                <h3 className="font-bold text-sm text-black dark:text-white">Deposit Dispute Assistant</h3>
             </div>
             <div className="space-y-3">
               <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Disputed Amount (£)" className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-neone-red placeholder:text-gray-400" />
               <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="What is the landlord claiming? (e.g. 'Charging £200 for cleaning despite it being clean')" className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl h-24 focus:ring-2 focus:ring-neone-red resize-none placeholder:text-gray-400" />
               <textarea value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="What evidence do you have? (e.g. 'Move-out photos, inventory report')" className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl h-24 focus:ring-2 focus:ring-neone-red resize-none placeholder:text-gray-400" />
             </div>
             <NeuButton className="w-full" onClick={handleRun} isLoading={loading}>Build My Case</NeuButton>
             
             {result && result.advice && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-xs space-y-1 border border-red-100 dark:border-red-900/30">
                    <p className="font-bold text-red-700 dark:text-red-300 flex items-center gap-2"><Info size={12} /> TDS Advice</p>
                    <p className="text-red-900 dark:text-red-100 leading-relaxed">{result.advice}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs leading-relaxed border border-gray-200 dark:border-gray-700 relative font-mono text-gray-700 dark:text-gray-300">
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button onClick={() => navigator.clipboard.writeText(result.letter)} className="p-1.5 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:scale-105 transition-transform"><Save size={14}/></button>
                    </div>
                    <p className="font-bold mb-2">Draft Letter:</p>
                    {result.letter}
                  </div>
               </motion.div>
             )}
          </div>
        ) : (
          <div className="space-y-5">
             <div className="flex items-center gap-2 text-purple-500 mb-2">
                <TrendingUp size={20} />
                <h3 className="font-bold text-sm text-black dark:text-white">Rent Increase Analyzer</h3>
             </div>
             <div className="flex gap-3">
               <input type="number" value={currentRent} onChange={(e) => setCurrentRent(e.target.value)} placeholder="Current Rent (£)" className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400" />
               <input type="number" value={newRent} onChange={(e) => setNewRent(e.target.value)} placeholder="Proposed Rent (£)" className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400" />
             </div>
             <NeuButton className="w-full" onClick={handleRun} isLoading={loading}>Analyze Increase</NeuButton>
             
             {result && result.advice && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
                  <div className={`p-4 rounded-xl text-xs space-y-1 border ${result.isFair ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'}`}>
                    <p className={`font-bold flex items-center gap-2 ${result.isFair ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                      {result.isFair ? <CheckCircle size={12} /> : <AlertTriangle size={12} />} 
                      {result.isFair ? 'Seems Fair' : 'Potentially Excessive'}
                    </p>
                    <p className={result.isFair ? 'text-emerald-900 dark:text-emerald-100' : 'text-red-900 dark:text-red-100'}>{result.advice}</p>
                  </div>
                  {result.letter && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs leading-relaxed border border-gray-200 dark:border-gray-700 relative font-mono text-gray-700 dark:text-gray-300">
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button onClick={() => navigator.clipboard.writeText(result.letter)} className="p-1.5 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:scale-105 transition-transform"><Save size={14}/></button>
                      </div>
                      <p className="font-bold mb-2">Draft Letter:</p>
                      {result.letter}
                    </div>
                  )}
               </motion.div>
             )}
          </div>
        )}
      </SoftCard>
    </div>
  );
};

// --- Profile View ---

const ProfileView = ({ 
  user, 
  onLogout, 
  onUpdateProfile,
  darkMode, 
  toggleDarkMode, 
  accessibility, 
  setAccessibility, 
  notifications, 
  setNotifications, 
  privacy, 
  setPrivacy,
  history = [], 
  hazards = [],
  vault = [],
  onAddVault,
  onDeleteHistory,
  recentActivity = [],
  onAskRentShield,
  onEmergencyHelp,
  onToggleEncryption,
  encryptionEnabled
}: any) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [addingVault, setAddingVault] = useState(false);
  const [vaultForm, setVaultForm] = useState({ title: '', category: 'Contract', file: '' });
  const vaultFileRef = useRef<HTMLInputElement>(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [askingAi, setAskingAi] = useState(false);

  const handleAskAi = async (q: string) => {
    setAiQuestion(q);
    setAskingAi(true);
    setAiAnswer('');
    const answer = await onAskRentShield(q);
    setAiAnswer(answer);
    setAskingAi(false);
  };

  const [editForm, setEditForm] = useState<UserProfile>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    age: user?.age || '',
    mobile: user?.mobile || '',
    avatar: user?.avatar || ''
  });

  const score = Math.max(0, 100 - (history.filter((h: any) => h.status === 'risk').length * 15) - (hazards.length * 10));
  
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Safe';
    if (s >= 50) return 'Caution';
    return 'At Risk';
  };

  const handleSaveProfile = () => {
    onUpdateProfile(editForm);
    setIsEditing(false);
  };

  const handleCaptureVault = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setVaultForm({ ...vaultForm, file: reader.result as string, title: file.name });
      setAddingVault(true);
      setActiveSection('vault');
    };
    reader.readAsDataURL(file);
  };

  const submitVault = () => {
    if (!vaultForm.title || !vaultForm.file) return;
    onAddVault({
      id: Date.now().toString(),
      title: vaultForm.title,
      category: vaultForm.category as any,
      fileData: vaultForm.file,
      dateAdded: Date.now()
    });
    setAddingVault(false);
    setVaultForm({ title: '', category: 'Contract', file: '' });
  };

  if (isEditing) {
    return (
      <div className="space-y-6 pb-20 pt-4 px-1">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setIsEditing(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-black dark:text-white">Edit Profile</h2>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden border-4 border-white dark:border-gray-900 shadow-lg">
              {editForm.avatar ? (
                <img src={editForm.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={40} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 bg-neone-blue text-white p-1.5 rounded-full border-2 border-white dark:border-gray-900">
              <Camera size={14} />
            </div>
          </div>
          <input 
            id="avatar-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setEditForm({...editForm, avatar: reader.result as string});
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <p className="text-xs text-gray-400 mt-2">Tap to change photo</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">First Name</label>
            <input 
              type="text" 
              value={editForm.firstName}
              onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
              className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:outline-none focus:border-neone-blue transition-colors text-black dark:text-white"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Last Name</label>
            <input 
              type="text" 
              value={editForm.lastName}
              onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
              className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:outline-none focus:border-neone-blue transition-colors text-black dark:text-white"
              placeholder="Enter last name"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Age</label>
            <input 
              type="number" 
              value={editForm.age}
              onChange={(e) => setEditForm({...editForm, age: e.target.value})}
              className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:outline-none focus:border-neone-blue transition-colors text-black dark:text-white"
              placeholder="Enter age"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Mobile Number</label>
            <input 
              type="tel" 
              value={editForm.mobile}
              onChange={(e) => setEditForm({...editForm, mobile: e.target.value})}
              className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:outline-none focus:border-neone-blue transition-colors text-black dark:text-white"
              placeholder="Enter mobile number"
            />
          </div>
        </div>

        <div className="pt-4">
          <NeuButton onClick={handleSaveProfile} className="w-full h-12 text-sm font-bold">Save Changes</NeuButton>
        </div>
      </div>
    );
  }

  if (activeSection === 'notifications') {
    return (
      <div className="space-y-6 pb-20 pt-4 px-1">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setActiveSection(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-black dark:text-white">Notifications</h2>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-bold text-black dark:text-white">Deadline Alerts</p>
              <p className="text-xs text-gray-500">Get notified about upcoming contract dates</p>
            </div>
            <Toggle checked={notifications.deadlines} onChange={() => setNotifications({...notifications, deadlines: !notifications.deadlines})} />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-bold text-black dark:text-white">Legal Updates</p>
              <p className="text-xs text-gray-500">News about tenant rights changes</p>
            </div>
            <Toggle checked={notifications.legal} onChange={() => setNotifications({...notifications, legal: !notifications.legal})} />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-bold text-black dark:text-white">Market Insights</p>
              <p className="text-xs text-gray-500">Rent trends in your area</p>
            </div>
            <Toggle checked={notifications.market} onChange={() => setNotifications({...notifications, market: !notifications.market})} />
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'privacy') {
    return (
      <div className="space-y-6 pb-20 pt-4 px-1">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setActiveSection(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-black dark:text-white">Privacy & Data</h2>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-bold text-black dark:text-white">Share Anonymous Data</p>
              <p className="text-xs text-gray-500">Help improve RentShield with usage stats</p>
            </div>
            <Toggle checked={privacy.shareData} onChange={() => setPrivacy({...privacy, shareData: !privacy.shareData})} />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-bold text-black dark:text-white">Local Storage Only</p>
              <p className="text-xs text-gray-500">Keep all sensitive data on this device</p>
            </div>
            <Toggle checked={privacy.localOnly} onChange={() => setPrivacy({...privacy, localOnly: !privacy.localOnly})} />
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'accessibility') {
    return (
      <div className="space-y-6 pb-20 pt-4 px-1">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setActiveSection(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-black dark:text-white">Accessibility</h2>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-bold text-black dark:text-white">High Contrast</p>
              <p className="text-xs text-gray-500">Increase contrast for better visibility</p>
            </div>
            <Toggle checked={accessibility.highContrast} onChange={() => setAccessibility({...accessibility, highContrast: !accessibility.highContrast})} />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-bold text-black dark:text-white">Large Text</p>
              <p className="text-xs text-gray-500">Increase font size across the app</p>
            </div>
            <Toggle checked={accessibility.largeText} onChange={() => setAccessibility({...accessibility, largeText: !accessibility.largeText})} />
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'help') {
    return (
      <div className="space-y-6 pb-20 pt-4 px-1">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setActiveSection(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-black dark:text-white">Help & Support</h2>
        </div>
        <div className="space-y-4">
          <SoftCard className="space-y-4">
            <div>
              <h3 className="font-bold text-sm text-black dark:text-white mb-1">External Resources</h3>
              <p className="text-xs text-gray-500 mb-3">Get official advice and support from trusted organizations.</p>
              <div className="space-y-2">
                <a href="https://www.gov.uk/private-renting" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <ExternalLink size={14} /> GOV.UK Private Renting
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </a>
                <a href="https://england.shelter.org.uk/housing_advice/private_renting" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <ExternalLink size={14} /> Shelter England Advice
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </a>
                <a href="https://www.citizensadvice.org.uk/housing/renting-privately/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <ExternalLink size={14} /> Citizens Advice
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </a>
              </div>
            </div>
          </SoftCard>
          
          <SoftCard className="space-y-2">
            <h3 className="font-bold text-sm text-black dark:text-white">Contact Us</h3>
            <p className="text-xs text-gray-500 mb-2">Need help with the RentShield app? Reach out to our support team.</p>
            <a href="mailto:support@rentshield.app" className="block">
              <NeuButton className="w-full text-xs h-10 flex items-center justify-center gap-2">
                <Mail size={14} /> Email Support
              </NeuButton>
            </a>
          </SoftCard>

          <SoftCard className="space-y-2">
            <h3 className="font-bold text-sm text-black dark:text-white">FAQs</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-medium text-left">
                How do I scan a contract? <ChevronRight size={14} className="text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-medium text-left">
                Is my data secure? <ChevronRight size={14} className="text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-medium text-left">
                How to report a hazard? <ChevronRight size={14} className="text-gray-400" />
              </button>
            </div>
          </SoftCard>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col items-center pt-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neone-blue to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
               {user?.avatar ? (
                 <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <User size={40} className="text-gray-400" />
               )}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-gray-900 flex items-center gap-1">
            <ShieldCheck size={10} /> Protected
          </div>
        </div>
        <h2 className="mt-3 text-xl font-display font-bold text-black dark:text-white">{user?.firstName} {user?.lastName}</h2>
        <p className="text-xs text-gray-500 font-medium mb-2">Tenant since 2024</p>
        <NeuButton variant="secondary" onClick={() => setIsEditing(true)} className="h-7 px-3 text-[10px] py-0 min-h-0">Edit Profile</NeuButton>
      </div>

      {/* Score Card */}
      <SoftCard className="relative overflow-hidden border-t-4 border-t-neone-blue">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Shield size={80} />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Protection Score</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-4xl font-display font-bold ${getScoreColor(score)}`}>{score}</span>
                <span className="text-sm font-medium text-gray-500">/ 100</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 ${getScoreColor(score)}`}>
                  {getScoreLabel(score)}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
             <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg text-center">
                <p className="text-lg font-bold text-black dark:text-white">{history.length}</p>
                <p className="text-[10px] text-gray-500">Scans</p>
             </div>
             <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg text-center">
                <p className="text-lg font-bold text-red-500">{history.filter((h: any) => h.status === 'risk').length}</p>
                <p className="text-[10px] text-gray-500">Risks</p>
             </div>
             <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg text-center">
                <p className="text-lg font-bold text-yellow-500">{hazards.length}</p>
                <p className="text-[10px] text-gray-500">Hazards</p>
             </div>
          </div>
        </div>
      </SoftCard>

      {/* My Documents */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white px-1">My Agreements</h3>
        {history.length > 0 ? (
          <div className="space-y-2">
            {history.slice(0, 3).map((item: any) => (
              <SoftCard key={item.id} className="p-3 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.status === 'safe' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                       <FileText size={16} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-black dark:text-white capitalize">{item.type} Analysis</p>
                       <p className="text-[10px] text-gray-500">{format(item.date, 'MMM dd, yyyy')}</p>
                    </div>
                 </div>
                 {item.status === 'safe' ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-red-500" />}
              </SoftCard>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
             <p className="text-xs text-gray-400">No documents analyzed yet.</p>
          </div>
        )}
      </div>

      {/* Document Vault */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Document Vault</h3>
          <button onClick={() => vaultFileRef.current?.click()} className="text-[10px] font-bold text-neone-blue uppercase tracking-wider">+ Add</button>
          <input ref={vaultFileRef} type="file" className="hidden" onChange={handleCaptureVault} />
        </div>
        
        {addingVault ? (
          <SoftCard className="space-y-4">
            <h3 className="font-bold text-sm">Save Document</h3>
            <div className="space-y-3">
              <input type="text" value={vaultForm.title} onChange={e => setVaultForm({...vaultForm, title: e.target.value})} placeholder="Document Title" className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-neone-blue" />
              <select value={vaultForm.category} onChange={e => setVaultForm({...vaultForm, category: e.target.value})} className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-neone-blue">
                <option>Contract</option>
                <option>ID</option>
                <option>Payslip</option>
                <option>Reference</option>
                <option>Other</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <NeuButton variant="secondary" className="flex-1" onClick={() => setAddingVault(false)}>Cancel</NeuButton>
              <NeuButton className="flex-1 bg-neone-blue" onClick={submitVault}>Save to Vault</NeuButton>
            </div>
          </SoftCard>
        ) : (
          <>
            {vault.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                 <p className="text-xs text-gray-400">Vault is empty. Store important documents securely.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {vault.slice(0, 3).map((doc: VaultDocument) => (
                  <SoftCard key={doc.id} className="p-3 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                           <Lock size={16} />
                        </div>
                        <div>
                           <p className="text-xs font-bold text-black dark:text-white">{doc.title}</p>
                           <p className="text-[10px] text-gray-500">{doc.category} • {format(doc.dateAdded, 'MMM dd, yyyy')}</p>
                        </div>
                     </div>
                     <button className="p-2 text-gray-400 hover:text-neone-blue transition-colors">
                       <Download size={16} />
                     </button>
                  </SoftCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white px-1">Recent Activity</h3>
        <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-6 my-2">
           {recentActivity.length > 0 ? recentActivity.slice(0, 5).map((activity: any, i: number) => {
             const Icon = activity.iconName === 'Scan' ? Scan : activity.iconName === 'AlertTriangle' ? AlertTriangle : User;
             return (
             <div key={i} className="relative">
                <div className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-white dark:bg-gray-900 border-2 ${i === 0 ? 'border-neone-blue' : 'border-gray-300 dark:border-gray-700'}`} />
                <div className="flex items-start gap-2">
                   <p className="text-xs font-bold text-black dark:text-white">{activity.title}</p>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">{formatDistanceToNow(activity.time, { addSuffix: true })}</p>
             </div>
           )}) : (
             <p className="text-xs text-gray-500">No recent activity.</p>
           )}
        </div>
      </div>

      {/* Legal Resources */}
      <div className="space-y-3">
         <h3 className="text-sm font-bold text-gray-900 dark:text-white px-1">Tenant Rights & Resources</h3>
         <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Rights Guide', icon: Book, link: 'https://www.gov.uk/private-renting' },
              { title: 'Deposit Rules', icon: Shield, link: 'https://www.gov.uk/tenancy-deposit-protection' },
              { title: 'Eviction Info', icon: LogOut, link: 'https://www.gov.uk/private-renting-evictions' },
              { title: 'Report Issue', icon: Siren, link: 'https://www.gov.uk/government/publications/how-to-rent/how-to-rent-the-checklist-for-renting-in-england' }
            ].map((item, i) => (
              <a href={item.link} target="_blank" rel="noopener noreferrer" key={i} className="p-3 flex flex-col items-center text-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800">
                 <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <item.icon size={16} />
                 </div>
                 <p className="text-[10px] font-bold">{item.title}</p>
              </a>
            ))}
         </div>
      </div>

      {/* AI Assistant */}
      <SoftCard className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none">
         <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-yellow-300" />
            <h3 className="font-bold text-sm">Ask RentShield AI</h3>
         </div>
         <p className="text-xs text-white/80 mb-4">Get instant answers about your tenancy rights and legal questions.</p>
         <div className="space-y-2">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ask a legal question..." 
                className="flex-1 p-2 text-xs bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    handleAskAi(e.currentTarget.value.trim());
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
            {['Is my deposit protected?', 'Can rent increase mid-contract?'].map((q, i) => (
               <button key={i} onClick={() => handleAskAi(q)} className="w-full text-left p-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-medium transition-colors flex items-center justify-between backdrop-blur-sm">
                  {q} <ChevronRight size={12} />
               </button>
            ))}
         </div>
         {aiQuestion && (
           <div className="mt-4 p-3 bg-black/20 rounded-xl text-xs">
             <p className="font-bold mb-1">Q: {aiQuestion}</p>
             {askingAi ? (
               <div className="flex items-center gap-2 text-white/70">
                 <Loader2 size={12} className="animate-spin" /> Thinking...
               </div>
             ) : (
               <p className="text-white/90 whitespace-pre-wrap">{aiAnswer}</p>
             )}
           </div>
         )}
      </SoftCard>

      {/* Plan Status */}
      <SoftCard className="border-neone-green/30">
         <div className="flex justify-between items-start mb-2">
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase">Current Plan</p>
               <h3 className="text-lg font-bold">Free Shield</h3>
            </div>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-bold">Basic</span>
         </div>
         <ul className="space-y-1.5 mb-4">
            {['Unlimited Scans', 'Basic Legal Advice', 'Hazard Logging'].map((feat, i) => (
               <li key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <Check size={12} className="text-neone-green" /> {feat}
               </li>
            ))}
         </ul>
         <NeuButton className="w-full h-10 text-xs bg-black dark:bg-white text-white dark:text-black">Upgrade to Pro</NeuButton>
      </SoftCard>

      {/* Security & Data */}
      <div className="space-y-3">
         <h3 className="text-sm font-bold text-gray-900 dark:text-white px-1">Security & Data</h3>
         <SoftCard className="space-y-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Lock size={18} className={encryptionEnabled ? "text-emerald-500" : "text-gray-400"} />
                  <div>
                     <p className="text-xs font-bold">Data Encryption</p>
                     <p className="text-[10px] text-gray-500">{encryptionEnabled ? "AES-256 Enabled" : "Disabled"}</p>
                  </div>
               </div>
               <button onClick={onToggleEncryption} className={`w-10 h-6 rounded-full transition-colors relative ${encryptionEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                 <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${encryptionEnabled ? 'left-5' : 'left-1'}`} />
               </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
               <button className="p-2 text-[10px] font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center justify-center gap-1">
                  <Download size={12} /> Export Data
               </button>
               <button onClick={onDeleteHistory} className="p-2 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center justify-center gap-1">
                  <Trash2 size={12} /> Delete All
               </button>
            </div>
         </SoftCard>
      </div>

      {/* Emergency Help */}
      <SoftCard className="bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30">
         <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-3">
            <Siren size={18} />
            <h3 className="font-bold text-sm">Emergency Help</h3>
         </div>
         <div className="space-y-2">
            <button onClick={() => onEmergencyHelp('Illegal Eviction')} className="w-full flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
               Illegal Eviction In Progress <ChevronRight size={14} />
            </button>
            <button onClick={() => onEmergencyHelp('Landlord Entering')} className="w-full flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
               Landlord Entering Without Notice <ChevronRight size={14} />
            </button>
         </div>
      </SoftCard>

      {/* Account Settings */}
      <div className="space-y-3">
         <h3 className="text-sm font-bold text-gray-900 dark:text-white px-1">Account Settings</h3>
         <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {[
               { label: 'Notifications', icon: Bell, action: () => setActiveSection('notifications') },
               { label: 'Privacy & Data', icon: ShieldCheck, action: () => setActiveSection('privacy') },
               { label: 'Accessibility', icon: Accessibility, action: () => setActiveSection('accessibility') },
               { label: 'Dark Mode', icon: darkMode ? Moon : Sun, toggle: true, value: darkMode, action: toggleDarkMode },
               { label: 'Help & Support', icon: HelpCircle, action: () => setActiveSection('help') },
               { label: 'Sign Out', icon: LogOut, color: 'text-red-500', action: onLogout }
            ].map((item, i) => (
               <div key={i} onClick={item.action} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                  <div className="flex items-center gap-3">
                     <item.icon size={16} className={item.color || "text-gray-500"} />
                     <span className={`text-xs font-bold ${item.color || "text-gray-900 dark:text-white"}`}>{item.label}</span>
                  </div>
                  {item.toggle ? (
                     <Toggle checked={item.value} onChange={item.action} />
                  ) : (
                     <ChevronRight size={14} className="text-gray-300" />
                  )}
               </div>
            ))}
         </div>
      </div>

      {/* Community Insights */}
      <SoftCard className="bg-gray-900 dark:bg-gray-800 text-white">
         <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-neone-blue" />
            <h3 className="font-bold text-sm">Community Insights</h3>
         </div>
         <div className="space-y-3">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
               <p className="text-[10px] font-bold text-neone-blue mb-1">TRENDING</p>
               <p className="text-xs font-medium">"No Pets" clauses are being flagged 40% more this month in London.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
               <p className="text-[10px] font-bold text-neone-yellow mb-1">TIP</p>
               <p className="text-xs font-medium">Always photograph the meter readings on day one of your tenancy.</p>
            </div>
         </div>
      </SoftCard>
      
      <div className="text-center pt-4 pb-8">
         <p className="text-[10px] text-gray-400">RentShield v2.0.4 • Build 2026.03.15</p>
      </div>
    </div>
  );
};

// --- Onboarding Tour ---

const OnboardingTour = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Scan Contracts",
      description: "Instantly analyze tenancy agreements for illegal clauses and hidden risks.",
      icon: Scan,
      color: "text-neone-blue"
    },
    {
      title: "Log Hazards",
      description: "Document and report maintenance issues with AI-powered evidence logging.",
      icon: AlertTriangle,
      color: "text-neone-red"
    },
    {
      title: "Know Your Rights",
      description: "Access instant legal guidance and protect your deposit.",
      icon: Shield,
      color: "text-neone-green"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-8 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-100 dark:bg-gray-800">
            <motion.div 
              className="h-full bg-neone-blue" 
              initial={{ width: `${((step) / steps.length) * 100}%` }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="mt-8 mb-6 flex justify-center">
            <div className={`w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center ${steps[step].color}`}>
              {React.createElement(steps[step].icon, { size: 48 })}
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold text-black dark:text-white mb-3">
            {steps[step].title}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {steps[step].description}
          </p>

          <NeuButton onClick={handleNext} className="w-full h-12 text-sm font-bold">
            {step === steps.length - 1 ? "Got it" : "Next"}
          </NeuButton>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- Main App Root ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.OVERVIEW);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [accessibility, setAccessibility] = useState(() => JSON.parse(localStorage.getItem('accessibility') || '{"highContrast": false, "largeText": false}'));
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('notifications') || '{"deadlines": true, "legal": true, "market": false}'));
  const [privacy, setPrivacy] = useState(() => JSON.parse(localStorage.getItem('privacy') || '{"shareData": true, "localOnly": false}'));
  const [hazards, setHazards] = useState<Hazard[]>(() => JSON.parse(localStorage.getItem('hazards') || '[]'));
  const [history, setHistory] = useState<ScanHistoryItem[]>(() => JSON.parse(localStorage.getItem('history') || '[]'));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => JSON.parse(localStorage.getItem('inventory') || '[]'));
  const [bills, setBills] = useState<Bill[]>(() => JSON.parse(localStorage.getItem('bills') || '[]'));
  const [vault, setVault] = useState<VaultDocument[]>(() => JSON.parse(localStorage.getItem('vault') || '[]'));
  const [recentActivity, setRecentActivity] = useState<any[]>(() => JSON.parse(localStorage.getItem('recentActivity') || '[]'));
  const [encryptionEnabled, setEncryptionEnabled] = useState(() => localStorage.getItem('encryptionEnabled') !== 'false');
  const [locationName, setLocationName] = useState('Locating...');
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);

  const addActivity = (title: string, iconName: string, color: string) => {
    const newActivity = { id: Date.now().toString(), title, time: Date.now(), iconName, color };
    setRecentActivity(prev => {
      const updated = [newActivity, ...prev].slice(0, 5);
      localStorage.setItem('recentActivity', JSON.stringify(updated));
      return updated;
    });
  };
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => localStorage.getItem('hasSeenOnboarding') === 'true');

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem('rentshield_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    // Apply accessibility classes to root for proper inheritance
    if (accessibility.largeText) document.documentElement.classList.add('large-text');
    else document.documentElement.classList.remove('large-text');
    
    if (accessibility.highContrast) document.documentElement.classList.add('high-contrast');
    else document.documentElement.classList.remove('high-contrast');
  }, [accessibility]);

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('accessibility', JSON.stringify(accessibility));
  }, [accessibility]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('privacy', JSON.stringify(privacy));
  }, [privacy]);

  useEffect(() => {
    localStorage.setItem('hazards', JSON.stringify(hazards));
  }, [hazards]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('vault', JSON.stringify(vault));
  }, [vault]);

  useEffect(() => {
    if (isAuthenticated && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const loc = await identifyLocation(pos.coords.latitude, pos.coords.longitude);
            setLocationName(loc);
          } catch (e) {
            setLocationName("Hackney, London");
          }
        },
        () => setLocationName("London, UK")
      );
    } else if (isAuthenticated) {
      setLocationName("London, UK");
    }
  }, [isAuthenticated]);

  const handleRegister = (newUser: UserProfile) => {
    localStorage.setItem('rentshield_user', JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('rentshield_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <div className={`h-full w-full flex justify-center bg-gray-100 dark:bg-neutral-900 transition-all duration-300`}>
      {!isAuthenticated ? (
        <main className="w-full h-full max-w-md bg-white dark:bg-black shadow-2xl relative overflow-hidden flex flex-col">
          <RegisterView onRegister={handleRegister} />
        </main>
      ) : (
        <main className="w-full h-full max-w-md bg-white dark:bg-black shadow-2xl relative overflow-hidden flex flex-col">
          {!hasSeenOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-6 pb-32">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === AppTab.OVERVIEW && <HomeView location={locationName} setTab={setActiveTab} hazards={hazards} />}
                {activeTab === AppTab.SCAN && <ScannerView onSaveHistory={(item) => { setHistory([item, ...history]); addActivity(`Scanned: ${item.type}`, 'Scan', 'text-neone-blue'); }} history={history} />}
                {activeTab === AppTab.TRACKER && <TrackerView hazards={hazards} onAddHazard={(h) => { setHazards([h, ...hazards]); addActivity(`Hazard: ${h.type}`, 'AlertTriangle', 'text-neone-red'); setActiveTab(AppTab.OVERVIEW); }} inventory={inventory} onAddInventory={(i) => { setInventory([i, ...inventory]); addActivity(`Inventory: ${i.item}`, 'Camera', 'text-neone-green'); }} />}
                {activeTab === AppTab.RIGHTS && <RightsView location={locationName} />}
                {activeTab === AppTab.FINANCE && <FinanceView bills={bills} onAddBill={(b) => setBills([b, ...bills])} onPayBill={(id) => setBills(bills.map(b => b.id === id ? { ...b, status: 'Paid' } : b))} onBack={() => setActiveTab(AppTab.OVERVIEW)} />}
                {activeTab === AppTab.PROFILE && <ProfileView 
                  user={user} 
                  onLogout={handleLogout} 
                  onUpdateProfile={(u: UserProfile) => { setUser(u); localStorage.setItem('rentshield_user', JSON.stringify(u)); addActivity('Profile Updated', 'User', 'text-gray-400'); }} 
                  darkMode={darkMode} 
                  toggleDarkMode={() => setDarkMode(!darkMode)} 
                  accessibility={accessibility} 
                  setAccessibility={setAccessibility} 
                  notifications={notifications} 
                  setNotifications={setNotifications} 
                  privacy={privacy} 
                  setPrivacy={setPrivacy} 
                  history={history} 
                  hazards={hazards} 
                  vault={vault} 
                  onAddVault={(v: VaultDocument) => { setVault([v, ...vault]); addActivity(`Vault: ${v.title}`, 'Lock', 'text-blue-500'); }} 
                  onDeleteHistory={() => { setHistory([]); setHazards([]); setInventory([]); setBills([]); setVault([]); setRecentActivity([]); }} 
                  recentActivity={recentActivity}
                  onAskRentShield={async (q: string) => {
                    const { askQuestion } = await import('./services/geminiService');
                    return await askQuestion(q);
                  }}
                  onEmergencyHelp={(type: string) => {
                    setEmergencyAlert(`Emergency Help Triggered: ${type}\n\nIn a real app, this would contact authorities or legal aid immediately.`);
                  }}
                  onToggleEncryption={() => {
                    setEncryptionEnabled(!encryptionEnabled);
                    localStorage.setItem('encryptionEnabled', String(!encryptionEnabled));
                  }}
                  encryptionEnabled={encryptionEnabled}
                />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation */}
          <div className="absolute bottom-0 left-0 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-50 h-[84px] pb-6 pt-2 px-2 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
            <div className="grid grid-cols-5 h-full items-end">
               <button onClick={() => setActiveTab(AppTab.OVERVIEW)} className="flex flex-col items-center justify-center gap-1 group h-full">
                  <div className={`p-1.5 rounded-xl transition-colors ${activeTab === AppTab.OVERVIEW ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    <HomeIcon size={22} strokeWidth={activeTab === AppTab.OVERVIEW ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-bold ${activeTab === AppTab.OVERVIEW ? 'text-black dark:text-white' : 'text-gray-400'}`}>Home</span>
               </button>
               
               <button onClick={() => setActiveTab(AppTab.TRACKER)} className="flex flex-col items-center justify-center gap-1 group h-full">
                  <div className={`p-1.5 rounded-xl transition-colors ${activeTab === AppTab.TRACKER ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    <AlertTriangle size={22} strokeWidth={activeTab === AppTab.TRACKER ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-bold ${activeTab === AppTab.TRACKER ? 'text-black dark:text-white' : 'text-gray-400'}`}>Hazards</span>
               </button>

               <div className="relative flex justify-center h-full">
                  <button onClick={() => setActiveTab(AppTab.SCAN)} className="absolute -top-6 w-14 h-14 rounded-full bg-neone-blue text-white flex items-center justify-center shadow-lg shadow-neone-blue/40 transition-transform active:scale-95 border-4 border-white dark:border-black">
                    <Scan size={24} strokeWidth={2.5} />
                  </button>
                  <span className={`absolute bottom-0 text-[10px] font-bold ${activeTab === AppTab.SCAN ? 'text-neone-blue' : 'text-gray-400'}`}>Scan</span>
               </div>

               <button onClick={() => setActiveTab(AppTab.RIGHTS)} className="flex flex-col items-center justify-center gap-1 group h-full">
                  <div className={`p-1.5 rounded-xl transition-colors ${activeTab === AppTab.RIGHTS ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    <FileText size={22} strokeWidth={activeTab === AppTab.RIGHTS ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-bold ${activeTab === AppTab.RIGHTS ? 'text-black dark:text-white' : 'text-gray-400'}`}>Rights</span>
               </button>

               <button onClick={() => setActiveTab(AppTab.PROFILE)} className="flex flex-col items-center justify-center gap-1 group h-full">
                  <div className={`p-1.5 rounded-xl transition-colors ${activeTab === AppTab.PROFILE ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    <User size={22} strokeWidth={activeTab === AppTab.PROFILE ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-bold ${activeTab === AppTab.PROFILE ? 'text-black dark:text-white' : 'text-gray-400'}`}>Profile</span>
               </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}