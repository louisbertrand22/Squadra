import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { AuthState, User } from '../types';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  signInWithEmail: async (email: string) => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: undefined,
        },
      });
      if (error) throw error;
      // Success message will be shown in UI
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setUser: (user: User | null) => set({ user }),
  setSession: (session: any | null) => set({ session }),
  setLoading: (loading: boolean) => set({ loading }),
}));
