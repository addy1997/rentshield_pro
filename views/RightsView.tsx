import React, { useState } from 'react';
import { Shield, Send, TrendingUp, CheckCircle, AlertTriangle, Sparkles, Book, Info, Save, MessageSquareQuote } from 'lucide-react';
import { motion } from 'framer-motion';
import { NeuButton, SoftCard } from '../components/ui';
import { Tone } from '../types';
import { useAppContext } from '../context/AppContext';
import { translateLandlordSpeak, generateResponse, generateDisputeLetter, analyzeRentIncrease } from '../services/geminiService';

export default function RightsView() {
  const { state } = useAppContext();
  const location = state.session.locationName;

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
}
