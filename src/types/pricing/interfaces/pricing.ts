export interface IngredientCostInput {
  purchase_price: number;
  purchase_quantity: number;
  quantity_used: number;
}

export interface PricingInput {
  total_recipe_cost: number;
  fixed_costs_allowance: number;
  delivery_fee_percentage: number;
  profit_margin_desired: number;
}

export interface PricingResult {
  total_recipe_cost: number;
  cost_with_fixed: number;
  markup: number;
  suggested_price: number;
  delivery_fee_value: number;
  expected_profit: number;
  is_viable: boolean;
}
