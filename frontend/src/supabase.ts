import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { HistoryRecord } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export async function savePrediction(
  data: Omit<HistoryRecord, 'id' | 'created_at'>
): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('prediction_history')
      .insert(data);

    if (error) {
      console.error('Failed to save prediction:', error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function getHistory(): Promise<HistoryRecord[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('prediction_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch history:', error.message);
      return [];
    }

    return (data ?? []) as HistoryRecord[];
  } catch {
    return [];
  }
}