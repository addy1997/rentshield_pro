import React from 'react';
import { Shield, Scan, AlertTriangle, MapPin, ChevronRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { SoftCard, NeuAlert, TooltipIcon } from '../components/ui';
import { AppTab } from '../types';
import { useAppContext } from '../context/AppContext';
import { format, differenceInDays } from 'date-fns';

// --- Animated Logo ---

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

// --- Home View ---

export default function HomeView() {
  const { state, dispatch } = useAppContext();
  const location = state.session.locationName;
  const hazards = state.data.hazards;

  const setTab = (t: AppTab) => dispatch({ type: 'SET_ACTIVE_TAB', payload: t });

  return (
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
      <div className="mt-8 space-y-3">
        <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider px-1">Community Hazard Heatmap</h3>
        <SoftCard className="p-4 relative overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,50,50,0.8) 0%, transparent 40%), radial-gradient(circle at 70% 30%, rgba(255,150,0,0.6) 0%, transparent 30%), radial-gradient(circle at 60% 80%, rgba(0,200,255,0.4) 0%, transparent 40%)', filter: 'blur(10px)' }} />
          <div className="relative z-10 space-y-4">
             <div className="flex items-center justify-between">
                <p className="font-bold text-sm">Local Hotspots in {location}</p>
                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold uppercase">High Alert</span>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2"><MapPin size={12} className="text-neone-red" /> Black Mould Reports</span>
                   <span className="font-bold">24 this week</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2"><MapPin size={12} className="text-neone-yellow" /> Structural Leaks</span>
                   <span className="font-bold">12 this week</span>
                </div>
             </div>
             <p className="text-[10px] text-gray-500 italic mt-2 text-center">Data anonymized from RentShield community reports.</p>
          </div>
        </SoftCard>
      </div>
      </div>
    </div>
  );
}
