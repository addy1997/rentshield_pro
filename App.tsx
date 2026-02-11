import React, { useState, useEffect, useRef } from 'react';
import { Shield, Scan, AlertTriangle, FileText, MapPin, Camera, Upload, CheckCircle, XCircle, Siren, Send, Clock, Home as HomeIcon, Loader2, Fingerprint, ChevronLeft, Lock, Thermometer, ExternalLink, Calculator, User, Settings, LogOut, Bell, Info, RefreshCw, Moon, Sun, Star, History, ThumbsUp, TrendingUp, MessageSquare, ArrowRight, Link as LinkIcon, Calendar, Trash2, Save, Eye, EyeOff, Smartphone, Ghost, Activity, FileLock, ChevronRight, AlertCircle, Sparkles, Download, FileCheck, Accessibility, HelpCircle, ShieldCheck, Book, Type as TypeIcon, Mail, MessageSquareQuote, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeContract, analyzeHazard, detectBiddingWar, generateResponse, analyzeEPC, analyzeRentIncrease, translateLandlordSpeak, identifyLocation } from './services/geminiService';
import { NeuButton, SoftCard, NeuAlert, TooltipIcon } from './components/ui';
import { AppTab, Hazard, Tone, ScanHistoryItem } from './types';
import { format, addDays, differenceInDays } from 'date-fns';

// --- Shared Components ---

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex-shrink-0 ${checked ? 'bg-neone-green' : 'bg-gray-200 dark:bg-gray-700'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const AnimatedLogo = () => (
  <motion.div 
    className="flex items-center gap-2 cursor-pointer group select-none"
    whileHover={{ scale: 1.02 }}
  >
    <div className="w-9 h-9 bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/5 dark:shadow-white/5">
      <Shield className="w-5 h-5 text-white dark:text-black" />
    </div>
    <h1 className="font-display text-xl font-bold text-black dark:text-white tracking-tight">
      Rent<span className="text-neone-blue">Shield</span>
    </h1>
  </motion.div>
);

// --- Login & Onboarding Views ---

const LoginView = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="h-full bg-white dark:bg-black flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,209,255,0.1),transparent_50%)]" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xs w-full space-y-10 relative z-10"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="w-24 h-24 bg-black dark:bg-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-neone-blue/20">
            <Shield size={48} className="text-white dark:text-black" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold tracking-tight">Rent<span className="text-neone-blue">Shield</span></h1>
            <p className="text-gray-500 font-medium">Your AI Legal Guardian</p>
          </div>
        </div>
        <div className="space-y-4">
          <NeuButton className="w-full py-4 text-lg" onClick={onLogin}>Access My Rights</NeuButton>
          <div className="flex items-center justify-center gap-2 text-gray-400">
             <Fingerprint size={16} />
             <p className="text-[10px] font-bold uppercase tracking-widest">Biometric Security Active</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Home View ---

const HomeView = ({ location, setTab, hazards }: { location: string, setTab: (t: AppTab) => void, hazards: Hazard[] }) => (
  <div className="space-y-6 pb-4">
    <header className="flex justify-between items-center pt-2">
      <AnimatedLogo />
      <div className="flex flex-col items-end">
         <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Current Area</div>
         <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-3 py-1.5 rounded-full text-xs font-bold text-black dark:text-white shadow-sm">
           <MapPin size={12} className="text-neone-blue" />
           {location}
         </div>
      </div>
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
          <p className="font-bold text-lg mb-1">AI Scanner</p>
          <p className="text-xs text-gray-500 leading-snug">Analyze Contracts, Bidding Wars & EPCs</p>
        </div>
      </SoftCard>
      <SoftCard onClick={() => setTab(AppTab.TRACKER)} className="p-5 cursor-pointer hover:ring-2 hover:ring-neone-red/50 transition-all group h-44 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-neone-red/5 rounded-full" />
        <AlertTriangle size={32} className="text-neone-red group-hover:scale-110 transition-transform duration-300" />
        <div>
          <p className="font-bold text-lg mb-1">Hazard Log</p>
          <p className="text-xs text-gray-500 leading-snug">Track Issues under Awaab's Law</p>
        </div>
      </SoftCard>
    </div>
  </div>
);

// --- Scanner View ---

const ScannerView = ({ onSaveHistory, history }: { onSaveHistory: (item: ScanHistoryItem) => void, history: ScanHistoryItem[] }) => {
  const [mode, setMode] = useState<'contract' | 'bidding' | 'epc'>('contract');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    setResult(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      let res;
      if (mode === 'contract') res = await analyzeContract(base64);
      else if (mode === 'bidding') res = await detectBiddingWar(base64);
      else res = await analyzeEPC(base64);
      
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
          <button key={m} onClick={() => { setMode(m); setResult(null); }} className={`py-2.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center ${mode === m ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
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
        ) : (
          <div className="text-center z-10">
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg mb-6 mx-auto">
              <Camera size={32} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-8 max-w-[220px] mx-auto leading-relaxed">
              Upload a clear photo of your {mode} to analyze your rights instantly.
            </p>
            <NeuButton onClick={() => fileInputRef.current?.click()}><Upload className="mr-2" size={18} /> Upload Image</NeuButton>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
          </div>
        )}
      </div>
    </div>
  );
};

// --- Tracker View ---

const TrackerView = ({ hazards, onAdd }: { hazards: Hazard[], onAdd: (h: Hazard) => void }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const res = await analyzeHazard(base64);
      onAdd({
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Hazard Tracker</h2>
        <NeuButton variant="danger" className="h-10 px-4 text-xs" onClick={() => fileRef.current?.click()}>+ Log Hazard</NeuButton>
        <input ref={fileRef} type="file" className="hidden" onChange={handleCapture} />
      </div>

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
             <NeuButton variant="secondary" className="w-full py-2.5 text-xs h-auto">View Legal Timeline</NeuButton>
          </SoftCard>
        ))}
      </div>
    </div>
  );
};

// --- Rights View ---

const RightsView = () => {
  const [activeTool, setActiveTool] = useState<'translator' | 'response'>('translator');
  const [input, setInput] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.DIPLOMATIC);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRun = async () => {
    if (!input) return;
    setLoading(true);
    if (activeTool === 'translator') {
      const res = await translateLandlordSpeak(input);
      setResult(res);
    } else {
      const res = await generateResponse(tone, input);
      setResult(res);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Rights Lab</h2>
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
        <button onClick={() => { setActiveTool('translator'); setResult(null); }} className={`py-2.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTool === 'translator' ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white' : 'text-gray-400'}`}>
          <MessageSquareQuote size={14} /> Translator
        </button>
        <button onClick={() => { setActiveTool('response'); setResult(null); }} className={`py-2.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTool === 'response' ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white' : 'text-gray-400'}`}>
          <Send size={14} /> Response Gen
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
        ) : (
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
        )}
      </SoftCard>
    </div>
  );
};

// --- Profile View ---

const ProfileView = ({ onLogout, darkMode, toggleDarkMode, accessibility, setAccessibility, notifications, setNotifications, privacy, setPrivacy }: any) => {
  const [section, setSection] = useState<'main' | 'notifications' | 'privacy' | 'accessibility' | 'help' | 'feedback'>('main');

  const ProfileRow = ({ icon: Icon, label, subLabel, onClick, color = "text-gray-500", rightElement, href }: any) => {
    const content = (
      <>
         <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-800 ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-black dark:text-white">{label}</p>
              {subLabel && <p className="text-[10px] font-medium text-gray-400 mt-0.5">{subLabel}</p>}
            </div>
         </div>
         {rightElement || <ChevronRight size={16} className="text-gray-300" />}
      </>
    );

    if (href) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={`block bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between`}>
          {content}
        </a>
      );
    }

    return (
      <SoftCard className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={onClick}>
         {content}
      </SoftCard>
    );
  };

  const renderMain = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-20 h-20 bg-gradient-to-tr from-neone-blue/20 to-purple-500/20 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-xl">
          <User className="text-black dark:text-white" size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold">Adwait</h2>
          <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
             <MapPin size={10} />
             Hackney, London
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-wider">
             <ShieldCheck size={10} /> Tenant Protected
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <ProfileRow icon={Bell} color="text-neone-blue" label="Notifications" subLabel="Alerts & Updates" onClick={() => setSection('notifications')} />
        <ProfileRow icon={ShieldCheck} color="text-neone-green" label="Privacy & Data" subLabel="Manage your data" onClick={() => setSection('privacy')} />
        <ProfileRow icon={Accessibility} color="text-neone-yellow" label="Accessibility" subLabel="Display settings" onClick={() => setSection('accessibility')} />
        <ProfileRow icon={HelpCircle} color="text-purple-500" label="Help & Support" subLabel="Guides & FAQs" onClick={() => setSection('help')} />
        <ProfileRow icon={MessageSquare} color="text-orange-500" label="Feedback" subLabel="Suggest features" onClick={() => setSection('feedback')} />
        
        <ProfileRow 
          icon={darkMode ? Moon : Sun} 
          label="Dark Mode" 
          subLabel={darkMode ? "Dark theme active" : "Light theme active"}
          onClick={toggleDarkMode}
          rightElement={<Toggle checked={darkMode} onChange={toggleDarkMode} />}
        />
        
        <div className="pt-4">
          <NeuButton variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 justify-start px-4" onClick={onLogout}>
            <LogOut size={18} className="mr-2" /> Sign Out
          </NeuButton>
        </div>
      </div>
    </div>
  );

  const toggleNotification = (key: keyof typeof notifications) => {
    const newState = !notifications[key];
    setNotifications({...notifications, [key]: newState});
    if (newState && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification("RentShield 2026", { body: `${String(key)} alerts enabled!` });
        }
      });
    }
  };

  return (
    <div>
       <AnimatePresence mode="wait">
          {section === 'main' ? (
            <motion.div key="main" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {renderMain()}
            </motion.div>
          ) : (
            <motion.div key="sub" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
               <button onClick={() => setSection('main')} className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white mb-6 transition-colors">
                 <ChevronLeft size={16} /> BACK TO PROFILE
               </button>
               <h3 className="text-2xl font-display font-bold mb-6 capitalize">{section}</h3>
               
               <div className="space-y-3">
               {section === 'notifications' && (
                  <>
                     <ProfileRow icon={Clock} label="Hazard Deadlines" subLabel="Fix window expiration alerts" rightElement={<Toggle checked={notifications.deadlines} onChange={() => toggleNotification('deadlines')} />} />
                     <ProfileRow icon={Book} label="Legal Updates" subLabel="New Renters' Rights news" rightElement={<Toggle checked={notifications.legal} onChange={() => toggleNotification('legal')} />} />
                     <ProfileRow icon={TrendingUp} label="Market Alerts" subLabel="Local rent trend warnings" rightElement={<Toggle checked={notifications.market} onChange={() => toggleNotification('market')} />} />
                  </>
               )}

               {section === 'privacy' && (
                  <>
                     <ProfileRow icon={Activity} label="Share Anonymized Data" subLabel="Help improve the AI models" rightElement={<Toggle checked={privacy.shareData} onChange={(v) => setPrivacy({...privacy, shareData: v})} />} />
                     <ProfileRow icon={Save} label="Local Only Storage" subLabel="Keep data on device only" rightElement={<Toggle checked={privacy.localOnly} onChange={(v) => setPrivacy({...privacy, localOnly: v})} />} />
                     <div className="pt-4">
                       <NeuButton variant="danger" className="w-full justify-start"><Trash2 size={18} /> Delete All History</NeuButton>
                     </div>
                  </>
               )}

               {section === 'accessibility' && (
                  <>
                     <ProfileRow icon={Eye} label="High Contrast" subLabel="Increase visual distinction" rightElement={<Toggle checked={accessibility.highContrast} onChange={(v) => setAccessibility({...accessibility, highContrast: v})} />} />
                     <ProfileRow icon={TypeIcon} label="Large Text" subLabel="Increase font readability" rightElement={<Toggle checked={accessibility.largeText} onChange={(v) => setAccessibility({...accessibility, largeText: v})} />} />
                  </>
               )}

               {section === 'help' && (
                  <>
                     <ProfileRow icon={Book} label="Government Guide" subLabel="Official Private Renting Info" href="https://www.gov.uk/private-renting" />
                     <ProfileRow icon={Smartphone} label="Legal Directory" subLabel="Citizens Advice Housing" href="https://www.citizensadvice.org.uk/housing/" />
                     <ProfileRow icon={Mail} label="Contact Support" subLabel="support@rentshield.ai" href="mailto:support@rentshield.ai" />
                  </>
               )}

               {section === 'feedback' && (
                  <div className="space-y-4">
                     <textarea placeholder="Tell us how we can help you better..." className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl h-40 text-sm focus:ring-2 focus:ring-neone-blue transition-all resize-none" />
                     <NeuButton className="w-full">Send Feedback</NeuButton>
                  </div>
               )}
               </div>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};

// --- Main App Root ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.OVERVIEW);
  const [darkMode, setDarkMode] = useState(false);
  const [accessibility, setAccessibility] = useState({ highContrast: false, largeText: false });
  const [notifications, setNotifications] = useState({ deadlines: true, legal: true, market: false });
  const [privacy, setPrivacy] = useState({ shareData: true, localOnly: false });
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [locationName, setLocationName] = useState('Locating...');

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

  return (
    <div className={`h-full w-full flex justify-center bg-gray-100 dark:bg-neutral-900 transition-all duration-300`}>
      {!isAuthenticated ? (
        <main className="w-full h-full max-w-md bg-white dark:bg-black shadow-2xl relative overflow-hidden flex flex-col">
          <LoginView onLogin={() => setIsAuthenticated(true)} />
        </main>
      ) : (
        <main className="w-full h-full max-w-md bg-white dark:bg-black shadow-2xl relative overflow-hidden flex flex-col">
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
                {activeTab === AppTab.SCAN && <ScannerView onSaveHistory={(item) => setHistory([item, ...history])} history={history} />}
                {activeTab === AppTab.TRACKER && <TrackerView hazards={hazards} onAdd={(h) => { setHazards([h, ...hazards]); setActiveTab(AppTab.OVERVIEW); }} />}
                {activeTab === AppTab.RIGHTS && <RightsView />}
                {activeTab === AppTab.PROFILE && <ProfileView onLogout={() => setIsAuthenticated(false)} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} accessibility={accessibility} setAccessibility={setAccessibility} notifications={notifications} setNotifications={setNotifications} privacy={privacy} setPrivacy={setPrivacy} />}
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
               
               <button onClick={() => setActiveTab(AppTab.SCAN)} className="flex flex-col items-center justify-center gap-1 group h-full">
                  <div className={`p-1.5 rounded-xl transition-colors ${activeTab === AppTab.SCAN ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    <Scan size={22} strokeWidth={activeTab === AppTab.SCAN ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-bold ${activeTab === AppTab.SCAN ? 'text-black dark:text-white' : 'text-gray-400'}`}>Scan</span>
               </button>

               <div className="relative flex justify-center h-full">
                  <button onClick={() => setActiveTab(AppTab.TRACKER)} className="absolute -top-6 w-14 h-14 rounded-full bg-neone-red text-white flex items-center justify-center shadow-lg shadow-neone-red/40 transition-transform active:scale-95 border-4 border-white dark:border-black">
                    <AlertTriangle size={24} fill="currentColor" strokeWidth={0} />
                  </button>
                  <span className={`absolute bottom-0 text-[10px] font-bold ${activeTab === AppTab.TRACKER ? 'text-neone-red' : 'text-gray-400'}`}>Hazards</span>
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