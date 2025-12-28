
import { createClient } from '@supabase/supabase-js';
import { UserProfile } from './types';

/**
 * Safely retrieves environment variables across different build/runtime environments.
 * Prevents "Cannot read properties of undefined (reading 'VITE_SUPABASE_URL')" errors.
 */
const getEnvVar = (name: string): string => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name] as string;
    }
  } catch (e) {}

  try {
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
    if (!supabase) return { ok: false, message: "Supabase Keys Missing" };
    try {
      // Test query to verify if the 'profiles' relation exists
      const { error } = await supabase.from('profiles').select('username').limit(1);
      if (error) {
        if (error.code === '42P01') {
          return { ok: false, message: "Database Setup Required: Table 'profiles' not found." };
        }
        return { ok: false, message: `DB Error: ${error.message}` };
      }
      return { ok: true, message: "Connected" };
    } catch (e) {
      return { ok: false, message: "Network connection lost" };
    }
  },

  async getUser(username: string): Promise<UserProfile | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.toLowerCase().trim())
        .maybeSingle();
      
      if (error) {
        console.error("Supabase GetUser Error:", error.message);
        return null;
      }
      
      if (data) {
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
          username: user.username.toLowerCase().trim(),
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
