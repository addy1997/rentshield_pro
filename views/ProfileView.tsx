import React, { useState, useRef } from 'react';
import {
  Shield, FileText, MapPin, ChevronLeft, Lock, ExternalLink, Calculator, User, Settings, LogOut, Bell,
  Info, Moon, Sun, Star, History, ThumbsUp, TrendingUp, MessageSquare, ArrowRight, Link as LinkIcon,
  Calendar, Trash2, Save, Eye, EyeOff, Smartphone, Ghost, Activity, FileLock, ChevronRight, AlertCircle,
  Sparkles, Download, FileCheck, Accessibility, HelpCircle, ShieldCheck, Book, Type as TypeIcon, Mail,
  MessageSquareQuote, Check, X, Scan, AlertTriangle, Siren, Camera, Loader2, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { NeuButton, SoftCard } from '../components/ui';
import { AppTab, VaultDocument } from '../types';
import { useAppContext } from '../context/AppContext';
import { format, formatDistanceToNow } from 'date-fns';

// --- Toggle Component ---

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex-shrink-0 ${checked ? 'bg-neone-green' : 'bg-gray-200 dark:bg-gray-700'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

// --- Profile View ---

interface UserProfile {
  firstName: string;
  lastName: string;
  age: string;
  mobile: string;
  avatar?: string;
}

export default function ProfileView() {
  const { state, dispatch } = useAppContext();

  const user = state.session.user as UserProfile | null;
  const darkMode = state.ui.darkMode;
  const accessibility = state.ui.accessibility;
  const notifications = state.ui.notifications;
  const privacy = state.ui.privacy;
  const history = state.data.history;
  const hazards = state.data.hazards;
  const vault = state.data.vault;
  const recentActivity = state.data.recentActivity;

  // Local encryption toggle (not in context — kept as local state for now)
  const [encryptionEnabled, setEncryptionEnabled] = useState(() => localStorage.getItem('encryptionEnabled') !== 'false');

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [addingVault, setAddingVault] = useState(false);
  const [vaultForm, setVaultForm] = useState({ title: '', category: 'Contract', file: '' });
  const vaultFileRef = useRef<HTMLInputElement>(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [askingAi, setAskingAi] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<UserProfile>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    age: user?.age || '',
    mobile: user?.mobile || '',
    avatar: user?.avatar || ''
  });

  const handleAskAi = async (q: string) => {
    setAiQuestion(q);
    setAskingAi(true);
    setAiAnswer('');
    const { askQuestion } = await import('../services/geminiService');
    const answer = await askQuestion(q);
    setAiAnswer(answer);
    setAskingAi(false);
  };

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
    dispatch({ type: 'SET_USER', payload: editForm });
    localStorage.setItem('rentshield_user', JSON.stringify(editForm));
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: Date.now().toString(),
        title: 'Profile Updated',
        time: Date.now(),
        iconName: 'User',
        color: 'text-gray-400'
      }
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('rentshield_user');
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_AUTHENTICATED', payload: false });
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
    const newDoc: VaultDocument = {
      id: Date.now().toString(),
      title: vaultForm.title,
      category: vaultForm.category as any,
      fileData: vaultForm.file,
      dateAdded: Date.now()
    };
    dispatch({ type: 'ADD_VAULT', payload: newDoc });
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: Date.now().toString(),
        title: `Vault: ${vaultForm.title}`,
        time: Date.now(),
        iconName: 'Lock',
        color: 'text-blue-500'
      }
    });
    setAddingVault(false);
    setVaultForm({ title: '', category: 'Contract', file: '' });
  };

  const handleDeleteHistory = () => {
    dispatch({ type: 'CLEAR_ALL_DATA' });
  };

  const handleToggleEncryption = () => {
    const next = !encryptionEnabled;
    setEncryptionEnabled(next);
    localStorage.setItem('encryptionEnabled', String(next));
  };

  const handleEmergencyHelp = (type: string) => {
    setEmergencyAlert(`Emergency Help Triggered: ${type}\n\nIn a real app, this would contact authorities or legal aid immediately.`);
  };

  // --- Edit Profile Screen ---
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

  // --- Notifications Screen ---
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
            <Toggle checked={notifications.deadlines} onChange={() => dispatch({ type: 'SET_NOTIFICATIONS', payload: {...notifications, deadlines: !notifications.deadlines} })} />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-bold text-black dark:text-white">Legal Updates</p>
              <p className="text-xs text-gray-500">News about tenant rights changes</p>
            </div>
            <Toggle checked={notifications.legal} onChange={() => dispatch({ type: 'SET_NOTIFICATIONS', payload: {...notifications, legal: !notifications.legal} })} />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-bold text-black dark:text-white">Market Insights</p>
              <p className="text-xs text-gray-500">Rent trends in your area</p>
            </div>
            <Toggle checked={notifications.market} onChange={() => dispatch({ type: 'SET_NOTIFICATIONS', payload: {...notifications, market: !notifications.market} })} />
          </div>
        </div>
      </div>
    );
  }

  // --- Privacy Screen ---
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
            <Toggle checked={privacy.shareData} onChange={() => dispatch({ type: 'SET_PRIVACY', payload: {...privacy, shareData: !privacy.shareData} })} />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-bold text-black dark:text-white">Local Storage Only</p>
              <p className="text-xs text-gray-500">Keep all sensitive data on this device</p>
            </div>
            <Toggle checked={privacy.localOnly} onChange={() => dispatch({ type: 'SET_PRIVACY', payload: {...privacy, localOnly: !privacy.localOnly} })} />
          </div>
        </div>
      </div>
    );
  }

  // --- Accessibility Screen ---
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
            <Toggle checked={accessibility.highContrast} onChange={() => dispatch({ type: 'SET_ACCESSIBILITY', payload: {...accessibility, highContrast: !accessibility.highContrast} })} />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-bold text-black dark:text-white">Large Text</p>
              <p className="text-xs text-gray-500">Increase font size across the app</p>
            </div>
            <Toggle checked={accessibility.largeText} onChange={() => dispatch({ type: 'SET_ACCESSIBILITY', payload: {...accessibility, largeText: !accessibility.largeText} })} />
          </div>
        </div>
      </div>
    );
  }

  // --- Help Screen ---
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

  // --- Main Profile Screen ---
  return (
    <div className="space-y-6 pb-20">
      {/* Emergency Alert */}
      {emergencyAlert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{emergencyAlert}</p>
            <NeuButton onClick={() => setEmergencyAlert(null)} className="w-full mt-4">Dismiss</NeuButton>
          </div>
        </div>
      )}

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
               <button onClick={handleToggleEncryption} className={`w-10 h-6 rounded-full transition-colors relative ${encryptionEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                 <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${encryptionEnabled ? 'left-5' : 'left-1'}`} />
               </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
               <button className="p-2 text-[10px] font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center justify-center gap-1">
                  <Download size={12} /> Export Data
               </button>
               <button onClick={handleDeleteHistory} className="p-2 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center justify-center gap-1">
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
            <button onClick={() => handleEmergencyHelp('Illegal Eviction')} className="w-full flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
               Illegal Eviction In Progress <ChevronRight size={14} />
            </button>
            <button onClick={() => handleEmergencyHelp('Landlord Entering')} className="w-full flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
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
               { label: 'Dark Mode', icon: darkMode ? Moon : Sun, toggle: true, value: darkMode, action: () => dispatch({ type: 'SET_DARK_MODE', payload: !darkMode }) },
               { label: 'Help & Support', icon: HelpCircle, action: () => setActiveSection('help') },
               { label: 'Sign Out', icon: LogOut, color: 'text-red-500', action: handleLogout }
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
}
