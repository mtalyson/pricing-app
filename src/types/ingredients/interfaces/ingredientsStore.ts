import type { Ingredient, IngredientFormData } from '~/types/database';

export interface IngredientsState {
  ingredients: Ingredient[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (data: IngredientFormData) => Promise<void>;
  update: (id: string, data: IngredientFormData) => Promise<void>;
  remove: (id: string) => Promise<void>;
}
