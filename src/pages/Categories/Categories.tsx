import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Pencil, Tag, X, Search } from 'lucide-react';

import { useCategoriesStore } from '~/stores/categoriesStore';
import type { Category } from '~/types/database';

import {
  categorySchema,
  defaultCategoryFormValues,
  type CategoryFormValues,
} from './validation';

export function Categories() {
  const { categories, loading, error, fetch, add, update, remove } =
    useCategoriesStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null,
  );
  const [search, setSearch] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultCategoryFormValues,
  });

  const resetForm = () => {
    reset();
    setEditingId(null);
    setShowForm(false);
  };

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (cat: Category) => {
    setValue('name', cat.name);
    setEditingId(cat.id);
    setShowForm(true);
  };

  const onSubmit = async (data: CategoryFormValues) => {
    if (editingId) {
      await update(editingId, data);
    } else {
      await add(data);
    }
    resetForm();
  };

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Categorias</h1>
          <p className="mt-1 text-sm text-surface-800/50">
            Organize seus produtos em categorias.
          </p>
        </div>

        <button
          id="category-add-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-500/20 transition-all hover:from-primary-400 hover:to-primary-500"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-surface-800/30" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar categoria..."
          className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pr-10 pl-10 text-sm text-surface-900 placeholder-surface-800/30 shadow-card transition-colors focus:border-primary-300 focus:ring-0 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-surface-800/40 transition-colors hover:bg-surface-100 hover:text-surface-800"
            title="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-danger-500/20 bg-danger-500/5 p-3 text-sm text-danger-500">
          {error}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-surface-200 bg-white p-6 shadow-modal">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">
                {editingId ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>

              <button
                onClick={resetForm}
                className="rounded-lg p-1 text-surface-800/40 hover:bg-surface-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-1 block text-sm font-medium text-surface-800/70"
                >
                  Nome da categoria
                </label>

                <input
                  id="category-name"
                  type="text"
                  {...register('name')}
                  className={`w-full rounded-xl border bg-surface-50 px-3 py-2.5 text-sm focus:outline-none ${errors.name ? 'border-danger-500 focus:border-danger-500' : 'border-surface-200 focus:border-primary-300'}`}
                  placeholder="Ex: Pizzas, Doces..."
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
                  className="flex-1 rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-800/60 hover:bg-surface-100"
                >
                  Cancelar
                </button>
                <button
                  id="category-submit"
                  type="submit"
                  className="flex-1 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary-500/20"
                >
                  {editingId ? 'Salvar' : 'Adicionar'}
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
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-200 bg-white py-16">
          <Tag className="mb-3 h-10 w-10 text-surface-800/20" />
          <p className="text-sm font-medium text-surface-800/40">
            {search
              ? 'Nenhuma categoria encontrada'
              : 'Nenhuma categoria cadastrada'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(cat => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-xl border border-surface-200 bg-white px-4 py-3 shadow-card hover:shadow-elevated transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                  <Tag className="h-4 w-4 text-primary-500" />
                </div>
                <span className="font-medium text-surface-900">{cat.name}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(cat)}
                  className="rounded-lg p-1.5 text-surface-800/40 hover:bg-primary-50 hover:text-primary-600"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setDeletingCategoryId(cat.id)}
                  className="rounded-lg p-1.5 text-surface-800/40 hover:bg-danger-500/5 hover:text-danger-500"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deletingCategoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-surface-200 bg-white p-6 shadow-modal">
            <h2 className="mb-2 text-lg font-semibold text-surface-900">
              Excluir Categoria
            </h2>
            <p className="mb-6 text-sm text-surface-800/70">
              Tem certeza que deseja excluir esta categoria? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingCategoryId(null)}
                className="flex-1 rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-800/60 hover:bg-surface-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  remove(deletingCategoryId);
                  setDeletingCategoryId(null);
                }}
                className="flex-1 rounded-xl bg-danger-500 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:bg-danger-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
