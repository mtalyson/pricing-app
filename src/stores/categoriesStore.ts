import { create } from 'zustand';

import { supabase } from '~/lib/supabase';
import type { Category, CategoryFormData } from '~/types/database';

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (data: CategoryFormData) => Promise<void>;
  update: (id: string, data: CategoryFormData) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>(set => ({
  categories: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ categories: data ?? [], loading: false });
  },

  add: async (formData: CategoryFormData) => {
    set({ error: null });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      set({ error: 'Usuário não autenticado' });
      return;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({ ...formData, user_id: user.id })
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }

    set(state => ({
      categories: [...state.categories, data].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    }));
  },

  update: async (id: string, formData: CategoryFormData) => {
    set({ error: null });
    const { data, error } = await supabase
      .from('categories')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }

    set(state => ({
      categories: state.categories
        .map(c => (c.id === id ? data : c))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  },

  remove: async (id: string) => {
    set({ error: null });
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      set({ error: error.message });
      return;
    }

    set(state => ({
      categories: state.categories.filter(c => c.id !== id),
    }));
  },
}));
