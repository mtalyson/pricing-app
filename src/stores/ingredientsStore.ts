import { create } from 'zustand';

import { supabase } from '~/lib/supabase';
import type { IngredientFormData, IngredientsState } from '~/types';

export const useIngredientsStore = create<IngredientsState>((set, get) => ({
  ingredients: [],
  loading: false,
  error: null,

  fetch: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ ingredients: data ?? [], loading: false });
  },

  add: async (formData: IngredientFormData) => {
    set({ error: null });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      set({ error: 'Usuário não autenticado' });
      return;
    }

    const { data, error } = await supabase
      .from('ingredients')
      .insert({ ...formData, user_id: user.id })
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }

    set(state => ({
      ingredients: [data, ...state.ingredients],
    }));
  },

  update: async (id: string, formData: IngredientFormData) => {
    set({ error: null });
    const { data, error } = await supabase
      .from('ingredients')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }

    set(state => ({
      ingredients: state.ingredients.map(i => (i.id === id ? data : i)),
    }));
  },

  remove: async (id: string) => {
    set({ error: null });
    const { error } = await supabase.from('ingredients').delete().eq('id', id);

    if (error) {
      set({ error: error.message });
      return;
    }

    set(state => ({
      ingredients: state.ingredients.filter(i => i.id !== id),
    }));
  },
}));
