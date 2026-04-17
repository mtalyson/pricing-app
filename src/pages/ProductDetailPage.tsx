import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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
} from 'lucide-react';

import { useCategoriesStore } from '~/stores/categoriesStore';
import { useIngredientsStore } from '~/stores/ingredientsStore';
import { useProductsStore } from '~/stores/productsStore';
import type { UnitOfMeasure } from '~/types/database';
import {
  calculateUnitCost,
  calculateIngredientCost,
  calculatePricing,
} from '~/utils/pricing';

const UNIT_SUFFIX: Record<UnitOfMeasure, string> = {
  g: 'g',
  kg: 'kg',
  ml: 'ml',
  l: 'l',
  un: 'un',
};

export function ProductDetailPage() {
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
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [quantityUsed, setQuantityUsed] = useState(0);

  const [localDeliveryFee, setLocalDeliveryFee] = useState(0);
  const [localFixedCosts, setLocalFixedCosts] = useState(0);
  const [localProfitMargin, setLocalProfitMargin] = useState(0);

  const [paramsDirty, setParamsDirty] = useState(false);
  const [savingParams, setSavingParams] = useState(false);

  const [prevProductId, setPrevProductId] = useState<string | undefined>(
    undefined,
  );

  const product = products.find(p => p.id === id);
  const usedIds = new Set(productIngredients.map(pi => pi.ingredient_id));
  const availableIngredients = ingredients.filter(i => !usedIds.has(i.id));

  if (product?.id !== prevProductId) {
    setPrevProductId(product?.id);

    if (product) {
      setLocalDeliveryFee(product.delivery_fee_percentage);
      setLocalFixedCosts(product.fixed_costs_allowance);
      setLocalProfitMargin(product.profit_margin_desired);
      setParamsDirty(false);
    }
  }

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

  const formatCurrency = (v: number) => {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSaveParams = async () => {
    if (!product) return;

    setSavingParams(true);

    await update(product.id, {
      delivery_fee_percentage: localDeliveryFee,
      fixed_costs_allowance: localFixedCosts,
      profit_margin_desired: localProfitMargin,
    });

    setParamsDirty(false);
    setSavingParams(false);
  };

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    await addProductIngredient(id, {
      ingredient_id: selectedIngredientId,
      quantity_used: quantityUsed,
    });

    setShowAddModal(false);
    setSelectedIngredientId('');
    setQuantityUsed(0);
  };

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
          className="mt-3 text-sm text-primary-500 hover:text-primary-600"
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
          className="mb-3 flex items-center gap-1 text-sm text-surface-800/50 hover:text-primary-500 transition-colors"
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
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">
                Ficha Técnica
              </h2>
              <button
                id="add-recipe-ingredient-btn"
                onClick={() => setShowAddModal(true)}
                disabled={availableIngredients.length === 0}
                className="flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100 disabled:opacity-40 disabled:cursor-not-allowed"
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
                      className="flex items-center justify-between rounded-xl bg-surface-50 px-4 py-3"
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
                          onClick={() => removeProductIngredient(pi.id)}
                          className="rounded-lg p-1 text-surface-800/30 hover:text-danger-500"
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

          <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card">
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
                  step="0.1"
                  min="0"
                  max="100"
                  value={localDeliveryFee}
                  onChange={e => {
                    setLocalDeliveryFee(parseFloat(e.target.value) || 0);
                    setParamsDirty(true);
                  }}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-sm focus:border-primary-300 focus:outline-none"
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
                  step="0.01"
                  min="0"
                  value={localFixedCosts}
                  onChange={e => {
                    setLocalFixedCosts(parseFloat(e.target.value) || 0);
                    setParamsDirty(true);
                  }}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-sm focus:border-primary-300 focus:outline-none"
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
                  step="0.1"
                  min="0"
                  max="100"
                  value={localProfitMargin}
                  onChange={e => {
                    setLocalProfitMargin(parseFloat(e.target.value) || 0);
                    setParamsDirty(true);
                  }}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-sm focus:border-primary-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                id="save-cost-params"
                onClick={handleSaveParams}
                disabled={!paramsDirty || savingParams}
                className="flex items-center gap-2 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 px-5 py-2 text-sm font-medium text-white shadow-md shadow-primary-500/20 transition-all hover:from-primary-400 hover:to-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {savingParams ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar Parâmetros
              </button>
            </div>
          </div>
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
          <div className="w-full max-w-sm rounded-2xl border border-surface-200 bg-white p-6 shadow-modal">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">
                Adicionar Ingrediente
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-surface-800/40 hover:bg-surface-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddIngredient} className="space-y-4">
              <div>
                <label
                  htmlFor="recipe-ingredient"
                  className="mb-1 block text-sm font-medium text-surface-800/70"
                >
                  Ingrediente
                </label>
                <select
                  id="recipe-ingredient"
                  value={selectedIngredientId}
                  onChange={e => setSelectedIngredientId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm focus:border-primary-300 focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  {availableIngredients.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.unit_of_measure})
                    </option>
                  ))}
                </select>
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
                  step="0.01"
                  min="0.01"
                  value={quantityUsed || ''}
                  onChange={e =>
                    setQuantityUsed(parseFloat(e.target.value) || 0)
                  }
                  required
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm focus:border-primary-300 focus:outline-none"
                  placeholder="Ex: 200"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-800/60 hover:bg-surface-100"
                >
                  Cancelar
                </button>
                <button
                  id="recipe-ingredient-submit"
                  type="submit"
                  className="flex-1 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-md"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
