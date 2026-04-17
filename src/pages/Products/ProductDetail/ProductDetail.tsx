import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Plus,
  Trash2,
  X,
  DollarSign,
  TrendingUp,
  Truck,
  Warehouse,
  Save,
  Edit2,
} from 'lucide-react';

import { UNIT_SUFFIX } from '~/constants';
import { useCategoriesStore } from '~/stores/categoriesStore';
import { useIngredientsStore } from '~/stores/ingredientsStore';
import { useProductsStore } from '~/stores/productsStore';
import type { UnitOfMeasure } from '~/types/database';
import { formatCurrency } from '~/utils';
import {
  calculateUnitCost,
  calculateIngredientCost,
  calculatePricing,
} from '~/utils/calculations/pricing';

import {
  costParamsSchema,
  defaultCostParamsValues,
  defaultRecipeIngredientValues,
  recipeIngredientSchema,
  editProductSchema,
  type CostParamsValues,
  type RecipeIngredientFormValues,
  type EditProductFormValues,
} from './validation';

export function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    products,
    loading: productsLoading,
    fetch: fetchProducts,
    update,
    productIngredients,
    fetchProductIngredients,
    addProductIngredient,
    removeProductIngredient,
  } = useProductsStore();

  const { ingredients, fetch: fetchIngredients } = useIngredientsStore();
  const { categories, fetch: fetchCategories } = useCategoriesStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingIngredientId, setDeletingIngredientId] = useState<
    string | null
  >(null);

  const {
    register: registerParams,
    handleSubmit: handleParamsSubmit,
    watch: watchParams,
    reset: resetParams,
    formState: { isDirty: paramsDirty, isSubmitting: savingParams },
  } = useForm<CostParamsValues>({
    resolver: zodResolver(costParamsSchema),
    defaultValues: defaultCostParamsValues,
  });

  const {
    register: registerIngredient,
    handleSubmit: handleIngredientSubmit,
    reset: resetIngredient,
    formState: { errors: ingredientErrors },
  } = useForm<RecipeIngredientFormValues>({
    resolver: zodResolver(recipeIngredientSchema),
    defaultValues: defaultRecipeIngredientValues,
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors, isDirty: isEditDirty },
  } = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductSchema),
  });

  const localDeliveryFee = watchParams('delivery_fee_percentage') || 0;
  const localFixedCosts = watchParams('fixed_costs_allowance') || 0;
  const localProfitMargin = watchParams('profit_margin_desired') || 0;

  const [prevProductId, setPrevProductId] = useState<string | undefined>(
    undefined,
  );

  const product = products.find(p => p.id === id);
  const usedIds = new Set(productIngredients.map(pi => pi.ingredient_id));
  const availableIngredients = ingredients.filter(i => !usedIds.has(i.id));

  const recipeCost = useMemo(() => {
    return productIngredients.reduce((total, pi) => {
      const ing = ingredients.find(i => i.id === pi.ingredient_id);

      if (!ing) return total;

      return (
        total +
        calculateIngredientCost({
          purchase_price: ing.purchase_price,
          purchase_quantity: ing.purchase_quantity,
          quantity_used: pi.quantity_used,
        })
      );
    }, 0);
  }, [productIngredients, ingredients]);

  const pricing = useMemo(() => {
    if (!product) return null;

    return calculatePricing({
      total_recipe_cost: recipeCost,
      fixed_costs_allowance: localFixedCosts,
      delivery_fee_percentage: localDeliveryFee,
      profit_margin_desired: localProfitMargin,
    });
  }, [
    recipeCost,
    product,
    localFixedCosts,
    localDeliveryFee,
    localProfitMargin,
  ]);

  const onSaveParams = async (data: CostParamsValues) => {
    if (!product) return;

    await update(product.id, data);
    resetParams(data);
  };

  const onAddIngredient = async (data: RecipeIngredientFormValues) => {
    if (!id) return;

    await addProductIngredient(id, data);

    setShowAddModal(false);
    resetIngredient();
  };

  const onEditProduct = async (data: EditProductFormValues) => {
    if (!product) return;

    await update(product.id, data);
    setShowEditModal(false);
  };

  useEffect(() => {
    if (product?.id !== prevProductId) {
      setPrevProductId(product?.id);

      if (product) {
        resetParams({
          delivery_fee_percentage: product.delivery_fee_percentage,
          fixed_costs_allowance: product.fixed_costs_allowance,
          profit_margin_desired: product.profit_margin_desired,
        });
      }
    }
  }, [product, prevProductId, resetParams]);

  useEffect(() => {
    fetchProducts();

    if (id) fetchProductIngredients(id);

    fetchIngredients();
    fetchCategories();
  }, [
    id,
    fetchProducts,
    fetchProductIngredients,
    fetchIngredients,
    fetchCategories,
  ]);

  if (productsLoading && products.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center py-20">
        <p className="text-surface-800/50">Produto não encontrado.</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-3 cursor-pointer text-sm text-primary-500 hover:text-primary-600"
        >
          ← Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/products')}
          className="mb-3 flex cursor-pointer items-center gap-1 text-sm text-surface-800/50 transition-colors hover:text-primary-500"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">
              {product.name}
            </h1>
            <p className="text-sm text-surface-800/40">
              {categories.find(c => c.id === product.category_id)?.name ??
                'Sem categoria'}
            </p>
          </div>
          <button
            onClick={() => {
              resetEdit({
                name: product.name,
                category_id: product.category_id,
              });
              setShowEditModal(true);
            }}
            className="cursor-pointer flex items-center gap-2 rounded-xl bg-white dark:bg-surface-100 px-3 py-1.5 text-sm font-medium text-surface-700 shadow-sm border border-surface-200 hover:bg-surface-50 dark:hover:bg-surface-200 hover:text-primary-600 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Editar
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-surface-200 bg-white dark:bg-surface-100 p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">
                Ficha Técnica
              </h2>
              <button
                id="add-recipe-ingredient-btn"
                onClick={() => setShowAddModal(true)}
                disabled={availableIngredients.length === 0}
                className="cursor-pointer flex items-center gap-1 rounded-lg bg-primary-50 dark:bg-primary-500/10 px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 transition-colors hover:bg-primary-100 dark:hover:bg-primary-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </button>
            </div>

            {productIngredients.length === 0 ? (
              <p className="py-8 text-center text-sm text-surface-800/30">
                Nenhum ingrediente adicionado à receita.
              </p>
            ) : (
              <div className="space-y-2">
                {productIngredients.map(pi => {
                  const ing = ingredients.find(i => i.id === pi.ingredient_id);
                  if (!ing) return null;
                  const cost = calculateIngredientCost({
                    purchase_price: ing.purchase_price,
                    purchase_quantity: ing.purchase_quantity,
                    quantity_used: pi.quantity_used,
                  });
                  return (
                    <div
                      key={pi.id}
                      className="flex items-center justify-between rounded-xl bg-surface-50 dark:bg-surface-200/50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-surface-900">
                          {ing.name}
                        </p>
                        <p className="text-xs text-surface-800/40">
                          {pi.quantity_used}{' '}
                          {UNIT_SUFFIX[ing.unit_of_measure as UnitOfMeasure]} ×{' '}
                          {formatCurrency(
                            calculateUnitCost(
                              ing.purchase_price,
                              ing.purchase_quantity,
                            ),
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-accent-600">
                          {formatCurrency(cost)}
                        </span>
                        <button
                          onClick={() => setDeletingIngredientId(pi.id)}
                          className="cursor-pointer rounded-lg p-1 text-surface-800/30 hover:bg-danger-500/5 dark:hover:bg-danger-500/10 hover:text-danger-500 dark:hover:text-danger-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between border-t border-surface-200 pt-3 px-4">
                  <span className="text-sm font-medium text-surface-800/60">
                    Custo Total da Receita
                  </span>
                  <span className="text-sm font-bold text-surface-900">
                    {formatCurrency(recipeCost)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleParamsSubmit(onSaveParams)}
            className="rounded-2xl border border-surface-200 bg-white dark:bg-surface-100 p-5 shadow-card"
          >
            <h2 className="mb-4 text-lg font-semibold text-surface-900">
              Parâmetros de Custo
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="delivery-fee"
                  className="mb-1 flex items-center gap-1 text-xs font-medium text-surface-800/60"
                >
                  <Truck className="h-3.5 w-3.5" /> Taxa de Delivery (%)
                </label>
                <input
                  id="delivery-fee"
                  type="number"
                  {...registerParams('delivery_fee_percentage', {
                    setValueAs: (v: string) => (v === '' ? 0 : parseFloat(v)),
                  })}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 dark:bg-surface-200/50 px-3 py-2 text-sm focus:border-primary-300 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="fixed-costs"
                  className="mb-1 flex items-center gap-1 text-xs font-medium text-surface-800/60"
                >
                  <Warehouse className="h-3.5 w-3.5" /> Custos Fixos (R$)
                </label>
                <input
                  id="fixed-costs"
                  type="number"
                  {...registerParams('fixed_costs_allowance', {
                    setValueAs: (v: string) => (v === '' ? 0 : parseFloat(v)),
                  })}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 dark:bg-surface-200/50 px-3 py-2 text-sm focus:border-primary-300 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="profit-margin"
                  className="mb-1 flex items-center gap-1 text-xs font-medium text-surface-800/60"
                >
                  <TrendingUp className="h-3.5 w-3.5" /> Margem de Lucro (%)
                </label>
                <input
                  id="profit-margin"
                  type="number"
                  {...registerParams('profit_margin_desired', {
                    setValueAs: (v: string) => (v === '' ? 0 : parseFloat(v)),
                  })}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 dark:bg-surface-200/50 px-3 py-2 text-sm focus:border-primary-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                id="save-cost-params"
                type="submit"
                disabled={!paramsDirty || savingParams}
                className="cursor-pointer flex items-center gap-2 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 px-5 py-2 text-sm font-medium text-white shadow-md shadow-primary-500/20 transition-all hover:from-primary-400 hover:to-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {savingParams ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar Parâmetros
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-6 rounded-2xl border border-surface-200 bg-linear-to-br from-primary-950 to-primary-900 p-6 text-white shadow-elevated">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
              <DollarSign className="h-5 w-5 text-primary-300" /> Painel de
              Preço
            </h2>

            {pricing && pricing.is_viable ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur">
                  <p className="text-xs font-medium text-primary-200/60 uppercase tracking-wider">
                    Preço Sugerido
                  </p>
                  <p className="mt-1 text-3xl font-bold text-white">
                    {formatCurrency(pricing.suggested_price)}
                  </p>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-primary-200/60">
                      Custo da Receita
                    </span>
                    <span>{formatCurrency(pricing.total_recipe_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-200/60">+ Custos Fixos</span>
                    <span>{formatCurrency(localFixedCosts)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-primary-200/60">= Custo Total</span>
                    <span className="font-medium">
                      {formatCurrency(pricing.cost_with_fixed)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-200/60">
                      Taxa Delivery ({localDeliveryFee}%)
                    </span>
                    <span className="text-warning-500">
                      -{formatCurrency(pricing.delivery_fee_value)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-200/60">Markup</span>
                    <span>{(pricing.markup * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="font-medium text-accent-300">
                      Lucro Esperado
                    </span>
                    <span className="text-lg font-bold text-accent-300">
                      {formatCurrency(pricing.expected_profit)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-danger-500/20 p-4 text-center">
                <p className="text-sm font-medium text-danger-500">
                  Precificação Inviável
                </p>
                <p className="mt-1 text-xs text-primary-200/50">
                  A soma da taxa de delivery e margem de lucro excede 100%.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-surface-200 bg-white dark:bg-surface-100 p-6 shadow-modal">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">
                Adicionar Ingrediente
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetIngredient();
                }}
                className="cursor-pointer rounded-lg p-1 text-surface-800/40 hover:bg-surface-100 dark:hover:bg-surface-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={handleIngredientSubmit(onAddIngredient)}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="recipe-ingredient"
                  className="mb-1 block text-sm font-medium text-surface-800/70"
                >
                  Ingrediente
                </label>
                <select
                  id="recipe-ingredient"
                  {...registerIngredient('ingredient_id')}
                  className={`w-full rounded-xl border bg-surface-50 dark:bg-surface-200/50 px-3 py-2.5 text-sm focus:outline-none ${ingredientErrors.ingredient_id ? 'border-danger-500 focus:border-danger-500' : 'border-surface-200 focus:border-primary-300'}`}
                >
                  <option value="">Selecione...</option>
                  {availableIngredients.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.unit_of_measure})
                    </option>
                  ))}
                </select>
                {ingredientErrors.ingredient_id && (
                  <p className="mt-1 text-xs text-danger-500">
                    {ingredientErrors.ingredient_id.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="recipe-qty"
                  className="mb-1 block text-sm font-medium text-surface-800/70"
                >
                  Quantidade utilizada
                </label>
                <input
                  id="recipe-qty"
                  type="number"
                  {...registerIngredient('quantity_used', {
                    setValueAs: (v: string) => (v === '' ? 0 : parseFloat(v)),
                  })}
                  className={`w-full rounded-xl border bg-surface-50 dark:bg-surface-200/50 px-3 py-2.5 text-sm focus:outline-none ${ingredientErrors.quantity_used ? 'border-danger-500 focus:border-danger-500' : 'border-surface-200 focus:border-primary-300'}`}
                  placeholder="Ex: 200"
                />
                {ingredientErrors.quantity_used && (
                  <p className="mt-1 text-xs text-danger-500">
                    {ingredientErrors.quantity_used.message}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetIngredient();
                  }}
                  className="cursor-pointer flex-1 rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-800/60 hover:bg-surface-100 dark:hover:bg-surface-200"
                >
                  Cancelar
                </button>
                <button
                  id="recipe-ingredient-submit"
                  type="submit"
                  className="cursor-pointer flex-1 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-md"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-surface-200 bg-white dark:bg-surface-100 p-6 shadow-modal">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">
                Editar Produto
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-1 text-surface-800/40 hover:bg-surface-100 dark:hover:bg-surface-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={handleEditSubmit(onEditProduct)}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="edit-name"
                  className="mb-1 block text-sm font-medium text-surface-800/70"
                >
                  Nome do Produto
                </label>
                <input
                  id="edit-name"
                  type="text"
                  {...registerEdit('name')}
                  className={`w-full rounded-xl border bg-surface-50 dark:bg-surface-200/50 px-3 py-2.5 text-sm focus:outline-none ${editErrors.name ? 'border-danger-500 focus:border-danger-500' : 'border-surface-200 focus:border-primary-300'}`}
                />
                {editErrors.name && (
                  <p className="mt-1 text-xs text-danger-500">
                    {editErrors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="edit-category"
                  className="mb-1 block text-sm font-medium text-surface-800/70"
                >
                  Categoria
                </label>
                <select
                  id="edit-category"
                  {...registerEdit('category_id')}
                  className={`w-full rounded-xl border bg-surface-50 dark:bg-surface-200/50 px-3 py-2.5 text-sm focus:outline-none ${editErrors.category_id ? 'border-danger-500 focus:border-danger-500' : 'border-surface-200 focus:border-primary-300'}`}
                >
                  <option value="">Sem categoria</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {editErrors.category_id && (
                  <p className="mt-1 text-xs text-danger-500">
                    {editErrors.category_id.message}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-800/60 hover:bg-surface-100 dark:hover:bg-surface-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isEditDirty}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium shadow-md transition-all ${
                    !isEditDirty
                      ? 'cursor-not-allowed border border-surface-200 bg-surface-200 text-surface-800/60 dark:border-surface-500 dark:bg-surface-600 dark:text-surface-400 shadow-none'
                      : 'cursor-pointer text-white bg-linear-to-br from-primary-500 to-primary-600 shadow-primary-500/20 hover:from-primary-400 hover:to-primary-500'
                  }`}
                >
                  Atualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingIngredientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-surface-200 bg-white dark:bg-surface-100 p-6 shadow-modal">
            <h2 className="mb-2 text-lg font-semibold text-surface-900">
              Remover Ingrediente
            </h2>
            <p className="mb-6 text-sm text-surface-800/70">
              Tem certeza que deseja remover este ingrediente da receita?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingIngredientId(null)}
                className="cursor-pointer flex-1 rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-800/60 transition-colors hover:bg-surface-100 dark:hover:bg-surface-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  removeProductIngredient(deletingIngredientId);
                  setDeletingIngredientId(null);
                }}
                className="cursor-pointer flex-1 rounded-xl bg-danger-500 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:bg-danger-600 transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
