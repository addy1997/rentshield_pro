import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, XCircle, Loader2, Activity, AlertCircle, FileCheck } from 'lucide-react';
import { NeuButton } from '../components/ui';
import { ScanHistoryItem } from '../types';
import { useAppContext } from '../context/AppContext';
import { analyzeContract, detectBiddingWar, analyzeEPC } from '../services/geminiService';

export default function ScannerView() {
  const { state, dispatch } = useAppContext();
  const history = state.data.history;

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

      const historyItem: ScanHistoryItem = {
        id: Date.now().toString(),
        date: Date.now(),
        type: mode,
        summary: res.summary || res.evidence || "Analysis complete",
        status: (res.isSafe || !res.isIllegal || res.compliance) ? 'safe' : 'risk'
      };
      dispatch({ type: 'ADD_HISTORY', payload: historyItem });
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          id: Date.now().toString(),
          title: `Scanned: ${mode}`,
          time: Date.now(),
          iconName: 'Scan',
          color: 'text-neone-blue'
        }
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
}
