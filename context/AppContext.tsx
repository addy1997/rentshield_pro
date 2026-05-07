import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { db, migrateFromLocalStorage } from '../services/db';
import type { Hazard, InventoryItem, Bill, VaultDocument, ScanHistoryItem, AppTab } from '../types';
import { AppTab as AppTabEnum } from '../types';

// --- Interfaces ---

interface UserProfile {
  firstName: string;
  lastName: string;
  age: string;
  mobile: string;
  avatar?: string;
}

interface RecentActivityItem {
  id: string;
  title: string;
  time: number;
  iconName: string;
  color: string;
}

// --- State Slices ---

interface DataSlice {
  hazards: Hazard[];
  inventory: InventoryItem[];
  bills: Bill[];
  vault: VaultDocument[];
  history: ScanHistoryItem[];
  recentActivity: RecentActivityItem[];
}

interface UISlice {
  darkMode: boolean;
  accessibility: { highContrast: boolean; largeText: boolean };
  notifications: { deadlines: boolean; legal: boolean; market: boolean };
  privacy: { shareData: boolean; localOnly: boolean };
}

interface SessionSlice {
  user: UserProfile | null;
  isAuthenticated: boolean;
  activeTab: AppTab;
  hasSeenOnboarding: boolean;
  locationName: string;
}

export interface AppState {
  data: DataSlice;
  ui: UISlice;
  session: SessionSlice;
}

// --- Actions ---

type AppAction =
  | { type: 'ADD_HAZARD'; payload: Hazard }
  | { type: 'ADD_INVENTORY'; payload: InventoryItem }
  | { type: 'ADD_BILL'; payload: Bill }
  | { type: 'PAY_BILL'; payload: string }
  | { type: 'ADD_VAULT'; payload: VaultDocument }
  | { type: 'ADD_HISTORY'; payload: ScanHistoryItem }
  | { type: 'ADD_ACTIVITY'; payload: RecentActivityItem }
  | { type: 'CLEAR_ALL_DATA' }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'SET_ACCESSIBILITY'; payload: UISlice['accessibility'] }
  | { type: 'SET_NOTIFICATIONS'; payload: UISlice['notifications'] }
  | { type: 'SET_PRIVACY'; payload: UISlice['privacy'] }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: AppTab }
  | { type: 'SET_ONBOARDING_SEEN' }
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'HYDRATE'; payload: Partial<AppState> };

// --- Initial State ---

const initialState: AppState = {
  data: {
    hazards: [],
    inventory: [],
    bills: [],
    vault: [],
    history: [],
    recentActivity: [],
  },
  ui: {
    darkMode: false,
    accessibility: { highContrast: false, largeText: false },
    notifications: { deadlines: true, legal: true, market: false },
    privacy: { shareData: true, localOnly: false },
  },
  session: {
    user: null,
    isAuthenticated: false,
    activeTab: AppTabEnum.OVERVIEW,
    hasSeenOnboarding: false,
    locationName: 'Locating...',
  },
};

// --- Reducer ---

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_HAZARD':
      return { ...state, data: { ...state.data, hazards: [action.payload, ...state.data.hazards] } };
    case 'ADD_INVENTORY':
      return { ...state, data: { ...state.data, inventory: [action.payload, ...state.data.inventory] } };
    case 'ADD_BILL':
      return { ...state, data: { ...state.data, bills: [action.payload, ...state.data.bills] } };
    case 'PAY_BILL':
      return {
        ...state,
        data: {
          ...state.data,
          bills: state.data.bills.map(b => b.id === action.payload ? { ...b, status: 'Paid' as const } : b)
        }
      };
    case 'ADD_VAULT':
      return { ...state, data: { ...state.data, vault: [action.payload, ...state.data.vault] } };
    case 'ADD_HISTORY':
      return { ...state, data: { ...state.data, history: [action.payload, ...state.data.history] } };
    case 'ADD_ACTIVITY':
      return {
        ...state,
        data: {
          ...state.data,
          recentActivity: [action.payload, ...state.data.recentActivity].slice(0, 5)
        }
      };
    case 'CLEAR_ALL_DATA':
      return {
        ...state,
        data: { hazards: [], inventory: [], bills: [], vault: [], history: [], recentActivity: [] }
      };
    case 'SET_DARK_MODE':
      return { ...state, ui: { ...state.ui, darkMode: action.payload } };
    case 'SET_ACCESSIBILITY':
      return { ...state, ui: { ...state.ui, accessibility: action.payload } };
    case 'SET_NOTIFICATIONS':
      return { ...state, ui: { ...state.ui, notifications: action.payload } };
    case 'SET_PRIVACY':
      return { ...state, ui: { ...state.ui, privacy: action.payload } };
    case 'SET_USER':
      return { ...state, session: { ...state.session, user: action.payload } };
    case 'SET_AUTHENTICATED':
      return { ...state, session: { ...state.session, isAuthenticated: action.payload } };
    case 'SET_ACTIVE_TAB':
      return { ...state, session: { ...state.session, activeTab: action.payload } };
    case 'SET_ONBOARDING_SEEN':
      return { ...state, session: { ...state.session, hasSeenOnboarding: true } };
    case 'SET_LOCATION':
      return { ...state, session: { ...state.session, locationName: action.payload } };
    case 'HYDRATE':
      return {
        data: { ...state.data, ...action.payload.data },
        ui: { ...state.ui, ...action.payload.ui },
        session: { ...state.session, ...action.payload.session },
      };
    default:
      return state;
  }
}

// --- Context ---

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from Dexie on mount
  useEffect(() => {
    async function hydrate() {
      await migrateFromLocalStorage();

      const [hazards, inventory, bills, vault, history, activityRaw] = await Promise.all([
        db.hazards.toArray(),
        db.inventory.toArray(),
        db.bills.toArray(),
        db.vault.toArray(),
        db.history.orderBy('date').reverse().toArray(),
        db.activity.orderBy('time').reverse().limit(5).toArray(),
      ]);

      async function getSetting<T>(key: string, fallback: T): Promise<T> {
        const row = await db.settings.get(key);
        if (!row) return fallback;
        try { return JSON.parse(row.value as string) as T; }
        catch { return row.value as unknown as T; }
      }

      const [darkMode, accessibility, notifications, privacy, hasSeenOnboarding, userRaw] = await Promise.all([
        getSetting('darkMode', false),
        getSetting('accessibility', { highContrast: false, largeText: false }),
        getSetting('notifications', { deadlines: true, legal: true, market: false }),
        getSetting('privacy', { shareData: true, localOnly: false }),
        getSetting<boolean | string>('hasSeenOnboarding', false),
        getSetting<string | null>('rentshield_user', null),
      ]);

      const user = userRaw ? (typeof userRaw === 'string' ? JSON.parse(userRaw) : userRaw) : null;

      dispatch({
        type: 'HYDRATE',
        payload: {
          data: { hazards, inventory, bills, vault, history, recentActivity: activityRaw },
          ui: { darkMode: String(darkMode) === 'true', accessibility: accessibility as any, notifications: notifications as any, privacy: privacy as any },
          session: {
            user,
            isAuthenticated: !!user,
            activeTab: AppTabEnum.OVERVIEW,
            hasSeenOnboarding: String(hasSeenOnboarding) === 'true',
            locationName: 'Locating...',
          },
        },
      });
    }
    hydrate();
  }, []);

  // Persist UI settings to Dexie
  useEffect(() => {
    db.settings.put({ key: 'darkMode', value: String(state.ui.darkMode) });
    if (state.ui.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [state.ui.darkMode]);

  useEffect(() => {
    db.settings.put({ key: 'accessibility', value: JSON.stringify(state.ui.accessibility) });
    document.documentElement.classList.toggle('large-text', state.ui.accessibility.largeText);
    document.documentElement.classList.toggle('high-contrast', state.ui.accessibility.highContrast);
  }, [state.ui.accessibility]);

  useEffect(() => {
    db.settings.put({ key: 'notifications', value: JSON.stringify(state.ui.notifications) });
  }, [state.ui.notifications]);

  useEffect(() => {
    db.settings.put({ key: 'privacy', value: JSON.stringify(state.ui.privacy) });
  }, [state.ui.privacy]);

  // Persist data to Dexie
  useEffect(() => {
    if (state.data.hazards.length > 0) {
      db.hazards.clear().then(() => db.hazards.bulkAdd(state.data.hazards));
    }
  }, [state.data.hazards]);

  useEffect(() => {
    if (state.data.inventory.length > 0) {
      db.inventory.clear().then(() => db.inventory.bulkAdd(state.data.inventory));
    }
  }, [state.data.inventory]);

  useEffect(() => {
    if (state.data.bills.length > 0) {
      db.bills.clear().then(() => db.bills.bulkAdd(state.data.bills));
    }
  }, [state.data.bills]);

  useEffect(() => {
    if (state.data.vault.length > 0) {
      db.vault.clear().then(() => db.vault.bulkAdd(state.data.vault));
    }
  }, [state.data.vault]);

  useEffect(() => {
    if (state.data.history.length > 0) {
      db.history.clear().then(() => db.history.bulkAdd(state.data.history));
    }
  }, [state.data.history]);

  useEffect(() => {
    if (state.session.user) {
      db.settings.put({ key: 'rentshield_user', value: JSON.stringify(state.session.user) });
    }
  }, [state.session.user]);

  useEffect(() => {
    if (!state.session.isAuthenticated) {
      db.settings.delete('rentshield_user');
    }
  }, [state.session.isAuthenticated]);

  useEffect(() => {
    db.settings.put({ key: 'hasSeenOnboarding', value: String(state.session.hasSeenOnboarding) });
  }, [state.session.hasSeenOnboarding]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export type { UserProfile, RecentActivityItem };
