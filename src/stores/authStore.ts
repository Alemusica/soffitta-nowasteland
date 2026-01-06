import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/database.types';

// 🔧 DEV MODE - Bypassa auth per testing
const DEV_MODE = process.env.EXPO_PUBLIC_APP_ENV === 'development';
const DEV_SKIP_AUTH = true; // Cambia a false per testare il login

// Mock user per development
const MOCK_USER: User = {
  id: 'dev-user-001',
  email: 'dev@soffitta.app',
  app_metadata: {},
  user_metadata: { display_name: 'Dev User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

const MOCK_PROFILE: Profile = {
  id: 'dev-user-001',
  display_name: 'Dev User',
  avatar_url: null,
  bio: 'Account di sviluppo',
  location_lat: 45.7578,
  location_lng: 8.5567,
  location_radius_km: 5,
  phone_verified: false,
  identity_verified: false,
  badges: ['early_adopter'],
  reputation_score: 100,
  total_items: 0,
  total_shares: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_SESSION: Session = {
  access_token: 'dev-token',
  refresh_token: 'dev-refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  user: MOCK_USER,
};

interface AuthState {
  // State
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
  
  initialize: async () => {
    // 🔧 DEV MODE - Skip auth
    if (DEV_MODE && DEV_SKIP_AUTH) {
      console.log('🔧 DEV MODE: Auth bypassed');
      set({
        session: MOCK_SESSION,
        user: MOCK_USER,
        profile: MOCK_PROFILE,
        isLoading: false,
        isInitialized: true,
      });
      return;
    }
    
    try {
      // Ottieni sessione corrente
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Carica profilo
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        set({
          session,
          user: session.user,
          profile,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          session: null,
          user: null,
          profile: null,
          isLoading: false,
          isInitialized: true,
        });
      }
      
      // Ascolta cambiamenti auth
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          set({ session, user: session.user, profile });
        } else if (event === 'SIGNED_OUT') {
          set({ session: null, user: null, profile: null });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },
  
  signInWithEmail: async (email, password) => {
    set({ isLoading: true });
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    set({ isLoading: false });
    
    return { error: error ? new Error(error.message) : null };
  },
  
  signUpWithEmail: async (email, password, displayName) => {
    set({ isLoading: true });
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    
    set({ isLoading: false });
    
    return { error: error ? new Error(error.message) : null };
  },
  
  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({
      session: null,
      user: null,
      profile: null,
      isLoading: false,
    });
  },
  
  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      set({ profile });
    }
  },
  
  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return { error: new Error('Non autenticato') };
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    
    if (!error) {
      await get().refreshProfile();
    }
    
    return { error: error ? new Error(error.message) : null };
  },
}));
