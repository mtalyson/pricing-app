import type { User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '~/lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

let initPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  loading: false,
  initialized: false,
  error: null,

  initialize: () => {
    if (!initPromise) {
      initPromise = (async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          set({ user: session?.user ?? null, initialized: true });

          supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null });
          });
        } catch {
          set({ user: null, initialized: true });
        }
      })();
    }
    return initPromise;
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      set({ user: data.user, loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao criar conta';
      set({ error: message, loading: false });
      throw err;
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      set({ user: data.user, loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao fazer login';
      set({ error: message, loading: false });
      throw err;
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao sair';
      set({ error: message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
