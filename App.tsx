import React, { Suspense, useEffect, useMemo } from 'react';
import { Shield, Scan, AlertTriangle, FileText, Lock, Home as HomeIcon, User, TrendingUp, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuButton } from './components/ui';
import { TabSkeleton } from './components/TabSkeleton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AnimatedLondonMap } from './components/LondonMap';
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

const InputField = ({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string, error?: string }) => (
  <div className="w-full flex flex-col gap-1.5 text-left">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
    <div className="relative">
      <input
        {...props}
        className={`w-full p-3.5 bg-gray-50 dark:bg-gray-800/50 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-neone-blue'} rounded-xl focus:ring-2 outline-none transition-all placeholder:text-gray-400 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700/50 ${props.className || ''}`}
      />
    </div>
    {error && <p className="text-xs text-red-500 ml-1 mt-0.5">{error}</p>}
  </div>
);

const PasswordStrengthMeter = ({ strength }: { strength: number }) => {
  return (
    <div className="flex flex-col gap-1 w-full mt-2 px-1">
      <div className="flex gap-1 h-1 w-full">
        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength >= 1 ? (strength === 1 ? 'bg-neone-red' : strength === 2 ? 'bg-neone-yellow' : 'bg-neone-green') : 'bg-gray-200 dark:bg-gray-700'}`} />
        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength >= 2 ? (strength === 2 ? 'bg-neone-yellow' : 'bg-neone-green') : 'bg-gray-200 dark:bg-gray-700'}`} />
        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength >= 3 ? 'bg-neone-green' : 'bg-gray-200 dark:bg-gray-700'}`} />
      </div>
      <p className="text-[10px] text-right font-bold tracking-wide">
        {strength === 0 && <span className="text-gray-400">Enter password</span>}
        {strength === 1 && <span className="text-neone-red">Weak</span>}
        {strength === 2 && <span className="text-neone-yellow">Medium</span>}
        {strength === 3 && <span className="text-neone-green">Strong</span>}
      </p>
    </div>
  );
};

const getPasswordStrength = (password: string) => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) && password.length >= 8) score += 1;
  if (score === 0 && password.length > 0) return 1;
  return score;
};

const RegisterView = ({ onRegister }: { onRegister: (user: UserProfile) => void }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Real-time validation checks
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || '');
  const isMobileValid = (formData.mobile || '').length >= 10;
  const isAgeValid = parseInt(formData.age || '0') >= 18;
  const isNameValid = (formData.firstName || '').length > 0 && (formData.lastName || '').length > 0;
  const passwordStrength = getPasswordStrength(formData.password || '');
  const isPasswordValid = passwordStrength >= 2;
  const passwordsMatch = formData.password === formData.confirmPassword;
  
  const showPasswordError = formData.confirmPassword.length > 0 && !passwordsMatch;

  const isFormValid = isEmailValid && isMobileValid && isAgeValid && isNameValid && isPasswordValid && passwordsMatch && formData.acceptTerms;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onRegister(formData as UserProfile);
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-start p-4 sm:p-6 text-center relative overflow-y-auto no-scrollbar pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 mt-6"
      >
        <div className="flex flex-col items-center gap-2 mb-8">
          <Shield size={42} className="text-neone-blue mb-1" strokeWidth={1.5} />
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Fill your information to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <InputField
              label="First Name"
              type="text"
              placeholder="John"
              required
              value={formData.firstName}
              onChange={e => setFormData({ ...formData, firstName: e.target.value })}
            />
            <InputField
              label="Last Name"
              type="text"
              placeholder="Doe"
              required
              value={formData.lastName}
              onChange={e => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
          
          <InputField
            label="Email Address"
            type="email"
            placeholder="example@email.com"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            error={formData.email && !isEmailValid ? 'Please enter a valid email' : undefined}
          />

          <div className="space-y-1.5 w-full flex flex-col items-start text-left">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Password</label>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3.5 pr-12 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-neone-blue rounded-xl outline-none transition-all text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <PasswordStrengthMeter strength={passwordStrength} />
          </div>

          <div className="space-y-1.5 w-full flex flex-col items-start text-left">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Confirm Password</label>
            <div className="relative w-full">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full p-3.5 pr-12 bg-gray-50 dark:bg-gray-800/50 border ${showPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-neone-blue'} rounded-xl focus:ring-2 outline-none transition-all text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700/50`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {showPasswordError && <p className="text-xs text-red-500 ml-1 mt-0.5">Passwords do not match</p>}
          </div>
          
          <div className="flex gap-4 pt-1">
            <InputField
              label="Age"
              type="number"
              placeholder="18"
              required
              min="18"
              max="120"
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: e.target.value })}
              error={formData.age && !isAgeValid ? 'Must be 18+' : undefined}
            />
            <InputField
              label="Mobile Number"
              type="tel"
              placeholder="+1 234 567 890"
              required
              value={formData.mobile}
              onChange={e => setFormData({ ...formData, mobile: e.target.value })}
              error={formData.mobile && !isMobileValid ? 'Invalid mobile' : undefined}
            />
          </div>

          <div className="flex items-center gap-3 pt-4 pb-2">
            <input
              type="checkbox"
              id="terms"
              checked={formData.acceptTerms}
              onChange={e => setFormData({ ...formData, acceptTerms: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-neone-blue focus:ring-neone-blue transition-all cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400 font-medium cursor-pointer text-left">
              I agree with the <span className="text-neone-blue hover:underline">Terms of use</span> and <span className="text-neone-blue hover:underline">Privacy Policy</span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={!isFormValid}
            className={`w-full py-4 bg-neone-blue text-white rounded-[1rem] text-sm font-bold transition-all shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] ${!isFormValid ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
          >
            Sign up
          </button>
        </form>
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
    <main className="w-full h-full max-w-md bg-white/70 dark:bg-gray-900/60 backdrop-blur-2xl shadow-glass relative overflow-hidden flex flex-col border-x border-white/20 dark:border-white/10">
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
      <div className="absolute bottom-0 left-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-white/40 dark:border-white/10 z-50 h-[84px] pb-6 pt-2 px-2 shadow-[0_-8px_32px_rgba(31,38,135,0.07)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.3)]">
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

// --- Onboarding Carousel ---

const OnboardingCarousel = ({ onSignUp, onExplore }: { onSignUp: () => void, onExplore: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      title: "Tower Bridge",
      fact: "London's real estate market is fiercely competitive, with average property prices often exceeding 14 times the average salary.",
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Big Ben",
      fact: "Rental demand in central London outstrips supply by nearly 3 to 1, leading to rapid price surges and bidding wars.",
      image: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Greater London",
      fact: "With over 32 boroughs, navigating the complexities of London property rights and deposits requires a shield of protection.",
      component: <AnimatedLondonMap />
    }
  ];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-gray-900 flex flex-col relative overflow-hidden">
      <div className="flex-1 relative w-full overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 w-full h-full"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000) {
                nextSlide();
              } else if (swipe > 10000) {
                prevSlide();
              }
            }}
          >
            <div className={`w-full h-3/5 overflow-hidden rounded-b-[2.5rem] relative shadow-sm ${slides[currentIndex].component ? 'bg-white dark:bg-gray-800' : ''}`}>
              {slides[currentIndex].component ? (
                slides[currentIndex].component
              ) : (
                <motion.img 
                  src={slides[currentIndex].image} 
                  alt={slides[currentIndex].title}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.05 }}
                  transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
                  draggable={false}
                />
              )}
              {!slides[currentIndex].component && <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />}
              <h2 className={`absolute bottom-8 left-8 text-3xl font-display font-bold drop-shadow-md ${slides[currentIndex].component ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                {slides[currentIndex].title}
              </h2>
            </div>
            
            <div className="px-8 pt-8 pb-4 text-center flex flex-col items-center justify-start h-2/5">
              <p className="text-gray-600 dark:text-gray-300 text-[15px] font-medium leading-relaxed">
                {slides[currentIndex].fact}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button onClick={prevSlide} className="absolute top-[25%] left-4 p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors z-20">
          <ChevronLeft size={24} />
        </button>
        <button onClick={nextSlide} className="absolute top-[25%] right-4 p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors z-20">
          <ChevronRight size={24} />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-[40%] left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-neone-blue' : 'w-1.5 bg-gray-300/50 dark:bg-gray-700/50 backdrop-blur-sm'}`} />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 pb-12 flex flex-col gap-3 w-full mx-auto z-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <button onClick={onSignUp} className="w-full py-4 bg-neone-blue text-white rounded-[1rem] text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all">
          Sign up
        </button>
        <button onClick={onExplore} className="w-full py-4 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-[1rem] text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-700 active:scale-[0.98] transition-all">
          Explore App
        </button>
      </div>
    </div>
  );
};

// --- Root App ---

const AppInner = () => {
  const { state, dispatch } = useAppContext();
  const { isAuthenticated } = state.session;
  const [showRegister, setShowRegister] = useState(false);

  const handleRegister = (newUser: UserProfile) => {
    dispatch({ type: 'SET_USER', payload: newUser });
    dispatch({ type: 'SET_AUTHENTICATED', payload: true });
  };

  return (
    <div className="h-full w-full flex justify-center bg-transparent transition-all duration-300">
      {!isAuthenticated ? (
        <main className="w-full h-full max-w-md bg-white/70 dark:bg-gray-900/60 backdrop-blur-2xl shadow-glass relative overflow-hidden flex flex-col border-x border-white/20 dark:border-white/10">
          {!showRegister ? (
            <OnboardingCarousel 
              onSignUp={() => setShowRegister(true)} 
              onExplore={() => console.log('Explore clicked')} 
            />
          ) : (
            <RegisterView onRegister={handleRegister} />
          )}
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
