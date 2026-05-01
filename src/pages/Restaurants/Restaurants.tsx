import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Crown, LogOut, Pencil, Plus, Store, Users, X } from 'lucide-react';

import { useAuthStore } from '~/stores/authStore';
import { useRestaurantStore } from '~/stores/restaurantStore';
import type { Restaurant } from '~/types';

import {
  defaultRestaurantFormValues,
  restaurantSchema,
  type RestaurantFormValues,
} from './validation';

export function Restaurants() {
  const { user } = useAuthStore();
  const {
    restaurants,
    currentRestaurant,
    loading,
    error,
    create,
    updateRestaurant,
    select,
    rolesMap,
  } = useRestaurantStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: defaultRestaurantFormValues,
  });

  // Separate owned vs associated restaurants
  const ownedRestaurants: Restaurant[] = [];
  const associatedRestaurants: Restaurant[] = [];

  restaurants.forEach(r => {
    if (rolesMap[r.id] === 'owner') {
      ownedRestaurants.push(r);
    } else {
      associatedRestaurants.push(r);
    }
  });

  const ownedCount = ownedRestaurants.length;

  const resetForm = () => {
    reset(defaultRestaurantFormValues);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (restaurant: Restaurant) => {
    reset({ name: restaurant.name });
    setEditingId(restaurant.id);
    setShowForm(true);
  };

  const onSubmit = async (data: RestaurantFormValues) => {
    if (editingId) {
      await updateRestaurant(editingId, { name: data.name });
    } else {
      await create({ name: data.name });
    }
    resetForm();
    // Re-fetch to get updated data
    await useRestaurantStore.getState().fetch();
  };

  const handleLeave = async (restaurantId: string) => {
    if (!user) return;

    const { supabase } = await import('~/lib/supabase');
    const { error: leaveError } = await supabase
      .from('restaurant_members')
      .delete()
      .eq('restaurant_id', restaurantId)
      .eq('user_id', user.id);

    if (leaveError) {
      return;
    }

    setLeavingId(null);

    // If we left the currently selected restaurant, switch to another
    if (currentRestaurant?.id === restaurantId) {
      const remaining = restaurants.filter(r => r.id !== restaurantId);
      if (remaining.length > 0) {
        select(remaining[0]);
      }
    }

    await useRestaurantStore.getState().fetch();
  };

  const roleLabels: Record<string, string> = {
    owner: 'Proprietário',
    manager: 'Gerente',
    staff: 'Funcionário',
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Restaurantes</h1>
          <p className="mt-1 text-sm text-surface-800/50">
            Gerencie seus restaurantes e associações.
          </p>
        </div>

        <button
          id="restaurant-add-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-500/20 transition-all hover:from-primary-400 hover:to-primary-500"
        >
          <Plus className="h-4 w-4" />
          Novo Restaurante
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-danger-500/20 bg-danger-500/5 p-3 text-sm text-danger-500">
          {error}
        </div>
      )}

      {/* Edit / Create modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-surface-200 bg-white p-6 shadow-modal dark:bg-surface-100">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">
                {editingId ? 'Editar Restaurante' : 'Novo Restaurante'}
              </h2>
              <button
                onClick={resetForm}
                className="cursor-pointer rounded-lg p-1 text-surface-800/40 hover:bg-surface-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="restaurant-name"
                  className="mb-1 block text-sm font-medium text-surface-800/70"
                >
                  Nome do restaurante
                </label>
                <input
                  id="restaurant-name"
                  type="text"
                  {...register('name')}
                  className={`w-full rounded-xl border bg-surface-50 px-3 py-2.5 text-sm focus:outline-none dark:bg-surface-200/50 ${
                    errors.name
                      ? 'border-danger-500 focus:border-danger-500'
                      : 'border-surface-200 focus:border-primary-300'
                  }`}
                  placeholder="Ex: Hamburgueria do Chef"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-danger-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 cursor-pointer rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-800/60 hover:bg-surface-100 dark:hover:bg-surface-200"
                >
                  Cancelar
                </button>
                <button
                  id="restaurant-submit"
                  type="submit"
                  disabled={editingId !== null && !isDirty}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium shadow-md transition-all ${
                    editingId !== null && !isDirty
                      ? 'cursor-not-allowed border border-surface-200 bg-surface-200 text-surface-800/60 shadow-none dark:border-surface-500 dark:bg-surface-600 dark:text-surface-400'
                      : 'cursor-pointer bg-linear-to-br from-primary-500 to-primary-600 text-white shadow-primary-500/20 hover:from-primary-400 hover:to-primary-500'
                  }`}
                >
                  {editingId ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-600" />
        </div>
      ) : restaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-200 bg-white py-16 dark:bg-surface-100">
          <Store className="mb-3 h-10 w-10 text-surface-800/20" />
          <p className="text-sm font-medium text-surface-800/40">
            Nenhum restaurante encontrado
          </p>
          <p className="mt-1 text-xs text-surface-800/30 dark:text-surface-400/40">
            Clique em &quot;Novo Restaurante&quot; para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Owned restaurants */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-surface-900">
                Meus Restaurantes
              </h2>
              <span className="rounded-full bg-surface-200 px-2 py-0.5 text-xs font-medium text-surface-800/60 dark:bg-surface-300">
                {ownedCount}
              </span>
            </div>

            {ownedRestaurants.length === 0 ? (
              <div className="rounded-xl border border-dashed border-surface-200 bg-white px-4 py-6 text-center dark:bg-surface-100">
                <p className="text-sm text-surface-800/40">
                  Você ainda não criou nenhum restaurante.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {ownedRestaurants.map(r => (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-card transition-all hover:shadow-elevated dark:bg-surface-100 ${
                      currentRestaurant?.id === r.id
                        ? 'border-primary-300 dark:border-primary-500/30'
                        : 'border-surface-200'
                    }`}
                  >
                    <button
                      onClick={() => select(r)}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          currentRestaurant?.id === r.id
                            ? 'bg-primary-50 dark:bg-primary-500/10'
                            : 'bg-surface-100 dark:bg-surface-200'
                        }`}
                      >
                        <Store
                          className={`h-4 w-4 ${
                            currentRestaurant?.id === r.id
                              ? 'text-primary-500 dark:text-primary-400'
                              : 'text-surface-800/40'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-surface-900">
                          {r.name}
                        </p>
                        <p className="text-xs text-surface-800/40">
                          {currentRestaurant?.id === r.id
                            ? 'Selecionado'
                            : 'Clique para selecionar'}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(r)}
                        className="cursor-pointer rounded-lg p-1.5 text-surface-800/40 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 dark:hover:text-primary-400"
                        title="Editar nome"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Associated restaurants */}
          {associatedRestaurants.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary-500" />
                <h2 className="text-sm font-semibold text-surface-900">
                  Restaurantes Associados
                </h2>
                <span className="rounded-full bg-surface-200 px-2 py-0.5 text-xs font-medium text-surface-800/60 dark:bg-surface-300">
                  {associatedRestaurants.length}
                </span>
              </div>

              <div className="space-y-2">
                {associatedRestaurants.map(r => (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-card transition-all hover:shadow-elevated dark:bg-surface-100 ${
                      currentRestaurant?.id === r.id
                        ? 'border-primary-300 dark:border-primary-500/30'
                        : 'border-surface-200'
                    }`}
                  >
                    <button
                      onClick={() => select(r)}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          currentRestaurant?.id === r.id
                            ? 'bg-primary-50 dark:bg-primary-500/10'
                            : 'bg-surface-100 dark:bg-surface-200'
                        }`}
                      >
                        <Store
                          className={`h-4 w-4 ${
                            currentRestaurant?.id === r.id
                              ? 'text-primary-500 dark:text-primary-400'
                              : 'text-surface-800/40'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-surface-900">
                          {r.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-surface-800/40">
                            {roleLabels[rolesMap[r.id]] ?? 'Membro'}
                          </span>
                          {currentRestaurant?.id === r.id && (
                            <span className="text-xs text-primary-500">
                              • Selecionado
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setLeavingId(r.id)}
                      className="cursor-pointer rounded-lg p-1.5 text-surface-800/40 hover:bg-danger-500/5 hover:text-danger-500 dark:hover:bg-danger-500/10"
                      title="Sair do restaurante"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leave confirmation modal */}
      {leavingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-surface-200 bg-white p-6 shadow-modal dark:bg-surface-100">
            <h2 className="mb-2 text-lg font-semibold text-surface-900">
              Sair do Restaurante
            </h2>
            <p className="mb-6 text-sm text-surface-800/70">
              Tem certeza que deseja sair deste restaurante? Você perderá o
              acesso aos dados dele. Para voltar, será necessário um novo
              convite.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setLeavingId(null)}
                className="flex-1 cursor-pointer rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-800/60 transition-colors hover:bg-surface-100 dark:hover:bg-surface-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleLeave(leavingId)}
                className="flex-1 cursor-pointer rounded-xl bg-danger-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-danger-600"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
