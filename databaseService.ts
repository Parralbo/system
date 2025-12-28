
import { createClient } from '@supabase/supabase-js';
import { UserProfile } from './types';

// These should be set in Vercel Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const cloudSync = {
  isAvailable: () => !!supabase,

  async getUser(username: string): Promise<UserProfile | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return null;
    return data as UserProfile;
  },

  async saveUser(user: UserProfile): Promise<boolean> {
    if (!supabase) return false;
    // We omit password on updates if handled by Supabase Auth, but for this "Database-like" request, 
    // we store the profile object including the progress JSON.
    const { error } = await supabase
      .from('profiles')
      .upsert({
        username: user.username,
        password: user.password,
        xp: user.xp,
        progress: user.progress,
        lastActive: Date.now()
      }, { onConflict: 'username' });

    return !error;
  }
};
