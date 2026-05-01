import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { supabase } from '~/lib/supabase';
import type {
  MemberRole,
  Restaurant,
  RestaurantFormData,
  RestaurantState,
} from '~/types';

const STORAGE_KEY = 'pricing-app-restaurant';

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set, get) => ({
      restaurants: [],
      currentRestaurant: null,
      members: [],
      currentRole: null,
      rolesMap: {},
      loading: false,
      error: null,

      fetch: async () => {
        if (get().loading) return;
        set({ loading: true, error: null });

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          set({ loading: false, error: 'Usuário não autenticado' });
          return;
        }

        // Get all restaurants the user is a member of
        const { data: memberships, error: memberError } = await supabase
          .from('restaurant_members')
          .select('restaurant_id, role')
          .eq('user_id', user.id);

        if (memberError) {
          set({ error: memberError.message, loading: false });
          return;
        }

        if (!memberships || memberships.length === 0) {
          set({
            restaurants: [],
            currentRestaurant: null,
            currentRole: null,
            rolesMap: {},
            loading: false,
          });
          return;
        }

        const restaurantIds = memberships.map(
          (m: { restaurant_id: string }) => m.restaurant_id,
        );

        const { data: restaurants, error: restError } = await supabase
          .from('restaurants')
          .select('*')
          .in('id', restaurantIds)
          .order('created_at', { ascending: true });

        if (restError) {
          set({ error: restError.message, loading: false });
          return;
        }

        const currentRestaurant = get().currentRestaurant;
        const stillExists = currentRestaurant
          ? restaurants?.find((r: Restaurant) => r.id === currentRestaurant.id)
          : null;

        // Auto-select logic
        const selected = stillExists ?? restaurants?.[0] ?? null;
        const selectedRole = selected
          ? ((memberships.find(
              (m: { restaurant_id: string }) => m.restaurant_id === selected.id,
            )?.role as MemberRole) ?? null)
          : null;

        // Build roles map from memberships
        const newRolesMap: Record<string, MemberRole> = {};
        memberships.forEach((m: { restaurant_id: string; role: string }) => {
          newRolesMap[m.restaurant_id] = m.role as MemberRole;
        });

        set({
          restaurants: (restaurants as Restaurant[]) ?? [],
          currentRestaurant: selected as Restaurant | null,
          currentRole: selectedRole,
          rolesMap: newRolesMap,
          loading: false,
        });
      },

      create: async (formData: RestaurantFormData) => {
        set({ error: null });

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          set({ error: 'Usuário não autenticado' });
          return null;
        }

        const slug = generateSlug(formData.name);

        // Use RPC to create restaurant + membership atomically
        // (direct INSERT + .select() fails because the SELECT RLS policy
        // requires the user to be a member, which doesn't exist yet)
        const { data, error } = await supabase.rpc('create_restaurant', {
          p_name: formData.name,
          p_slug: slug,
        });

        if (error) {
          set({ error: error.message });
          return null;
        }

        const typedRestaurant = data as Restaurant;

        set((state: RestaurantState) => ({
          restaurants: [...state.restaurants, typedRestaurant],
          currentRestaurant: typedRestaurant,
          currentRole: 'owner' as MemberRole,
        }));

        return typedRestaurant;
      },

      select: (restaurant: Restaurant) => {
        set({ currentRestaurant: restaurant });

        // Async role lookup
        (async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) return;

          const { data } = await supabase
            .from('restaurant_members')
            .select('role')
            .eq('restaurant_id', restaurant.id)
            .eq('user_id', user.id)
            .single();

          if (data) {
            set({ currentRole: data.role as MemberRole });
          }
        })();
      },

      updateRestaurant: async (id: string, formData: RestaurantFormData) => {
        set({ error: null });

        const { data, error } = await supabase
          .from('restaurants')
          .update({ name: formData.name })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          set({ error: error.message });
          return;
        }

        const typedData = data as Restaurant;

        set((state: RestaurantState) => ({
          restaurants: state.restaurants.map((r: Restaurant) =>
            r.id === id ? typedData : r,
          ),
          currentRestaurant:
            state.currentRestaurant?.id === id
              ? typedData
              : state.currentRestaurant,
        }));
      },

      fetchMembers: async () => {
        const restaurant = get().currentRestaurant;
        if (!restaurant) return;

        const { data, error } = await supabase
          .from('restaurant_members')
          .select('*')
          .eq('restaurant_id', restaurant.id)
          .order('created_at', { ascending: true });

        if (error) {
          set({ error: error.message });
          return;
        }

        set({ members: data ?? [] });
      },

      removeMember: async (memberId: string) => {
        set({ error: null });

        const { error } = await supabase
          .from('restaurant_members')
          .delete()
          .eq('id', memberId);

        if (error) {
          set({ error: error.message });
          return;
        }

        set((state: RestaurantState) => ({
          members: state.members.filter(
            (m: { id: string }) => m.id !== memberId,
          ),
        }));
      },

      updateMemberRole: async (memberId: string, role: MemberRole) => {
        set({ error: null });

        const { data, error } = await supabase
          .from('restaurant_members')
          .update({ role })
          .eq('id', memberId)
          .select()
          .single();

        if (error) {
          set({ error: error.message });
          return;
        }

        set((state: RestaurantState) => ({
          members: state.members.map((m: { id: string }) =>
            m.id === memberId ? data : m,
          ),
        }));
      },

      reset: () => {
        set({
          restaurants: [],
          currentRestaurant: null,
          members: [],
          currentRole: null,
          rolesMap: {},
          loading: false,
          error: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state: RestaurantState) => ({
        currentRestaurant: state.currentRestaurant,
      }),
    },
  ),
);
