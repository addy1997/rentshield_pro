import React, { Suspense, useEffect, useMemo } from 'react';
import { Shield, Scan, AlertTriangle, FileText, Lock, Home as HomeIcon, User, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuButton } from './components/ui';
import { TabSkeleton } from './components/TabSkeleton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppProvider, useAppContext, type UserProfile } from './context/AppContext';
import { AppTab } from './types';
import { identifyLocation } from './services/geminiService';
import { useState } from 'react';

// --- Lazy Views ---
const HomeView = React.lazy(() => import('./views/HomeView'));
const ScannerView = React.lazy(() => import('./views/ScannerView'));
const TrackerView = React.lazy(() => import('./views/TrackerView'));
const RightsView = React.lazy(() => import('./views/RightsView'));
const FinanceView = React.lazy(() => import('./views/FinanceView'));
const ProfileView = React.lazy(() => import('./views/ProfileView'));
const OnboardingTour = React.lazy(() => import('./views/OnboardingTour'));

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
              onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-neone-blue outline-none transition-all placeholder:text-gray-400 font-medium text-sm"
            />
            <input
              type="text"
              placeholder="Last Name"
              required
              value={formData.lastName}
              onChange={e => setFormData({ ...formData, lastName: e.target.value })}
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
            onChange={e => setFormData({ ...formData, age: e.target.value })}
            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-neone-blue outline-none transition-all placeholder:text-gray-400 font-medium text-sm"
          />
          <input
            type="tel"
            placeholder="Mobile Number"
            required
            value={formData.mobile}
            onChange={e => setFormData({ ...formData, mobile: e.target.value })}
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

// --- Nav Item ---

const NavItem = ({
  tab,
  icon: Icon,
  label,
  badge,
}: {
  tab: AppTab;
  icon: React.ElementType;
  label: string;
  badge?: boolean;
}) => {
  const { state, dispatch } = useAppContext();
  const isActive = state.session.activeTab === tab;
  return (
    <button
      onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })}
      aria-label={`${label} tab`}
      aria-current={isActive ? 'page' : undefined}
      className="flex flex-col items-center justify-center gap-1 group h-full relative"
    >
      <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        {badge && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-neone-red rounded-full" />
        )}
      </div>
      <span className={`text-[10px] font-bold ${isActive ? 'text-black dark:text-white' : 'text-gray-400'}`}>{label}</span>
    </button>
  );
};

// --- Main Authenticated App ---

const AuthenticatedApp = () => {
  const { state, dispatch } = useAppContext();
  const { activeTab, hasSeenOnboarding, locationName } = state.session;
  const unresolvedHazards = useMemo(
    () => state.data.hazards.filter(h => h.status !== 'Resolved').length,
    [state.data.hazards]
  );

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const loc = await identifyLocation(pos.coords.latitude, pos.coords.longitude);
            dispatch({ type: 'SET_LOCATION', payload: loc });
          } catch {
            dispatch({ type: 'SET_LOCATION', payload: 'Hackney, London' });
          }
        },
        () => dispatch({ type: 'SET_LOCATION', payload: 'London, UK' })
      );
    } else {
      dispatch({ type: 'SET_LOCATION', payload: 'London, UK' });
    }
  }, [dispatch]);

  return (
    <main className="w-full h-full max-w-md bg-white dark:bg-black shadow-2xl relative overflow-hidden flex flex-col">
      {!hasSeenOnboarding && (
        <Suspense fallback={null}>
          <OnboardingTour />
        </Suspense>
      )}

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
            <ErrorBoundary>
              <Suspense fallback={<TabSkeleton />}>
                {activeTab === AppTab.OVERVIEW && <HomeView />}
                {activeTab === AppTab.SCAN && <ScannerView />}
                {activeTab === AppTab.TRACKER && <TrackerView />}
                {activeTab === AppTab.RIGHTS && <RightsView />}
                {activeTab === AppTab.FINANCE && <FinanceView />}
                {activeTab === AppTab.PROFILE && <ProfileView />}
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation — 6 tabs with Finance */}
      <div className="absolute bottom-0 left-0 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-50 h-[84px] pb-6 pt-2 px-2 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-6 h-full items-end">
          <NavItem tab={AppTab.OVERVIEW} icon={HomeIcon} label="Home" />
          <NavItem tab={AppTab.TRACKER} icon={AlertTriangle} label="Hazards" badge={unresolvedHazards > 0} />

          {/* Scan — centre floating button */}
          <div className="relative flex justify-center h-full">
            <button
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: AppTab.SCAN })}
              aria-label="Scan tab"
              aria-current={activeTab === AppTab.SCAN ? 'page' : undefined}
              className="absolute -top-6 w-14 h-14 rounded-full bg-neone-blue text-white flex items-center justify-center shadow-lg shadow-neone-blue/40 transition-transform active:scale-95 border-4 border-white dark:border-black"
            >
              <Scan size={24} strokeWidth={2.5} />
            </button>
            <span className={`absolute bottom-0 text-[10px] font-bold ${activeTab === AppTab.SCAN ? 'text-neone-blue' : 'text-gray-400'}`}>Scan</span>
          </div>

          <NavItem tab={AppTab.RIGHTS} icon={FileText} label="Rights" />
          <NavItem tab={AppTab.FINANCE} icon={TrendingUp} label="Finance" />
          <NavItem tab={AppTab.PROFILE} icon={User} label="Profile" />
        </div>
      </div>
    </main>
  );
};

// --- Root App ---

const AppInner = () => {
  const { state, dispatch } = useAppContext();
  const { isAuthenticated } = state.session;

  const handleRegister = (newUser: UserProfile) => {
    dispatch({ type: 'SET_USER', payload: newUser });
    dispatch({ type: 'SET_AUTHENTICATED', payload: true });
  };

  return (
    <div className="h-full w-full flex justify-center bg-gray-100 dark:bg-neutral-900 transition-all duration-300">
      {!isAuthenticated ? (
        <main className="w-full h-full max-w-md bg-white dark:bg-black shadow-2xl relative overflow-hidden flex flex-col">
          <RegisterView onRegister={handleRegister} />
        </main>
      ) : (
        <AuthenticatedApp />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
