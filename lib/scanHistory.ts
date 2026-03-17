import AsyncStorage from '@react-native-async-storage/async-storage';

const SCAN_HISTORY_KEY = '@crunchy_scan_history';
const MAX_HISTORY_ITEMS = 100;

export interface ScanHistoryItem {
  id: string;
  productName: string;
  brand: string;
  category: string;
  rating: 'clean' | 'caution' | 'avoid';
  crunchyScore: number;
  barcode?: string;
  scanMode: string;
  scannedAt: string;
  ingredients?: Array<{ name: string; risk: string }>;
  concerns?: string[];
  summary?: string;
}

export async function getScanHistory(): Promise<ScanHistoryItem[]> {
  try {
    const json = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
    if (!json) return [];
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export async function addToHistory(item: Omit<ScanHistoryItem, 'id' | 'scannedAt'>): Promise<ScanHistoryItem> {
  const history = await getScanHistory();
  const newItem: ScanHistoryItem = {
    ...item,
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    scannedAt: new Date().toISOString(),
  };
  const updated = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
  await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updated));
  return newItem;
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(SCAN_HISTORY_KEY);
}

export async function getRecentScans(count: number = 5): Promise<ScanHistoryItem[]> {
  const history = await getScanHistory();
  return history.slice(0, count);
}

export async function getScanStats(): Promise<{ totalScans: number; averageScore: number }> {
  const history = await getScanHistory();
  if (history.length === 0) return { totalScans: 0, averageScore: 0 };
  const totalScore = history.reduce((sum, item) => sum + (item.crunchyScore || 0), 0);
  return {
    totalScans: history.length,
    averageScore: Math.round(totalScore / history.length),
  };
}
