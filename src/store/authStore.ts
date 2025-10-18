import { create } from 'zustand';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { AuthState, User } from '../types';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  signInWithEmail: async (email: string) => {
    try {
      set({ loading: true });
      
      // Get the redirect URL based on platform
      // Web: use environment variable (e.g., http://localhost:3000 or https://your-domain.com)
      // Mobile: use custom URL scheme (squadra://)
      const redirectUrl = Platform.OS === 'web' 
        ? process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL || undefined
        : 'squadra://';
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
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

  signInWithOAuth: async (provider: 'google' | 'github' | 'apple') => {
    try {
      set({ loading: true });
      // Get the dynamic redirect URL for the Expo app
      const redirectUrl = Linking.createURL('/');
      console.log('OAuth Redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with OAuth:', error);
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
