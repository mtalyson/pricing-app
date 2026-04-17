import { create } from 'zustand';

import { supabase } from '~/lib/supabase';
import type {
  ProductFormData,
  ProductIngredientFormData,
  ProductsState,
} from '~/types';

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  loading: false,
  ingredientsLoading: false,
  error: null,
  productIngredients: [],

  fetch: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ products: data ?? [], loading: false });
  },

  add: async (formData: ProductFormData) => {
    set({ error: null });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      set({ error: 'Usuário não autenticado' });
      return null;
    }

    const { data, error } = await supabase
      .from('products')
      .insert({ ...formData, user_id: user.id })
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }

    set(state => ({
      products: [data, ...state.products],
    }));

    return data;
  },

  update: async (id: string, formData: Partial<ProductFormData>) => {
    set({ error: null });
    const { data, error } = await supabase
      .from('products')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }

    set(state => ({
      products: state.products.map(p => (p.id === id ? data : p)),
    }));
  },

  remove: async (id: string) => {
    set({ error: null });
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      set({ error: error.message });
      return;
    }

    set(state => ({
      products: state.products.filter(p => p.id !== id),
    }));
  },

  fetchProductIngredients: async (productId: string) => {
    if (get().ingredientsLoading) return;
    set({ ingredientsLoading: true });

    const { data, error } = await supabase
      .from('product_ingredients')
      .select('*')
      .eq('product_id', productId);

    if (error) {
      set({ error: error.message, ingredientsLoading: false });
      return;
    }
    set({ productIngredients: data ?? [], ingredientsLoading: false });
  },

  addProductIngredient: async (
    productId: string,
    formData: ProductIngredientFormData,
  ) => {
    set({ error: null });
    const { data, error } = await supabase
      .from('product_ingredients')
      .insert({
        product_id: productId,
        ingredient_id: formData.ingredient_id,
        quantity_used: formData.quantity_used,
      })
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }

    set(state => ({
      productIngredients: [...state.productIngredients, data],
    }));
  },

  removeProductIngredient: async (id: string) => {
    set({ error: null });
    const { error } = await supabase
      .from('product_ingredients')
      .delete()
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return;
    }

    set(state => ({
      productIngredients: state.productIngredients.filter(pi => pi.id !== id),
    }));
  },

  updateProductIngredient: async (id: string, quantityUsed: number) => {
    set({ error: null });
    const { data, error } = await supabase
      .from('product_ingredients')
      .update({ quantity_used: quantityUsed })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }

    set(state => ({
      productIngredients: state.productIngredients.map(pi =>
        pi.id === id ? data : pi,
      ),
    }));
  },
}));
