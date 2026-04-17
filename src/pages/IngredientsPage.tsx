import { useEffect, useState } from 'react';

import { Plus, Trash2, Pencil, ShoppingBasket, X, Search } from 'lucide-react';

import { useIngredientsStore } from '~/stores/ingredientsStore';
import type {
  Ingredient,
  IngredientFormData,
  UnitOfMeasure,
} from '~/types/database';
import { calculateUnitCost } from '~/utils/pricing';

const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  g: 'Gramas (g)',
  kg: 'Quilos (kg)',
  ml: 'Mililitros (ml)',
  l: 'Litros (l)',
  un: 'Unidades (un)',
};

const UNIT_SUFFIX: Record<UnitOfMeasure, string> = {
  g: '/g',
  kg: '/kg',
  ml: '/ml',
  l: '/l',
  un: '/un',
};

export function IngredientsPage() {
  const { ingredients, loading, error, fetch, add, update, remove } =
    useIngredientsStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState<IngredientFormData>({
    name: '',
    unit_of_measure: 'g',
    purchase_price: 0,
    purchase_quantity: 0,
  });

  const filtered = ingredients.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  );

  const formatCurrency = (v: number) => {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      unit_of_measure: 'g',
      purchase_price: 0,
      purchase_quantity: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      unit_of_measure: ingredient.unit_of_measure as UnitOfMeasure,
      purchase_price: ingredient.purchase_price,
      purchase_quantity: ingredient.purchase_quantity,
    });
    setEditingId(ingredient.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (editingId) {
      await update(editingId, formData);
    } else {
      await add(formData);
    }
    resetForm();
  };

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Ingredientes</h1>
          <p className="mt-1 text-sm text-surface-800/50">
            Cadastre e gerencie os ingredientes do seu estoque.
          </p>
        </div>

        <button
          id="ingredient-add-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-500/20 transition-all hover:from-primary-400 hover:to-primary-500 hover:shadow-xl"
        >
          <Plus className="h-4 w-4" />
          Novo Ingrediente
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-surface-800/30" />
        <input
          id="ingredient-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar ingrediente..."
          className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pr-4 pl-10 text-sm text-surface-900 placeholder-surface-800/30 shadow-card transition-colors focus:border-primary-300 focus:ring-0 focus:outline-none"
        />
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
                {editingId ? 'Editar Ingrediente' : 'Novo Ingrediente'}
              </h2>

              <button
                onClick={resetForm}
                className="rounded-lg p-1 text-surface-800/40 hover:bg-surface-100 hover:text-surface-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="ingredient-name"
                  className="mb-1 block text-sm font-medium text-surface-800/70"
                >
                  Nome
                </label>

                <input
                  id="ingredient-name"
                  type="text"
                  value={formData.name}
                  onChange={e =>
                    setFormData(f => ({ ...f, name: e.target.value }))
                  }
                  required
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm text-surface-900 focus:border-primary-300 focus:ring-0 focus:outline-none"
                  placeholder="Ex: Farinha de trigo"
                />
              </div>

              <div>
                <label
                  htmlFor="ingredient-unit"
                  className="mb-1 block text-sm font-medium text-surface-800/70"
                >
                  Unidade de medida
                </label>

                <select
                  id="ingredient-unit"
                  value={formData.unit_of_measure}
                  onChange={e =>
                    setFormData(f => ({
                      ...f,
                      unit_of_measure: e.target.value as UnitOfMeasure,
                    }))
                  }
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm text-surface-900 focus:border-primary-300 focus:ring-0 focus:outline-none"
                >
                  {Object.entries(UNIT_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="ingredient-price"
                    className="mb-1 block text-sm font-medium text-surface-800/70"
                  >
                    Preço de compra (R$)
                  </label>

                  <input
                    id="ingredient-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.purchase_price || ''}
                    onChange={e =>
                      setFormData(f => ({
                        ...f,
                        purchase_price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    required
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm text-surface-900 focus:border-primary-300 focus:ring-0 focus:outline-none"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ingredient-qty"
                    className="mb-1 block text-sm font-medium text-surface-800/70"
                  >
                    Quantidade comprada
                  </label>

                  <input
                    id="ingredient-qty"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.purchase_quantity || ''}
                    onChange={e =>
                      setFormData(f => ({
                        ...f,
                        purchase_quantity: parseFloat(e.target.value) || 0,
                      }))
                    }
                    required
                    className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm text-surface-900 focus:border-primary-300 focus:ring-0 focus:outline-none"
                    placeholder="1000"
                  />
                </div>
              </div>

              {formData.purchase_price > 0 &&
                formData.purchase_quantity > 0 && (
                  <div className="rounded-lg bg-accent-50 p-3 text-sm">
                    <span className="text-accent-700 font-medium">
                      Custo unitário:{' '}
                      {formatCurrency(
                        calculateUnitCost(
                          formData.purchase_price,
                          formData.purchase_quantity,
                        ),
                      )}
                      {UNIT_SUFFIX[formData.unit_of_measure]}
                    </span>
                  </div>
                )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-800/60 transition-colors hover:bg-surface-100"
                >
                  Cancelar
                </button>

                <button
                  id="ingredient-submit"
                  type="submit"
                  className="flex-1 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary-500/20 transition-all hover:from-primary-400 hover:to-primary-500"
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
          <ShoppingBasket className="mb-3 h-10 w-10 text-surface-800/20" />
          <p className="text-sm font-medium text-surface-800/40">
            {search
              ? 'Nenhum ingrediente encontrado'
              : 'Nenhum ingrediente cadastrado'}
          </p>
          {!search && (
            <p className="mt-1 text-xs text-surface-800/30">
              Clique em &quot;Novo Ingrediente&quot; para começar.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50/50">
                <th className="px-4 py-3 text-left font-medium text-surface-800/60">
                  Nome
                </th>
                <th className="px-4 py-3 text-left font-medium text-surface-800/60">
                  Unidade
                </th>
                <th className="px-4 py-3 text-right font-medium text-surface-800/60">
                  Preço Compra
                </th>
                <th className="px-4 py-3 text-right font-medium text-surface-800/60">
                  Qtd. Comprada
                </th>
                <th className="px-4 py-3 text-right font-medium text-surface-800/60">
                  Custo/Unidade
                </th>
                <th className="px-4 py-3 text-right font-medium text-surface-800/60">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-surface-100">
              {filtered.map(ingredient => {
                const unitCost = calculateUnitCost(
                  ingredient.purchase_price,
                  ingredient.purchase_quantity,
                );
                return (
                  <tr
                    key={ingredient.id}
                    className="transition-colors hover:bg-surface-50/50"
                  >
                    <td className="px-4 py-3 font-medium text-surface-900">
                      {ingredient.name}
                    </td>
                    <td className="px-4 py-3 text-surface-800/60">
                      {UNIT_LABELS[ingredient.unit_of_measure as UnitOfMeasure]}
                    </td>
                    <td className="px-4 py-3 text-right text-surface-800/70">
                      {formatCurrency(ingredient.purchase_price)}
                    </td>
                    <td className="px-4 py-3 text-right text-surface-800/70">
                      {ingredient.purchase_quantity}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-accent-600">
                      {formatCurrency(unitCost)}
                      {UNIT_SUFFIX[ingredient.unit_of_measure as UnitOfMeasure]}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(ingredient)}
                          className="rounded-lg p-1.5 text-surface-800/40 transition-colors hover:bg-primary-50 hover:text-primary-600"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(ingredient.id)}
                          className="rounded-lg p-1.5 text-surface-800/40 transition-colors hover:bg-danger-500/5 hover:text-danger-500"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
