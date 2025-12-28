
import { createClient } from '@supabase/supabase-js';
import { UserProfile } from './types';

/**
 * Safely retrieves environment variables across different build/runtime environments.
 * Prevents "Cannot read properties of undefined (reading 'VITE_SUPABASE_URL')" errors.
 */
const getEnvVar = (name: string): string => {
  // 1. Try process.env first (common in many Node-based or polyfilled environments)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name] as string;
    }
  } catch (e) {}

  // 2. Try import.meta.env (Vite standard)
  try {
    // We use a safe check to avoid the "Cannot read properties of undefined" crash
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[name] || '';
    }
  } catch (e) {}

  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const cloudSync = {
  isAvailable: () => !!supabase,

  async checkConnection(): Promise<{ok: boolean, message: string}> {
    if (!supabase) return { ok: false, message: "Keys Missing" };
    try {
      // Test query to see if table is accessible
      const { error } = await supabase.from('profiles').select('username').limit(1);
      if (error) {
        if (error.code === '42P01') return { ok: false, message: "Run SQL Script" };
        return { ok: false, message: error.message };
      }
      return { ok: true, message: "Connected" };
    } catch (e) {
      return { ok: false, message: "Network Error" };
    }
  },

  async getUser(username: string): Promise<UserProfile | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .maybeSingle();
      
      if (error) {
        console.error("Supabase GetUser Error:", error.message);
        return null;
      }
      
      if (data) {
        // Map snake_case from DB to camelCase in App
        return {
          username: data.username,
          password: data.password,
          xp: data.xp,
          progress: data.progress,
          lastActive: data.last_active,
          followedUsers: data.followed_users
        } as UserProfile;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async saveUser(user: UserProfile): Promise<{success: boolean, error?: string}> {
    if (!supabase) return { success: false, error: "Supabase not initialized" };
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          username: user.username.toLowerCase(),
          password: user.password,
          xp: user.xp,
          progress: user.progress,
          last_active: user.lastActive || Date.now(),
          followed_users: user.followedUsers || []
        }, { onConflict: 'username' });

      if (error) {
        console.error("Supabase Sync Failed:", error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Unknown Connection Error" };
    }
  }
};
