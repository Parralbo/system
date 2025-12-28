
import { createClient } from '@supabase/supabase-js';
import { UserProfile } from './types';

const getEnvVar = (name: string): string => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name] as string;
    }
  } catch (e) {}

  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[name]) {
      return metaEnv[name];
    }
  } catch (e) {}

  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Only initialize if keys are present to avoid console errors
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const cloudSync = {
  // Explicitly return boolean to resolve "void" expression error in truthiness tests
  isAvailable(): boolean {
    return !!supabase;
  },

  async checkConnection(): Promise<{ok: boolean, message: string}> {
    if (!supabase) {
      return { 
        ok: false, 
        message: "Configuration Missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set in environment variables." 
      };
    }
    try {
      const { error } = await supabase.from('profiles').select('username').limit(1);
      if (error) {
        if (error.code === '42P01') {
          return { ok: false, message: "Database Error: Table 'profiles' does not exist. Please run the SQL setup script." };
        }
        return { ok: false, message: `Supabase Error: ${error.message}` };
      }
      return { ok: true, message: "Cloud Sync Connected" };
    } catch (e) {
      return { ok: false, message: "Network error: Could not reach Supabase." };
    }
  },

  async getUser(username: string): Promise<UserProfile | null> {
    if (!supabase) return null;
    try {
      const cleanUsername = username.toLowerCase().trim();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanUsername)
        .maybeSingle();
      
      if (error) return null;
      if (data) {
        return {
          username: data.username,
          password: data.password,
          xp: data.xp,
          progress: data.progress,
          last_active: data.last_active,
          followedUsers: data.followed_users
        } as UserProfile;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async saveUser(user: UserProfile): Promise<{success: boolean, error?: string}> {
    if (!supabase) return { success: false, error: "Cloud sync not configured" };
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          username: user.username.toLowerCase().trim(),
          password: user.password,
          xp: user.xp,
          progress: user.progress,
          last_active: user.lastActive || Date.now(),
          // Fix: Mapping UserProfile camelCase to DB snake_case correctly using followedUsers property
          followed_users: user.followedUsers || []
        }, { onConflict: 'username' });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Unknown error" };
    }
  }
};
