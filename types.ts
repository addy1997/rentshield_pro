
export interface Hazard {
  id: string;
  type: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  dateReported: number; // timestamp
  status: 'Reported' | 'Landlord Notified' | 'Action Required' | 'Resolved';
  imageUrl?: string;
}

export interface ScanResult {
  isSafe: boolean;
  score: number; // 0-100
  issues: string[];
  summary: string;
}

export interface EPCResult {
  score: string; // A-G
  comfort: number; // 0-100
  compliance: boolean;
  summary: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  borough?: string;
}

export interface ScanHistoryItem {
  id: string;
  date: number;
  type: 'contract' | 'bidding' | 'epc';
  summary: string;
  status: 'safe' | 'risk' | 'warning' | 'info';
}

export enum AppTab {
  OVERVIEW = 'overview',
  SCAN = 'scan',
  TRACKER = 'tracker',
  RIGHTS = 'rights',
  PROFILE = 'profile'
}

export enum Tone {
  DIPLOMATIC = 'Diplomatic',
  FIRM = 'Firm',
  STRICTLY_LEGAL = 'Strictly Legal'
}
