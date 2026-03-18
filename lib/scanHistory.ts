import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabase';

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

// --- AsyncStorage helpers (cache/fallback) ---

async function getLocalHistory(): Promise<ScanHistoryItem[]> {
  try {
    const json = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
    if (!json) return [];
    return JSON.parse(json);
  } catch {
    return [];
  }
}

async function saveLocalHistory(history: ScanHistoryItem[]): Promise<void> {
  await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(history));
}

// --- Supabase helpers ---

function mapRowToHistoryItem(row: any): ScanHistoryItem {
  return {
    id: row.id,
    productName: row.gemini_response?.productName || 'Unknown',
    brand: row.gemini_response?.brand || '',
    category: row.gemini_response?.category || '',
    rating: row.gemini_response?.rating || 'caution',
    crunchyScore: row.score || 50,
    barcode: row.gemini_response?.barcode || undefined,
    scanMode: row.scan_type || 'item',
    scannedAt: row.created_at,
    ingredients: row.gemini_response?.ingredients || [],
    concerns: row.gemini_response?.concerns || [],
    summary: row.gemini_response?.summary || '',
  };
}

async function saveToSupabase(item: ScanHistoryItem, userId: string): Promise<void> {
  const geminiResponse = {
    productName: item.productName,
    brand: item.brand,
    category: item.category,
    rating: item.rating,
    crunchyScore: item.crunchyScore,
    barcode: item.barcode,
    ingredients: item.ingredients,
    concerns: item.concerns,
    summary: item.summary,
  };

  // Insert into scans table
  await supabase.from('scans').insert({
    id: item.id,
    user_id: userId,
    scan_type: item.scanMode,
    gemini_response: geminiResponse,
    score: item.crunchyScore,
    created_at: item.scannedAt,
  });

  // Upsert into products table by name+brand
  if (item.productName && item.productName !== 'Unknown') {
    const ingredientNames = (item.ingredients || []).map((i) => i.name);
    // Try to find existing product
    const { data: existing } = await supabase
      .from('products')
      .select('id, scan_count')
      .eq('name', item.productName)
      .eq('brand', item.brand || '')
      .limit(1)
      .single();

    if (existing) {
      await supabase
        .from('products')
        .update({
          overall_score: item.crunchyScore,
          gemini_analysis: geminiResponse,
          ingredients: ingredientNames,
          scan_count: (existing.scan_count || 0) + 1,
          category: item.category || 'Other',
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('products').insert({
        name: item.productName,
        brand: item.brand || null,
        category: item.category || 'Other',
        ingredients: ingredientNames,
        overall_score: item.crunchyScore,
        gemini_analysis: geminiResponse,
        scan_count: 1,
      });
    }
  }
}

// --- Public API ---

export async function addToHistory(
  item: Omit<ScanHistoryItem, 'id' | 'scannedAt'>,
  userId?: string
): Promise<ScanHistoryItem> {
  const newItem: ScanHistoryItem = {
    ...item,
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    scannedAt: new Date().toISOString(),
  };

  // Always save to AsyncStorage (cache/offline fallback)
  const history = await getLocalHistory();
  const updated = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
  await saveLocalHistory(updated);

  // Also save to Supabase if configured and user is authenticated
  if (isSupabaseConfigured() && userId) {
    try {
      await saveToSupabase(newItem, userId);
    } catch {
      // Supabase failed (RLS, network, etc.) - local storage is the fallback
    }
  }

  return newItem;
}

export async function getScanHistory(userId?: string): Promise<ScanHistoryItem[]> {
  // Try Supabase first if configured and user is authenticated
  if (isSupabaseConfigured() && userId) {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(MAX_HISTORY_ITEMS);

      if (!error && data && data.length > 0) {
        const items = data.map(mapRowToHistoryItem);
        // Update local cache
        await saveLocalHistory(items);
        return items;
      }
    } catch {
      // Fall through to local
    }
  }

  return getLocalHistory();
}

export async function getRecentScans(count: number = 5, userId?: string): Promise<ScanHistoryItem[]> {
  const history = await getScanHistory(userId);
  return history.slice(0, count);
}

export async function getScanStats(userId?: string): Promise<{ totalScans: number; averageScore: number }> {
  const history = await getScanHistory(userId);
  if (history.length === 0) return { totalScans: 0, averageScore: 0 };
  const totalScore = history.reduce((sum, item) => sum + (item.crunchyScore || 0), 0);
  return {
    totalScans: history.length,
    averageScore: Math.round(totalScore / history.length),
  };
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(SCAN_HISTORY_KEY);
}
