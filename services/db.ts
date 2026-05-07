import Dexie, { type EntityTable } from 'dexie';
import type { Hazard, InventoryItem, Bill, VaultDocument, ScanHistoryItem } from '../types';

interface Settings {
  key: string;
  value: unknown;
}

interface AiCache {
  id?: number;
  queryHash: string;
  result: unknown;
  timestamp: number;
}

interface RecentActivity {
  id: string;
  title: string;
  time: number;
  iconName: string;
  color: string;
}

const db = new Dexie('RentShieldDB') as Dexie & {
  hazards: EntityTable<Hazard, 'id'>;
  inventory: EntityTable<InventoryItem, 'id'>;
  bills: EntityTable<Bill, 'id'>;
  vault: EntityTable<VaultDocument, 'id'>;
  history: EntityTable<ScanHistoryItem, 'id'>;
  settings: EntityTable<Settings, 'key'>;
  ai_cache: EntityTable<AiCache, 'id'>;
  activity: EntityTable<RecentActivity, 'id'>;
};

db.version(1).stores({
  hazards:   'id, severity, status, dateReported',
  inventory: 'id, room, dateAdded',
  bills:     'id, status, dueDate',
  vault:     'id, category, dateAdded',
  history:   'id, date, type, status',
  settings:  'key',
  ai_cache:  '++id, queryHash, timestamp',
  activity:  'id, time',
});

export async function migrateFromLocalStorage() {
  const keys = ['hazards', 'inventory', 'bills', 'vault', 'history'] as const;
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const items = JSON.parse(raw);
      if (!Array.isArray(items) || items.length === 0) continue;
      const count = await (db as any)[key].count();
      if (count === 0) {
        await (db as any)[key].bulkAdd(items);
      }
      localStorage.removeItem(key);
    } catch {
      // ignore parse errors
    }
  }
  const settingsKeys = ['darkMode', 'accessibility', 'notifications', 'privacy', 'encryptionEnabled', 'hasSeenOnboarding', 'recentActivity'];
  for (const key of settingsKeys) {
    const val = localStorage.getItem(key);
    if (val !== null) {
      await db.settings.put({ key, value: val });
      localStorage.removeItem(key);
    }
  }
  const user = localStorage.getItem('rentshield_user');
  if (user) {
    await db.settings.put({ key: 'rentshield_user', value: user });
    localStorage.removeItem('rentshield_user');
  }
}

export { db };
export type { Settings, AiCache, RecentActivity };
