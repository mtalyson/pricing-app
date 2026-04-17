import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Package, X, Eye } from 'lucide-react';

import { useCategoriesStore } from '~/stores/categoriesStore';
import { useProductsStore } from '~/stores/productsStore';

import {
  defaultProductFormValues,
  productSchema,
  type ProductFormValues,
} from './validation';

export function Products() {
  const navigate = useNavigate();

  const { products, loading, error, fetch, add, remove } = useProductsStore();
  const { categories, fetch: fetchCategories } = useCategoriesStore();

  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultProductFormValues,
  });

  useEffect(() => {
    fetch();
    fetchCategories();
  }, [fetch, fetchCategories]);

  const resetForm = () => {
    reset();
    setShowForm(false);
  };

  const onSubmit = async (data: ProductFormValues) => {
    const product = await add(data);

    if (product) {
      resetForm();
      navigate(`/products/${product.id}`);
    }
  };

  const getCategoryName = (id: string | null) => {
    if (!id) return '—';

    return categories.find(c => c.id === id)?.name ?? '—';
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Produtos</h1>
          <p className="mt-1 text-sm text-surface-800/50">
            Monte suas fichas técnicas e defina preços.
          </p>
        </div>
        <button
          id="product-add-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-500/20 transition-all hover:from-primary-400 hover:to-primary-500"
        >
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-danger-500/20 bg-danger-500/5 p-3 text-sm text-danger-500">
          {error}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-surface-200 bg-white p-6 shadow-modal">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">
                Novo Produto
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
                  htmlFor="product-name"
                  className="mb-1 block text-sm font-medium text-surface-800/70"
                >
                  Nome do produto
                </label>
                <input
                  id="product-name"
                  type="text"
                  {...register('name')}
                  className={`w-full rounded-xl border bg-surface-50 px-3 py-2.5 text-sm focus:outline-none ${errors.name ? 'border-danger-500 focus:border-danger-500' : 'border-surface-200 focus:border-primary-300'}`}
                  placeholder="Ex: Pizza Margherita"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-danger-500">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="product-category"
                  className="mb-1 block text-sm font-medium text-surface-800/70"
                >
                  Categoria
                </label>
                <select
                  id="product-category"
                  {...register('category_id')}
                  className={`w-full rounded-xl border bg-surface-50 px-3 py-2.5 text-sm focus:outline-none ${errors.category_id ? 'border-danger-500 focus:border-danger-500' : 'border-surface-200 focus:border-primary-300'}`}
                >
                  <option value="">Sem categoria</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-xs text-danger-500">
                    {errors.category_id.message}
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
                  id="product-submit"
                  type="submit"
                  className="flex-1 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary-500/20"
                >
                  Criar Produto
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
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-200 bg-white py-16">
          <Package className="mb-3 h-10 w-10 text-surface-800/20" />
          <p className="text-sm font-medium text-surface-800/40">
            Nenhum produto cadastrado
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(p => (
            <div
              key={p.id}
              className="group rounded-2xl border border-surface-200 bg-white p-5 shadow-card transition-all hover:shadow-elevated"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-surface-900">{p.name}</h3>
                  <p className="text-xs text-surface-800/40">
                    {getCategoryName(p.category_id)}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => navigate(`/products/${p.id}`)}
                    className="rounded-lg p-1.5 text-surface-800/40 hover:bg-primary-50 hover:text-primary-600"
                    title="Ver"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="rounded-lg p-1.5 text-surface-800/40 hover:bg-danger-500/5 hover:text-danger-500"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3 text-xs text-surface-800/50">
                <span>Margem: {p.profit_margin_desired}%</span>
                <span>Delivery: {p.delivery_fee_percentage}%</span>
              </div>
              <button
                onClick={() => navigate(`/products/${p.id}`)}
                className="mt-3 w-full rounded-lg bg-surface-50 px-3 py-2 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
              >
                Abrir Ficha Técnica →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
