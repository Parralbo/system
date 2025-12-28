
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

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const cloudSync = {
  isAvailable(): boolean {
    return !!supabase;
  },

  async checkConnection(): Promise<{ok: boolean, message: string}> {
    if (!supabase) {
      return { 
        ok: false, 
        message: "Config Missing: Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel." 
      };
    }
    try {
      const { error } = await supabase.from('profiles').select('username').limit(1);
      if (error) {
        if (error.code === '42P01') {
          return { ok: false, message: "Relation Missing: Run the SQL script in Supabase Editor." };
        }
        return { ok: false, message: `DB Error: ${error.message}` };
      }
      return { ok: true, message: "Cloud Ready" };
    } catch (e) {
      return { ok: false, message: "Network error: Connection refused." };
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
      
      if (error || !data) return null;

      return {
        username: data.username,
        password: data.password,
        xp: data.xp || 0,
        progress: data.progress || { completedTopics: {}, chapterCheckboxes: {} },
        lastActive: data.last_active || Date.now(),
        followedUsers: data.followed_users || []
      } as UserProfile;
    } catch (e) {
      return null;
    }
  },

  async getLeaderboard(limit = 20): Promise<UserProfile[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, xp, last_active')
        .order('xp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Leaderboard fetch error:", error);
        return [];
      }

      return (data || []).map(d => ({
        username: d.username,
        xp: d.xp || 0,
        lastActive: d.last_active || 0,
        progress: { completedTopics: {}, chapterCheckboxes: {} }
      })) as UserProfile[];
    } catch (e) {
      return [];
    }
  },

  async saveUser(user: UserProfile): Promise<{success: boolean, error?: string}> {
    if (!supabase) return { success: false, error: "Sync unavailable" };
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

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Unknown error" };
    }
  }
};
