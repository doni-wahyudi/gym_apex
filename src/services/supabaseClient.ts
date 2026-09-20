import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'apexforge_supabase_url';
const STORAGE_KEY_ANON = 'apexforge_supabase_anon';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const localUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const localAnon = localStorage.getItem(STORAGE_KEY_ANON) || '';
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envAnon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: localUrl || envUrl,
    anonKey: localAnon || envAnon,
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (url.trim()) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
  }

  if (anonKey.trim()) {
    localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_ANON);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey) {
    return null;
  }

  if (cachedClient && lastUsedUrl === url) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey);
    lastUsedUrl = url;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'URL and Anon Key are required.' };
  }

  try {
    const testClient = createClient(url, anonKey);
    const { error } = await testClient.from('membership_plans').select('id').limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! (Note: Remember to run supabase_schema.sql in SQL Editor to create tables).',
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection failed' };
  }
}
