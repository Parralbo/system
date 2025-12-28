
import { createClient } from '@supabase/supabase-js';
import { UserProfile } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const cloudSync = {
  isAvailable: () => !!supabase,

  async checkConnection(): Promise<{ok: boolean, message: string}> {
    if (!supabase) return { ok: false, message: "API Keys Missing" };
    try {
      const { error } = await supabase.from('profiles').select('username').limit(1);
      if (error) {
        if (error.code === '42P01') return { ok: false, message: "Table 'profiles' not found" };
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
        .eq('username', username)
        .maybeSingle(); // Better than .single() as it doesn't error if not found
      
      if (error) {
        console.error("Supabase GetUser Error:", error.message);
        return null;
      }
      return data as UserProfile;
    } catch (e) {
      return null;
    }
  },

  async saveUser(user: UserProfile): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          username: user.username,
          password: user.password,
          xp: user.xp,
          progress: user.progress,
          lastActive: Date.now(),
          followedUsers: user.followedUsers || []
        }, { onConflict: 'username' });

      if (error) {
        console.error("Supabase Sync Failed:", error.message);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }
};
