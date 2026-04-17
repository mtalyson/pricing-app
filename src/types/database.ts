export type UnitOfMeasure = 'g' | 'kg' | 'ml' | 'l' | 'un';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Ingredient {
  id: string;
  user_id: string;
  name: string;
  unit_of_measure: UnitOfMeasure;
  purchase_price: number;
  purchase_quantity: number;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  profit_margin_desired: number;
  delivery_fee_percentage: number;
  fixed_costs_allowance: number;
  created_at: string;
}

export interface ProductIngredient {
  id: string;
  product_id: string;
  ingredient_id: string;
  quantity_used: number;
}

// Extended types for UI usage (with joined data)
export interface IngredientWithCost extends Ingredient {
  cost_per_unit: number;
}

export interface ProductIngredientWithDetails extends ProductIngredient {
  ingredient: Ingredient;
  cost: number; // quantity_used * (purchase_price / purchase_quantity)
}

export interface ProductWithDetails extends Product {
  category: Category | null;
  ingredients: ProductIngredientWithDetails[];
  total_recipe_cost: number;
  suggested_price: number;
  expected_profit: number;
}

// Form input types
export interface CategoryFormData {
  name: string;
}

export interface IngredientFormData {
  name: string;
  unit_of_measure: UnitOfMeasure;
  purchase_price: number;
  purchase_quantity: number;
}

export interface ProductFormData {
  name: string;
  category_id: string | null;
  profit_margin_desired: number;
  delivery_fee_percentage: number;
  fixed_costs_allowance: number;
}

export interface ProductIngredientFormData {
  ingredient_id: string;
  quantity_used: number;
}
